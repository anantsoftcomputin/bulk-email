import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useGroupStore } from '../store/groupStore';
import toast from 'react-hot-toast';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, initializeGroups, addGroup, deleteGroup } = useGroupStore();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupContacts, setGroupContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    initializeGroups();
  }, []);

  const handleViewGroup = async (group) => {
    setSelectedGroup(group);
    const contacts = await useGroupStore.getState().getGroupContacts(group.id);
    setGroupContacts(contacts);
    setShowViewModal(true);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Contacts',
      render: (row) => row.contactCount || 0,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleViewGroup(row)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              if (confirm('Delete this group?')) {
                await deleteGroup(row.id);
                await initializeGroups();
                toast.success('Group deleted');
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
        <Button 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
        >
          Create Group
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={groups}
          emptyMessage="No groups yet. Create a group to organize your contacts!"
        />
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Group"
      >
        <div className="space-y-4">
          <Input
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Newsletter Subscribers"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this group"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!formData.name) {
                  toast.error('Group name is required');
                  return;
                }
                await addGroup(formData);
                await initializeGroups();
                toast.success('Group created successfully');
                setShowModal(false);
              }}
            >
              Create Group
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Group Contacts Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedGroup(null);
          setGroupContacts([]);
        }}
        title={`${selectedGroup?.name || 'Group'} - ${groupContacts.length} Contact(s)`}
        size="lg"
      >
        {groupContacts.length > 0 ? (
          <div className="space-y-2">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {groupContacts.map((contact, index) => (
                    <tr key={contact.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.company || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No contacts in this group yet.</p>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
