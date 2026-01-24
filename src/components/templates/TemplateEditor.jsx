import React, { useState, useRef } from 'react';
import { Bold, Italic, Link, Image, Code, Eye, Save } from 'lucide-react';
import { Button } from '../common/Button';
import { EMAIL_VARIABLES } from '../../utils/constants';
import toast from 'react-hot-toast';

export const TemplateEditor = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef(null);

  const insertVariable = (variable) => {
    const editor = editorRef.current;
    if (editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setHtmlContent(before + variable + after);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleSave = () => {
    if (!name || !subject || !htmlContent) {
      toast.error('Please fill in all required fields');
      return;
    }

    const templateData = {
      id: template?.id || Date.now().toString(),
      name,
      subject,
      htmlContent,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(templateData);
    toast.success('Template saved successfully');
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Template Name & Subject */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Monthly Newsletter Template"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Subject Line *
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line for this template"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Variables Panel */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insert Variables</h4>
        <div className="flex flex-wrap gap-2">
          {EMAIL_VARIABLES.map(variable => (
            <button
              key={variable.key}
              onClick={() => insertVariable(variable.key)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              {variable.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Tabs */}
      <div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              !showPreview 
                ? 'bg-white border-t-2 border-x-2 border-primary-600 text-primary-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code size={16} className="inline mr-2" />
            HTML Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              showPreview 
                ? 'bg-white border-t-2 border-x-2 border-primary-600 text-primary-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eye size={16} className="inline mr-2" />
            Preview
          </button>
        </div>

        {!showPreview ? (
          <textarea
            ref={editorRef}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Enter your HTML email template here..."
            className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-b-lg rounded-tr-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        ) : (
          <div className="border-2 border-gray-300 rounded-b-lg rounded-tr-lg p-4 bg-white min-h-96 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </div>

      {/* Quick HTML Snippets */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Snippets</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHtmlContent(htmlContent + '\n<h1>Heading</h1>\n')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Add Heading
          </button>
          <button
            onClick={() => setHtmlContent(htmlContent + '\n<p>Paragraph text here</p>\n')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Add Paragraph
          </button>
          <button
            onClick={() => setHtmlContent(htmlContent + '\n<a href="https://">Link text</a>\n')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Add Link
          </button>
          <button
            onClick={() => setHtmlContent(htmlContent + '\n<img src="" alt="description" style="max-width:100%;">\n')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Add Image
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button icon={Save} onClick={handleSave} className="flex-1">
          Save Template
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};