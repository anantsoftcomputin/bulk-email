import React, { useState } from 'react';
import { Search, Filter, Upload, Download, Trash2, UserPlus, Tag } from 'lucide-react';
import { useContactStore } from '../../store/contactStore.db';
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
    selectContact,
    selectAll,
    clearSelection,
    deleteContact,
    bulkDelete
  } = useContactStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const filteredContacts = contacts.filter(contact => {
    const searchMatch = !filters.search || 
      contact.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(filters.search.toLowerCase());
    
    const groupMatch = !filters.group || contact.groups?.includes(filters.group);
    const statusMatch = filters.status === 'all' || contact.status === filters.status;
    
    return searchMatch && groupMatch && statusMatch;
  });

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedContacts.length} contacts?`)) {
      bulkDelete(selectedContacts);
      clearSelection();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          <p className="text-gray-500">{contacts.length} total contacts</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            icon={Upload}
            onClick={() => setShowImportModal(true)}
          >
            Import
          </Button>
          <Button 
            variant="outline" 
            icon={Download}
            onClick={() => setShowExportModal(true)}
          >
            Export
          </Button>
          <Button 
            icon={UserPlus}
            onClick={() => setShowAddModal(true)}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          
          <Button variant="outline" icon={Filter}>
            More Filters
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <BulkActions 
          selectedCount={selectedContacts.length}
          onDelete={handleBulkDelete}
          onClearSelection={clearSelection}
        />
      )}

      {/* Contact Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                <th className="text-left p-4 font-semibold text-gray-700">Company</th>
                <th className="text-left p-4 font-semibold text-gray-700">Groups</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => selectContact(contact.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4 text-gray-900">{contact.email}</td>
                  <td className="p-4 text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="p-4 text-gray-600">{contact.company || '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {contact.groups?.map(group => (
                        <span key={group} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {group}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${contact.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      ${contact.status === 'unsubscribed' ? 'bg-gray-100 text-gray-700' : ''}
                      ${contact.status === 'bounced' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingContact(contact)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this contact?')) {
                            deleteContact(contact.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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