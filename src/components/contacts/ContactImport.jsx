import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useContactStore } from '../../store/contactStore.db';
import { useGroupStore } from '../../store/groupStore';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ContactImport = ({ onClose }) => {
  const { addContact } = useContactStore();
  const { groups, initializeGroups } = useGroupStore();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [mapping, setMapping] = useState({});
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    initializeGroups();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        complete: (results) => {
          setPreview(results.data);
          autoMapFields(results.meta.fields);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const headers = jsonData[0];
        const rows = jsonData.slice(1, 6).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        setPreview(rows);
        autoMapFields(headers);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const autoMapFields = (fields) => {
    const mapping = {};
    const fieldMap = {
      email: ['email', 'e-mail', 'email address'],
      firstName: ['first name', 'firstname', 'first', 'fname'],
      lastName: ['last name', 'lastname', 'last', 'lname'],
      company: ['company', 'organization', 'org'],
      phone: ['phone', 'telephone', 'mobile', 'cell']
    };

    fields.forEach(field => {
      const lowerField = field.toLowerCase();
      for (const [key, variations] of Object.entries(fieldMap)) {
        if (variations.some(v => lowerField.includes(v))) {
          mapping[field] = key;
          break;
        }
      }
    });

    setMapping(mapping);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let allData = [];

    try {
      if (fileExtension === 'csv') {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              allData = results.data;
              resolve();
            }
          });
        });
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        allData = jsonData;
      }

      // Map and import contacts
      let imported = 0;
      let skipped = 0;

      for (const row of allData) {
        const contact = {};
        let hasEmail = false;

        Object.entries(mapping).forEach(([sourceField, targetField]) => {
          if (row[sourceField]) {
            contact[targetField] = row[sourceField];
            if (targetField === 'email') hasEmail = true;
          }
        });

        if (hasEmail && contact.email) {
          await addContact({
            ...contact,
            status: 'active',
            groupId: selectedGroupId ? parseInt(selectedGroupId) : null,
          });
          imported++;
        } else {
          skipped++;
        }
      }

      toast.success(`Imported ${imported} contacts${skipped > 0 ? `, skipped ${skipped}` : ''}`);
      onClose();
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="text-gray-400 mb-4" size={48} />
          <p className="text-lg font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            CSV or Excel files only
          </p>
        </label>
      </div>

      {file && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <FileText className="text-blue-600 mt-1" size={20} />
          <div className="flex-1">
            <p className="font-medium text-blue-900">{file.name}</p>
            <p className="text-sm text-blue-700">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      )}

      {/* Field Mapping */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Map Fields</h3>
          
          {/* Group Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add all contacts to group (optional)
            </label>
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              All imported contacts will be added to the selected group
            </p>
          </div>

          <div className="space-y-3">
            {Object.keys(preview[0]).map(field => (
              <div key={field} className="flex items-center gap-4">
                <div className="flex-1 font-medium text-gray-700">{field}</div>
                <div className="text-gray-400">→</div>
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Skip this field</option>
                  <option value="email">Email</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="company">Company</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-4 py-2 text-gray-600">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleImport}
          disabled={!file || importing}
          loading={importing}
          className="flex-1"
        >
          Import Contacts
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ContactImport;