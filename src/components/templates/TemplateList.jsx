import React, { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TemplateEditor } from './TemplateEditor';
import { useTemplateStore } from '../../store/templateStore';

export const TemplateList = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleSave = (template) => {
    if (editingTemplate) {
      updateTemplate(template.id, template);
    } else {
      addTemplate(template);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-500">{templates.length} templates</p>
        </div>
        
        <Button icon={Plus} onClick={() => {
          setEditingTemplate(null);
          setShowEditor(true);
        }}>
          Create Template
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="card group hover:shadow-lg transition-all">
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <div 
                className="p-4 scale-50 origin-top-left"
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
              />
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{template.subject}</p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Edit}
                onClick={() => {
                  setEditingTemplate(template);
                  setShowEditor(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={Copy}
                onClick={() => {
                  addTemplate({
                    ...template,
                    id: Date.now().toString(),
                    name: template.name + ' (Copy)'
                  });
                }}
              >
                Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={Trash2}
                onClick={() => {
                  if (window.confirm('Delete this template?')) {
                    deleteTemplate(template.id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="xl"
      >
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      </Modal>
    </div>
  );
};