import React from 'react';
import { Edit2, Trash2, Users, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';

const GroupList = ({ groups = [], onSelect, onEdit, onDelete }) => {
  if (groups.length === 0) {
    return (
      <div className="card text-center py-14">
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-base font-semibold text-gray-700 mb-1">No groups yet</p>
        <p className="text-sm text-gray-400">Create your first group to organize your contacts</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacts</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {groups.map(group => (
            <tr
              key={group.id}
              className="hover:bg-surface-50 cursor-pointer transition-colors"
              onClick={() => onSelect?.(group)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: group.color || '#e0e7ff' }}>
                    <Users size={13} className="text-indigo-700" />
                  </div>
                  <span className="font-medium text-gray-900">{group.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                {group.description || <span className="italic text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                  {group.contactCount ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                {group.createdAt ? format(new Date(group.createdAt), 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => onEdit?.(group)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete?.(group)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupList;
