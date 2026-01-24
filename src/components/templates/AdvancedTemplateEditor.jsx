import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Link, Image, Code, Eye, Save, Type, 
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, 
  Palette, Layout, Smartphone, Monitor, Plus, Minus, X, Copy
} from 'lucide-react';
import Button from '../common/Button';
import { EMAIL_VARIABLES } from '../../utils/constants';
import toast from 'react-hot-toast';

const PRE_BUILT_TEMPLATES = [
  {
    name: 'Blank',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Your content here -->
  </div>
</body>
</html>`
  },
  {
    name: 'Newsletter',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">{{company}}</h1>
      <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">Monthly Newsletter</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333333; margin: 0 0 20px;">Hi {{firstName}},</h2>
      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px;">
        Welcome to our monthly newsletter! We're excited to share the latest updates with you.
      </p>
      
      <!-- Feature Section -->
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #333333; margin: 0 0 15px;">What's New This Month</h3>
        <p style="color: #666666; line-height: 1.6; margin: 0;">
          Exciting updates and features coming your way!
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://example.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Learn More
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #999999; font-size: 14px; margin: 0 0 10px;">
        © 2026 {{company}}. All rights reserved.
      </p>
      <p style="color: #999999; font-size: 12px; margin: 0;">
        <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
        <a href="#" style="color: #667eea; text-decoration: none;">Update Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: 'Promotional',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Hero Image -->
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 60px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 42px; font-weight: bold;">Special Offer!</h1>
      <p style="color: #ffffff; margin: 15px 0 0; font-size: 24px;">50% OFF Everything</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px; text-align: center;">
      <p style="color: #333333; font-size: 18px; line-height: 1.6; margin: 0 0 30px;">
        Hi {{firstName}}, don't miss out on our biggest sale of the year!
      </p>
      
      <!-- Offer Box -->
      <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; border-radius: 12px; margin: 30px 0;">
        <h2 style="color: #333333; margin: 0 0 10px; font-size: 36px;">50% OFF</h2>
        <p style="color: #666666; margin: 0; font-size: 16px;">Use code: <strong>SAVE50</strong></p>
      </div>
      
      <!-- CTA Button -->
      <a href="https://example.com" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 20px 0;">
        Shop Now
      </a>
      
      <p style="color: #999999; font-size: 14px; margin: 30px 0 0;">
        Offer ends midnight tonight!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #333333; padding: 30px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0;">
        © 2026 {{company}}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: 'Transactional',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{company}}</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #2c3e50; margin: 0 0 20px;">Order Confirmation</h2>
      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px;">
        Hi {{firstName}},<br><br>
        Thank you for your order! We're processing it now and will send you a shipping notification soon.
      </p>
      
      <!-- Order Details Box -->
      <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 25px; margin: 30px 0;">
        <h3 style="color: #2c3e50; margin: 0 0 20px; font-size: 18px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #666666;">Order Number:</td>
            <td style="padding: 10px 0; color: #333333; font-weight: bold; text-align: right;">#123456</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666666; border-top: 1px solid #e0e0e0;">Order Date:</td>
            <td style="padding: 10px 0; color: #333333; border-top: 1px solid #e0e0e0; text-align: right;">January 24, 2026</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666666; border-top: 1px solid #e0e0e0;">Total:</td>
            <td style="padding: 10px 0; color: #333333; font-weight: bold; border-top: 1px solid #e0e0e0; text-align: right; font-size: 18px;">$99.99</td>
          </tr>
        </table>
      </div>
      
      <!-- Track Order Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://example.com/track" style="display: inline-block; background-color: #2c3e50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold;">
          Track Your Order
        </a>
      </div>
      
      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
        Questions? Contact our support team at support@example.com
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #999999; font-size: 12px; margin: 0;">
        © 2026 {{company}}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }
];

const QUICK_COMPONENTS = [
  {
    name: 'Heading 1',
    icon: Type,
    html: '<h1 style="color: #333333; font-size: 32px; margin: 0 0 20px;">Your Heading Here</h1>'
  },
  {
    name: 'Heading 2',
    icon: Type,
    html: '<h2 style="color: #333333; font-size: 24px; margin: 0 0 15px;">Your Subheading Here</h2>'
  },
  {
    name: 'Paragraph',
    icon: AlignLeft,
    html: '<p style="color: #666666; line-height: 1.6; margin: 0 0 15px;">Your paragraph text goes here.</p>'
  },
  {
    name: 'Button',
    icon: Plus,
    html: '<div style="text-align: center; margin: 30px 0;"><a href="https://example.com" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold;">Click Here</a></div>'
  },
  {
    name: 'Image',
    icon: Image,
    html: '<img src="https://via.placeholder.com/600x300" alt="Description" style="width: 100%; height: auto; display: block; border-radius: 8px; margin: 20px 0;" />'
  },
  {
    name: 'Divider',
    icon: Minus,
    html: '<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />'
  },
  {
    name: 'Two Columns',
    icon: Layout,
    html: `<table style="width: 100%; margin: 20px 0;" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width: 48%; padding: 20px; background-color: #f8f9fa; vertical-align: top; border-radius: 8px;">
      <h3 style="color: #333333; margin: 0 0 10px;">Column 1</h3>
      <p style="color: #666666; margin: 0;">Content here</p>
    </td>
    <td style="width: 4%;"></td>
    <td style="width: 48%; padding: 20px; background-color: #f8f9fa; vertical-align: top; border-radius: 8px;">
      <h3 style="color: #333333; margin: 0 0 10px;">Column 2</h3>
      <p style="color: #666666; margin: 0;">Content here</p>
    </td>
  </tr>
</table>`
  },
  {
    name: 'Feature Box',
    icon: Layout,
    html: '<div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;"><h3 style="color: #333333; margin: 0 0 15px;">Feature Title</h3><p style="color: #666666; line-height: 1.6; margin: 0;">Feature description goes here.</p></div>'
  }
];

const AdvancedTemplateEditor = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || PRE_BUILT_TEMPLATES[1].htmlContent);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [showTemplates, setShowTemplates] = useState(!template);
  const editorRef = useRef(null);

  const insertVariable = (variable) => {
    const editor = editorRef.current;
    if (editor && !showPreview) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setHtmlContent(before + variable + after);
      
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setHtmlContent(htmlContent + variable);
    }
  };

  const insertComponent = (html) => {
    const editor = editorRef.current;
    if (editor && !showPreview) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setHtmlContent(before + '\n' + html + '\n' + after);
      
      setTimeout(() => {
        editor.focus();
        editor.setSelectionRange(start + html.length + 2, start + html.length + 2);
      }, 0);
    } else {
      setHtmlContent(htmlContent + '\n' + html + '\n');
    }
  };

  const loadTemplate = (templateHtml) => {
    setHtmlContent(templateHtml);
    setShowTemplates(false);
    toast.success('Template loaded!');
  };

  const handleSave = () => {
    if (!name || !subject || !htmlContent) {
      toast.error('Please fill in all required fields');
      return;
    }

    const templateData = {
      id: template?.id || Date.now(),
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

  const getPreviewContent = () => {
    // Replace variables with sample data for preview
    return htmlContent
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john@example.com')
      .replace(/{{company}}/g, 'Your Company')
      .replace(/{{phone}}/g, '+1-234-567-8900');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 pb-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Newsletter"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Subject *
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Choose a Template</h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRE_BUILT_TEMPLATES.map((tpl, index) => (
              <button
                key={index}
                onClick={() => loadTemplate(tpl.htmlContent)}
                className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all text-center group"
              >
                <Layout className="mx-auto mb-2 text-gray-400 group-hover:text-purple-600" size={32} />
                <p className="font-medium text-gray-700 group-hover:text-purple-600">{tpl.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex-shrink-0 mb-4 space-y-4">
        {/* Variables */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">📝 Insert Variables</h4>
          <div className="flex flex-wrap gap-2">
            {EMAIL_VARIABLES.map(variable => (
              <button
                key={variable.key}
                onClick={() => insertVariable(variable.key)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                {variable.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Components */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">🎨 Quick Components</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {QUICK_COMPONENTS.map((component, index) => (
              <button
                key={index}
                onClick={() => insertComponent(component.html)}
                className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all group"
                title={component.name}
              >
                <component.icon className="mx-auto text-purple-600 group-hover:text-purple-700" size={20} />
                <p className="text-xs text-gray-600 mt-1 truncate">{component.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Tabs & Preview Controls */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              !showPreview 
                ? 'bg-white border-2 border-b-0 border-purple-600 text-purple-600 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            <Code size={16} className="inline mr-2" />
            HTML Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              showPreview 
                ? 'bg-white border-2 border-b-0 border-purple-600 text-purple-600 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
            }`}
          >
            <Eye size={16} className="inline mr-2" />
            Preview
          </button>
        </div>

        {showPreview && (
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewDevice === 'desktop' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewDevice === 'mobile' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Smartphone size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 min-h-0 border-2 border-gray-300 rounded-b-lg rounded-tr-lg overflow-hidden">
        {!showPreview ? (
          <textarea
            ref={editorRef}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Enter your HTML email template here..."
            className="w-full h-full px-4 py-3 font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <div className={`h-full overflow-auto bg-gray-100 p-4 ${previewDevice === 'mobile' ? 'flex justify-center' : ''}`}>
            <div 
              className={`bg-white ${previewDevice === 'mobile' ? 'w-[375px]' : 'w-full'} shadow-lg transition-all`}
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }} 
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-3 pt-4 mt-4 border-t border-gray-200">
        <Button 
          onClick={handleSave} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Save size={18} className="mr-2" />
          Save Template
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setShowTemplates(!showTemplates)}
          className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          <Layout size={18} className="mr-2" />
          Templates
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;
