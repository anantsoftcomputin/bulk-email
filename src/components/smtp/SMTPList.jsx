import React from 'react';
import { Edit2, Trash2, Zap, Server, CheckCircle } from 'lucide-react';
import { SMTP_PROVIDERS } from '../../utils/constants';

const PROVIDER_BADGE_COLORS = {
  'Free Email':    'bg-sky-50 text-sky-700 border-sky-200',
  'Transactional': 'bg-violet-50 text-violet-700 border-violet-200',
  'Business Email':'bg-amber-50 text-amber-700 border-amber-200',
  'Custom':        'bg-gray-100 text-gray-600 border-gray-200',
};

const SMTPList = ({ configs = [], onSelect, onEdit, onDelete, onTest }) => {
  if (configs.length === 0) {
    return (
      <div className="card text-center py-14">
        <div className="icon-box-lg bg-indigo-50 mx-auto mb-4">
          <Server className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="font-semibold text-gray-700 mb-1">No SMTP configurations</p>
        <p className="text-sm text-gray-400">Add your first SMTP config to start sending emails</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map(config => {
        const preset = SMTP_PROVIDERS.find(p => p.id === config.provider);
        const providerName = preset?.name || config.provider || 'Custom';
        const badgeColor = PROVIDER_BADGE_COLORS[preset?.category] || PROVIDER_BADGE_COLORS['Custom'];

        return (
        <div
          key={config.id}
          className="card hover:border-primary-200 transition-colors cursor-default"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="icon-box bg-indigo-50 flex-shrink-0">
                <Server className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{config.name}</span>
                  {config.isDefault && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                      <CheckCircle size={9} /> Default
                    </span>
                  )}
                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-full border ${badgeColor}`}>
                    {providerName}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {config.host}:{config.port}
                  {config.secure && <span className="ml-1.5 text-xs text-emerald-600 font-medium">TLS</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {config.fromEmail || config.username || '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onTest?.(config)}
                title="Test connection"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Zap size={12} /> Test
              </button>
              <button
                onClick={() => onEdit?.(config)}
                title="Edit"
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete?.(config.id)}
                title="Delete"
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default SMTPList;
