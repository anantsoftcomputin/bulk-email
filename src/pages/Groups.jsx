import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, ArrowLeft } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import GroupList from '../components/groups/GroupList';
import GroupForm from '../components/groups/GroupForm';
import GroupContacts from '../components/groups/GroupContacts';
import GroupStats from '../components/groups/GroupStats';
import { useGroupStore } from '../store/groupStore';
import toast from 'react-hot-toast';

const Groups = () => {
  const { groups, isLoading, initializeGroups, addGroup, updateGroup, deleteGroup } = useGroupStore();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => { initializeGroups(); }, []);

  const handleSave = async (formData) => {
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData);
        toast.success('Group updated');
      } else {
        await addGroup(formData);
        toast.success('Group created');
      }
      await initializeGroups();
      setShowFormModal(false);
      setEditingGroup(null);
    } catch {
      toast.error('Failed to save group');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowFormModal(true);
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`Delete group "${group.name}"? This cannot be undone.`)) return;
    try {
      await deleteGroup(group.id);
      await initializeGroups();
      toast.success('Group deleted');
      if (selectedGroup?.id === group.id) setSelectedGroup(null);
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const totalMembers = groups.reduce((s, g) => s + (g.contactCount || 0), 0);

  // ── Group detail view ──────────────────────────────────────────
  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup.id) || selectedGroup;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedGroup(null)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={15} /> Back to groups
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{group.name}</h1>
            <p className="page-subtitle">{group.description || 'No description'}</p>
          </div>
          <button
            onClick={() => handleEdit(group)}
            className="btn-secondary text-sm"
          >
            Edit Group
          </button>
        </div>

        <GroupStats group={group} />

        <div className="card">
          <GroupContacts groupId={group.id} groupName={group.name} />
        </div>
      </div>
    );
  }

  // ── Main list view ─────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Audiences</h1>
          <p className="page-subtitle">Organize contacts into targeted groups for campaigns</p>
        </div>
        <button
          onClick={() => { setEditingGroup(null); setShowFormModal(true); }}
          className="btn-gradient self-start sm:self-auto"
        >
          <Plus size={15} /> Create Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Groups',  value: groups.length,   icon: FolderOpen, iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
          { label: 'Total Members', value: totalMembers,    icon: FolderOpen, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Group list */}
      <GroupList
        groups={groups}
        onSelect={setSelectedGroup}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingGroup(null); }}
        title={editingGroup ? 'Edit Group' : 'Create Group'}
        size="sm"
      >
        <GroupForm
          group={editingGroup}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingGroup(null); }}
        />
      </Modal>
    </div>
  );
};

export default Groups;
