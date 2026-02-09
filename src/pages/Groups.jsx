import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Eye, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
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

  const handleCreateGroup = async () => {
    if (!formData.name) {
      toast.error('Audience name is required');
      return;
    }
    await addGroup(formData);
    await initializeGroups();
    toast.success('Audience created successfully');
    setShowModal(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Audiences</h1>
          <p className="text-gray-600 mt-2 font-medium">Organize your contacts into targeted groups</p>
        </div>
        <Button
          icon={<Plus size={20} />}
          onClick={() => {
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="btn-gradient shadow-lg"
        >
          Create Audience
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Audiences</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groups.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FolderOpen className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {groups.reduce((sum, g) => sum + (g.contactCount || 0), 0)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No audiences yet</h3>
          <p className="text-gray-600 mb-6">Create your first audience to organize your contacts</p>
          <Button
            onClick={() => {
              setFormData({ name: '', description: '' });
              setShowModal(true);
            }}
            icon={<Plus size={20} />}
            className="btn-gradient"
          >
            Create Your First Audience
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewGroup(group)}
                      icon={<Eye size={14} />}
                    >
                      
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        if (window.confirm('Delete this audience?')) {
                          await deleteGroup(group.id);
                          await initializeGroups();
                          toast.success('Audience deleted');
                        }
                      }}
                      icon={<Trash2 size={14} />}
                    >
                      
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {group.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {group.contactCount || 0} contact{group.contactCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ name: '', description: '' });
        }}
        title="Create Audience"
      >
        <div className="space-y-4">
          <Input
            label="Audience Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Newsletter Subscribers"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this audience"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} className="btn-gradient">
              Create Audience
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
        title={`${selectedGroup?.name || 'Audience'} - ${groupContacts.length} Contact(s)`}
        size="lg"
      >
        {groupContacts.length > 0 ? (
          <div className="space-y-2">
            <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {groupContacts.map((contact, index) => (
                    <tr 
                      key={contact.id} 
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.company || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No contacts in this audience yet.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
