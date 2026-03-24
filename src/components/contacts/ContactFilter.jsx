import React from 'react';
import { Filter } from 'lucide-react';

const ContactFilter = ({ filters = {}, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={15} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Filters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Name, email, company…"
            value={filters.search || ''}
            onChange={e => update('search', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={e => update('status', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {/* Date from */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Added from</label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={e => update('dateFrom', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Added to</label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={e => update('dateTo', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-100">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200">
              Search: {filters.search}
              <button onClick={() => update('search', '')} className="ml-0.5 hover:text-primary-900">×</button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200 capitalize">
              {filters.status}
              <button onClick={() => update('status', '')} className="ml-0.5 hover:text-primary-900">×</button>
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200">
              {filters.dateFrom || '…'} – {filters.dateTo || '…'}
              <button onClick={() => { update('dateFrom', ''); update('dateTo', ''); }} className="ml-0.5 hover:text-primary-900">×</button>
            </span>
          )}
          <button
            onClick={() => onChange({ search: '', status: '', dateFrom: '', dateTo: '' })}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactFilter;
