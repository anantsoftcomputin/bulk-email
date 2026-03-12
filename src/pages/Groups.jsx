import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Eye, FolderOpen, X } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { useGroupStore } from '../store/groupStore';
import toast from 'react-hot-toast';

const Groups = () => {
  const { groups, initializeGroups, addGroup, deleteGroup } = useGroupStore();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupContacts, setGroupContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { initializeGroups(); }, []);

  const handleViewGroup = async (group) => {
    setSelectedGroup(group);
    const contacts = await useGroupStore.getState().getGroupContacts(group.id);
    setGroupContacts(contacts);
    setShowViewModal(true);
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) { toast.error('Audience name is required'); return; }
    await addGroup(formData);
    await initializeGroups();
    toast.success('Audience created');
    setShowModal(false);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`Delete audience "${group.name}"?`)) return;
    await deleteGroup(group.id);
    await initializeGroups();
    toast.success('Audience deleted');
  };

  const totalMembers = groups.reduce((s, g) => s + (g.contactCount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Audiences</h1>
          <p className="page-subtitle">Organize contacts into targeted groups for campaigns</p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', description: '' }); setShowModal(true); }}
          className="btn-gradient self-start sm:self-auto"
        >
          <Plus size={15} /> Create Audience
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Audiences', value: groups.length,   icon: FolderOpen, iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
          { label: 'Total Members',   value: totalMembers,    icon: Users,      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`icon-box ${s.iconBg} mb-3`}>
                <Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Audience Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">No audiences yet</p>
          <p className="text-sm text-gray-400 mb-5">Create your first audience to organize your contacts</p>
          <button
            onClick={() => { setFormData({ name: '', description: '' }); setShowModal(true); }}
            className="btn-primary mx-auto"
          >
            <Plus size={14} /> Create Audience
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="card hover:border-primary-200 hover:-translate-y-0.5 cursor-default group"
              style={{ transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="icon-box-lg bg-indigo-50">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewGroup(group)}
                    title="View contacts"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(group)}
                    title="Delete audience"
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                {group.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {group.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {group.contactCount || 0} contact{group.contactCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setFormData({ name: '', description: '' }); }}
        title="Create Audience"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Audience Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Newsletter Subscribers"
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this audience (optional)"
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button onClick={handleCreateGroup} className="btn-primary text-sm px-4 py-2">
              Create Audience
            </button>
          </div>
        </div>
      </Modal>

      {/* View Contacts Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`${selectedGroup?.name || 'Audience'} — ${groupContacts.length} Contacts`}
        size="lg"
      >
        {groupContacts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No contacts in this audience yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hidden md:table-cell">Company</th>
                </tr>
              </thead>
              <tbody>
                {groupContacts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-gray-900">
                      {`${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}
                    </td>
                    <td className="text-gray-600">{c.email}</td>
                    <td className="hidden md:table-cell text-gray-500">{c.company || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
