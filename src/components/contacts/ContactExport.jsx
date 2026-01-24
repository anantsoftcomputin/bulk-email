import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useContactStore } from '../../store/contactStore.db';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

export const ContactExport = ({ onClose }) => {
  const { contacts, selectedContacts } = useContactStore();
  const [format, setFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    email: true,
    firstName: true,
    lastName: true,
    company: true,
    phone: true,
    status: true,
    groups: true
  });

  const handleExport = () => {
    const exportContacts = selectedContacts.length > 0
      ? contacts.filter(c => selectedContacts.includes(c.id))
      : contacts;

    if (exportContacts.length === 0) {
      toast.error('No contacts to export');
      return;
    }

    // Filter fields
    const data = exportContacts.map(contact => {
      const filtered = {};
      Object.entries(includeFields).forEach(([field, include]) => {
        if (include && contact[field] !== undefined) {
          filtered[field] = Array.isArray(contact[field]) 
            ? contact[field].join(', ') 
            : contact[field];
        }
      });
      return filtered;
    });

    if (format === 'csv') {
      const csv = Papa.unparse(data);
      downloadFile(csv, 'contacts.csv', 'text/csv');
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
      XLSX.writeFile(wb, 'contacts.xlsx');
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, 'contacts.json', 'application/json');
    }

    toast.success(`Exported ${exportContacts.length} contacts`);
    onClose();
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['csv', 'xlsx', 'json'].map(fmt => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`
                px-4 py-3 rounded-lg border-2 font-medium uppercase transition-all
                ${format === fmt 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Include Fields
        </label>
        <div className="space-y-2">
          {Object.keys(includeFields).map(field => (
            <label key={field} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeFields[field]}
                onChange={(e) => setIncludeFields({
                  ...includeFields,
                  [field]: e.target.checked
                })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="capitalize">{field}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          {selectedContacts.length > 0 
            ? `Exporting ${selectedContacts.length} selected contacts`
            : `Exporting all ${contacts.length} contacts`
          }
        </p>
      </div>

      <div className="flex gap-3">
        <Button icon={Download} onClick={handleExport} className="flex-1">
          Export Contacts
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};