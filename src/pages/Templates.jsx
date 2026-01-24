import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import AdvancedTemplateEditor from '../components/templates/AdvancedTemplateEditor';
import { useTemplateStore } from '../store/templateStore.db';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Templates = () => {
  const { templates, initializeTemplates, deleteTemplate, addTemplate, updateTemplate, duplicateTemplate } = useTemplateStore();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    initializeTemplates();
  }, []);

  const handleSaveTemplate = async (templateData) => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id, templateData);
    } else {
      await addTemplate(templateData);
    }
    initializeTemplates(); // Refresh the list
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.subject}</div>
        </div>
      ),
    },
    {
      header: 'Variables',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.variables?.slice(0, 3).map((v, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {v}
            </span>
          ))}
          {row.variables?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{row.variables.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedTemplate(row);
              setShowEditor(true);
            }}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              duplicateTemplate(row.id);
              toast.success('Template duplicated');
            }}
            icon={<Copy className="w-4 h-4" />}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm('Delete this template?')) {
                deleteTemplate(row.id);
                toast.success('Template deleted');
              }
            }}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedTemplate(null);
            setShowEditor(true);
          }}
        >
          Create Template
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={templates}
          emptyMessage="No templates yet. Create your first template!"
        />
      </Card>

      <Modal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setSelectedTemplate(null);
        }}
        title={selectedTemplate ? 'Edit Template' : 'Create Template'}
        size="fullscreen"
      >
        <div className="h-[calc(100vh-200px)]">
          <AdvancedTemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onClose={() => {
              setShowEditor(false);
              setSelectedTemplate(null);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Templates;
