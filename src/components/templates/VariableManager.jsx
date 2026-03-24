import React from 'react';
import { Info } from 'lucide-react';
import { EMAIL_VARIABLES } from '../../utils/constants';

const VariableManager = ({ onInsert }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-gray-700">Variables</span>
    </div>
    <div className="flex items-start gap-1.5 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
      <Info size={12} className="flex-shrink-0 mt-0.5" />
      <span>Variables are replaced with contact data when emails are sent.</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {EMAIL_VARIABLES.map(v => (
        <button
          key={v.key}
          onClick={() => onInsert?.(v.key)}
          title={`Insert ${v.label}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono rounded border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
        >
          {v.key}
        </button>
      ))}
    </div>
    <p className="text-[11px] text-gray-400">Click a variable to insert it at the cursor.</p>
  </div>
);

export default VariableManager;
