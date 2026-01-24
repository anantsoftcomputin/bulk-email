import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Search, Filter, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import ContactForm from '../components/contacts/ContactForm';
import ContactImport from '../components/contacts/ContactImport';
import { useContactStore } from '../store/contactStore.db';
import { useGroupStore } from '../store/groupStore';
import { exportToCSV } from '../utils/exportHelpers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Contacts = () => {
  const { contacts, filters, setFilters, initializeContacts, deleteContact, updateContact } = useContactStore();
  const { groups, initializeGroups } = useGroupStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState('');

  useEffect(() => {
    initializeContacts();
    initializeGroups();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        contact.email?.toLowerCase().includes(search) ||
        contact.firstName?.toLowerCase().includes(search) ||
        contact.lastName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
      setSelectAll(false);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cid => cid !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedContacts.length} contact(s)?`)) {
      for (const id of selectedContacts) {
        await deleteContact(id);
      }
      setSelectedContacts([]);
      setSelectAll(false);
      initializeContacts();
    }
  };

  const handleAssignToGroup = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select contacts first');
      return;
    }
    if (!selectedGroupForAssignment) {
      toast.error('Please select a group');
      return;
    }
    
    const groupId = parseInt(selectedGroupForAssignment);
    for (const contactId of selectedContacts) {
      await updateContact(contactId, { groupId });
    }
    
    setSelectedContacts([]);
    setSelectAll(false);
    setShowGroupModal(false);
    setSelectedGroupForAssignment('');
    await initializeContacts();
    await initializeGroups();
    toast.success(`Assigned ${selectedContacts.length} contact(s) to group`);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedContacts.includes(row.id)}
          onChange={() => handleSelectContact(row.id)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      ),
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => (
        <div className="font-medium">{`${row.firstName} ${row.lastName || ''}`}</div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div className="text-sm text-gray-600">{row.email}</div>
      ),
    },
    {
      header: 'Company',
      accessor: 'company',
      render: (row) => row.company || '-',
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => row.phone || '-',
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedContact(row);
              setShowAddModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this contact?')) {
                deleteContact(row.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    exportToCSV(filteredContacts, 'contacts.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          {selectedContacts.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedContacts.length} contact(s) selected
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {selectedContacts.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowGroupModal(true)}
                icon={<Users className="w-4 h-4" />}
              >
                Assign to Group ({selectedContacts.length})
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
              >
                Delete Selected ({selectedContacts.length})
              </Button>
            </>
          )}
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setShowImportModal(true)}
          >
            Import
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedContact(null);
              setShowAddModal(true);
            }}
          >
            Add Contact
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search contacts..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            icon={<Search className="w-5 h-5 text-gray-400" />}
          />
        </div>

        <Table
          columns={columns}
          data={filteredContacts}
          emptyMessage="No contacts found. Add your first contact to get started!"
        />

        {filteredContacts.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </div>
        )}
      </Card>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedContact(null);
          initializeContacts(); // Refresh contacts when modal closes
        }}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
      >
        <ContactForm
          contact={selectedContact}
          onClose={() => {
            setShowAddModal(false);
            setSelectedContact(null);
            initializeContacts(); // Refresh contacts when form closes
          }}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          initializeContacts(); // Refresh contacts after import
        }}
        title="Import Contacts"
        size="lg"
      >
        <ContactImport 
          onClose={() => {
            setShowImportModal(false);
            initializeContacts(); // Refresh contacts after import
          }} 
        />
      </Modal>

      {/* Assign to Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          setSelectedGroupForAssignment('');
        }}
        title={`Assign ${selectedContacts.length} Contact(s) to Group`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            <select
              value={selectedGroupForAssignment}
              onChange={(e) => setSelectedGroupForAssignment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.contactCount || 0} contacts)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowGroupModal(false);
                setSelectedGroupForAssignment('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignToGroup}>
              Assign to Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
