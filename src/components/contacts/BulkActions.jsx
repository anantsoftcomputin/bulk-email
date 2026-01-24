import React from 'react';
import { Trash2, Tag, UserPlus, X } from 'lucide-react';
import { Button } from '../common/Button';

export const BulkActions = ({ selectedCount, onDelete, onClearSelection }) => {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-medium text-primary-900">
            {selectedCount} contact{selectedCount !== 1 ? 's' : ''} selected
          </p>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={Tag}>
              Add to Group
            </Button>
            <Button size="sm" variant="outline" icon={UserPlus}>
              Update Status
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-primary-700" />
        </button>
      </div>
    </div>
  );
};