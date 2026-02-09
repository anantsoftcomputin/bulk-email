import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Eye, FileText, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import EmailBuilder from '../components/templates/EmailBuilder';
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
    initializeTemplates();
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleDuplicate = async (id) => {
    await duplicateTemplate(id);
    toast.success('Template duplicated successfully!');
    initializeTemplates();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
      toast.success('Template deleted successfully!');
      initializeTemplates();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Email Templates</h1>
          <p className="text-gray-600 mt-2 font-medium">Create and manage your email templates</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTemplate(null);
            setShowEditor(true);
          }}
          icon={<Plus size={20} />}
          className="btn-gradient shadow-lg"
        >
          Create Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Templates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{templates.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6">Create your first email template to get started</p>
          <Button
            onClick={() => {
              setSelectedTemplate(null);
              setShowEditor(true);
            }}
            icon={<Sparkles size={20} />}
            className="btn-gradient"
          >
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.subject}</p>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.variables.slice(0, 3).map((variable, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md"
                      >
                        {variable}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                        +{template.variables.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mb-4">
                  Created {format(new Date(template.createdAt), 'MMM dd, yyyy')}
                </p>
                
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                    icon={<Edit size={14} />}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(template.id)}
                    icon={<Copy size={14} />}
                  >
                    
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(template.id)}
                    icon={<Trash2 size={14} />}
                  >
                    
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Template Builder */}
      {showEditor && (
        <EmailBuilder
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default Templates;
