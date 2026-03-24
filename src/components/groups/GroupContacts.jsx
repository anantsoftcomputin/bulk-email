import React, { useState, useEffect } from 'react';
import { Search, UserMinus, Users } from 'lucide-react';
import { dbHelpers } from '../../db/database';
import toast from 'react-hot-toast';

const StatusPill = ({ status }) => {
  const map = {
    active:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive:     'bg-gray-50 text-gray-600 border-gray-200',
    unsubscribed: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${map[status] || map.inactive}`}>
      {status}
    </span>
  );
};

const GroupContacts = ({ groupId, groupName }) => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getGroupContacts(groupId);
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (groupId) load(); }, [groupId]);

  const handleRemove = async (contact) => {
    try {
      await dbHelpers.updateContact(contact.id, { groupId: null });
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast.success(`${contact.firstName || contact.email} removed from group`);
    } catch {
      toast.error('Failed to remove contact');
    }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.email?.toLowerCase().includes(q) ||
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-2 border-primary-200 rounded-full animate-spin border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-indigo-600" />
          <span className="text-sm font-semibold text-gray-700">{groupName}</span>
          <span className="text-xs text-gray-400">({contacts.length} contacts)</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts…"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No contacts found</p>
      ) : (
        <div className="overflow-auto max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-center px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-surface-50">
                  <td className="px-2 py-2 font-medium text-gray-900">
                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-2 py-2 text-gray-500 truncate max-w-[180px]">{c.email}</td>
                  <td className="px-2 py-2 text-center"><StatusPill status={c.status} /></td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => handleRemove(c)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Remove from group"
                    >
                      <UserMinus size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupContacts;
