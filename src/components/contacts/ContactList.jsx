import React, { useState, useEffect } from 'react';
import { Search, Filter, Upload, Download, Trash2, UserPlus, Tag, Mail, Building2, Users, MoreVertical, Edit2, RefreshCw } from 'lucide-react';
import { useContactStore } from '../../store/contactStore.db';
import { useGroupStore } from '../../store/groupStore';
import { Button } from '../common/Button';
import { ContactForm } from './ContactForm';
import { ContactImport } from './ContactImport';
import { ContactExport } from './ContactExport';
import { BulkActions } from './BulkActions';
import { Modal } from '../common/Modal';

export const ContactList = () => {
  const { 
    contacts, 
    selectedContacts, 
    filters, 
    setFilters,
    setSelectedContacts,
    deleteContact: deleteContactFn,
    bulkDeleteContacts,
    initializeContacts
  } = useContactStore();

  const { groups, initializeGroups } = useGroupStore();
  
  useEffect(() => {
    initializeContacts();
    initializeGroups();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  // Get group name by ID
  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || null;
  };

  const filteredContacts = contacts.filter(contact => {
    const searchMatch = !filters.search || 
      contact.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.company?.toLowerCase().includes(filters.search.toLowerCase());
    
    const groupMatch = filterGroup === 'all' || contact.groupId === parseInt(filterGroup);
    const statusMatch = filterStatus === 'all' || contact.status === filterStatus;
    
    return searchMatch && groupMatch && statusMatch;
  });

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedContacts.length} contacts?`)) {
      await bulkDeleteContacts(selectedContacts);
    }
  };

  const deleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      await deleteContactFn(id);
    }
  };

  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    unsubscribed: contacts.filter(c => c.status === 'unsubscribed').length,
    bounced: contacts.filter(c => c.status === 'bounced').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Contacts</h2>
          <p className="text-gray-600 mt-1">Manage and organize your email contacts</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            icon={<Upload size={18} />}
            onClick={() => setShowImportModal(true)}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            Import
          </Button>
          <Button 
            variant="outline" 
            icon={<Download size={18} />}
            onClick={() => setShowExportModal(true)}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            Export
          </Button>
          <Button 
            icon={<UserPlus size={18} />}
            onClick={() => setShowAddModal(true)}
            className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <Mail className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Unsubscribed</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{stats.unsubscribed.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-400/30 group-hover:scale-110 transition-transform">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-200 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Bounced</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.bounced.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
              <Mail className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium placeholder:text-gray-400"
            />
          </div>
          
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px] transition-all font-semibold text-sm text-gray-700 bg-white"
          >
            <option value="all">All Audiences</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px] transition-all font-semibold text-sm text-gray-700 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          
          <Button 
            variant="outline" 
            icon={<RefreshCw size={18} />}
            onClick={() => {
              setFilters({ search: '' });
              setFilterStatus('all');
              setFilterGroup('all');
            }}
            className="shadow-sm hover:shadow-md transition-shadow font-semibold"
          >
            Reset
          </Button>
        </div>
        
        {filteredContacts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
            <span className="text-gray-600">Showing </span>
            <span className="font-bold text-blue-600">{filteredContacts.length}</span>
            <span className="text-gray-600"> of </span>
            <span className="font-bold text-gray-900">{stats.total}</span>
            <span className="text-gray-600"> contacts</span>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-5 shadow-md animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="text-white" size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-600 font-medium">Choose an action to apply to selected contacts</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="danger" 
                icon={<Trash2 size={18} />}
                onClick={handleBulkDelete}
                size="md"
                className="shadow-lg font-semibold"
              >
                Delete Selected
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedContacts([])}
                size="md"
                className="font-semibold"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th className="text-left p-5 w-12">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="text-left p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Email Address</th>
                <th className="text-left p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Full Name</th>
                <th className="text-left p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Company</th>
                <th className="text-left p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Audience</th>
                <th className="text-left p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right p-5 font-bold text-gray-700 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="text-gray-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
                      <p className="text-gray-600 mb-4">
                        {filters.search || filterStatus !== 'all' || filterGroup !== 'all' 
                          ? 'Try adjusting your filters' 
                          : 'Get started by adding your first contact'}
                      </p>
                      {!filters.search && filterStatus === 'all' && filterGroup === 'all' && (
                        <Button 
                          icon={<UserPlus size={18} />}
                          onClick={() => setShowAddModal(true)}
                        >
                          Add Your First Contact
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, index) => (
                  <tr key={contact.id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="p-5">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="text-blue-600" size={16} />
                        </div>
                        <span className="text-gray-900 font-medium text-sm">{contact.email}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-semibold text-gray-900 text-sm">
                        {contact.firstName} {contact.lastName}
                      </div>
                    </td>
                    <td className="p-5">
                      {contact.company ? (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{contact.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-5">
                      {contact.groupId ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                          <Tag size={12} />
                          {getGroupName(contact.groupId) || 'Unknown'}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">No audience</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`
                        inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
                        ${contact.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ''}
                        ${contact.status === 'unsubscribed' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                        ${contact.status === 'bounced' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                      `}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Edit contact"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddModal || !!editingContact}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
      >
        <ContactForm
          contact={editingContact}
          onClose={() => {
            setShowAddModal(false);
            setEditingContact(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Contacts"
        size="lg"
      >
        <ContactImport onClose={() => setShowImportModal(false)} />
      </Modal>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Contacts"
      >
        <ContactExport onClose={() => setShowExportModal(false)} />
      </Modal>
    </div>
  );
};