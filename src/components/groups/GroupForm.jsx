import React, { useState, useEffect } from 'react';

const PRESET_COLORS = ['#e0e7ff', '#d1fae5', '#fef3c7', '#fee2e2', '#ede9fe', '#e0f2fe'];

const GroupForm = ({ group, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        color: group.color || PRESET_COLORS[0],
      });
    }
  }, [group]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Group name is required'); return; }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => { setFormData(f => ({ ...f, name: e.target.value })); setError(''); }}
          placeholder="e.g. Newsletter subscribers"
          className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
          rows={3}
          placeholder="Optional description…"
          className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(f => ({ ...f, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                formData.color === color ? 'border-gray-700 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-sm">
          {group ? 'Save Changes' : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

export default GroupForm;
