import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search, Users, Trash2, Edit2, UserCheck, X } from 'lucide-react';
import Modal from '../components/common/Modal';
import ContactForm from '../components/contacts/ContactForm';
import ContactImport from '../components/contacts/ContactImport';
import { useContactStore } from '../store/contactStore.db';
import { useGroupStore } from '../store/groupStore';
import { exportToCSV } from '../utils/exportHelpers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StatusPill = ({ status }) => {
  const map = {
    active:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive:     'bg-gray-50 text-gray-600 border-gray-200',
    unsubscribed: 'bg-rose-50 text-rose-700 border-rose-200',
    bounced:      'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${map[status] || map.inactive}`}>
      {status}
    </span>
  );
};

const Contacts = () => {
  const { contacts, filters, setFilters, initializeContacts, deleteContact, updateContact } = useContactStore();
  const { groups, initializeGroups, refreshContactCounts } = useGroupStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    initializeContacts();
    initializeGroups();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return (
      contact.email?.toLowerCase().includes(s) ||
      contact.firstName?.toLowerCase().includes(s) ||
      contact.lastName?.toLowerCase().includes(s) ||
      contact.company?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const pagedContacts = filteredContacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [filters.search]);

  const handleSelectAll = () => {
    if (selectAll) { setSelectedContacts([]); setSelectAll(false); }
    else { setSelectedContacts(filteredContacts.map(c => c.id)); setSelectAll(true); }
  };

  const handleSelectContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) return;
    if (!window.confirm(`Delete ${selectedContacts.length} contact(s)? This cannot be undone.`)) return;
    for (const id of selectedContacts) await deleteContact(id);
    setSelectedContacts([]); setSelectAll(false);
    await initializeContacts();
    toast.success(`Deleted ${selectedContacts.length} contact(s)`);
  };

  const handleAssignToGroup = async () => {
    if (!selectedContacts.length) { toast.error('Please select contacts first'); return; }
    if (!selectedGroupForAssignment) { toast.error('Please select a group'); return; }
    try {
      await Promise.all(selectedContacts.map(id => updateContact(id, { groupId: selectedGroupForAssignment })));
      await new Promise(r => setTimeout(r, 300));
      await initializeContacts();
      await refreshContactCounts();
      setSelectedContacts([]); setSelectAll(false);
      setShowGroupModal(false); setSelectedGroupForAssignment('');
      toast.success(`Assigned ${selectedContacts.length} contact(s) to group`);
    } catch (e) { toast.error('Failed to assign contacts'); }
  };

  const handleExport = () => exportToCSV(filteredContacts, 'contacts.csv');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">
            {contacts.length.toLocaleString()} contact{contacts.length !== 1 ? 's' : ''}
            {selectedContacts.length > 0 && (
              <span className="ml-2 text-primary-600 font-medium">· {selectedContacts.length} selected</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedContacts.length > 0 && (
            <>
              <button
                onClick={() => setShowGroupModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <UserCheck size={13} /> Assign to Group ({selectedContacts.length})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={13} /> Delete ({selectedContacts.length})
              </button>
            </>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Upload size={13} /> Import
          </button>
          <button
            onClick={() => { setSelectedContact(null); setShowAddModal(true); }}
            className="btn-gradient text-xs px-4 py-2"
          >
            <Plus size={13} /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company…"
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="input-field pl-10"
          />
          {filters.search && (
            <button onClick={() => setFilters({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th className="hidden md:table-cell">Company</th>
                <th className="hidden lg:table-cell">Phone</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Added</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {filters.search ? `No contacts matching "${filters.search}"` : 'No contacts yet. Add your first contact!'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagedContacts.map(contact => (
                  <tr key={contact.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary-700">
                            {contact.firstName?.[0]?.toUpperCase() || contact.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-600">{contact.email}</td>
                    <td className="hidden md:table-cell text-gray-500">{contact.company || '—'}</td>
                    <td className="hidden lg:table-cell text-gray-500">{contact.phone || '—'}</td>
                    <td><StatusPill status={contact.status || 'active'} /></td>
                    <td className="hidden sm:table-cell text-gray-400 text-xs">
                      {contact.createdAt ? format(new Date(contact.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedContact(contact); setShowAddModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit contact"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this contact?')) deleteContact(contact.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-surface-100 mt-4">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredContacts.length)} of {filteredContacts.length.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : page - 3 + i);
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${pg === page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-surface-50 border border-surface-200'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-surface-200 rounded-lg hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Simple count when no pagination */}
        {totalPages <= 1 && filteredContacts.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-surface-100">
            {filteredContacts.length.toLocaleString()} contact{filteredContacts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSelectedContact(null); initializeContacts(); }}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
      >
        <ContactForm
          contact={selectedContact}
          onClose={() => { setShowAddModal(false); setSelectedContact(null); initializeContacts(); }}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); initializeContacts(); }}
        title="Import Contacts"
        size="lg"
      >
        <ContactImport onClose={() => { setShowImportModal(false); initializeContacts(); }} />
      </Modal>

      {/* Assign to Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => { setShowGroupModal(false); setSelectedGroupForAssignment(''); }}
        title={`Assign ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''} to Group`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Group</label>
            <select
              value={selectedGroupForAssignment}
              onChange={(e) => setSelectedGroupForAssignment(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a group…</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.contactCount || 0} contacts)
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button onClick={handleAssignToGroup} className="btn-primary text-sm px-4 py-2">
              Assign to Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
