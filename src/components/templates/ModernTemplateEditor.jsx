import React, { useState, useEffect } from 'react';
import { 
  Eye, Code, Smartphone, Monitor, Save, X, Palette, Type, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Link2, List,
  Sparkles, Wand2, Layout, Plus, Zap, Upload, ExternalLink, Settings, Trash2
} from 'lucide-react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

const TEMPLATE_STARTERS = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    icon: Layout,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="padding: 40px 30px; text-align: center;">
      <h1 style="color: #1a1a1a; margin: 0 0 20px; font-size: 28px;">Your Email Title</h1>
      <p style="color: #666666; line-height: 1.6; margin: 0;">Start creating your amazing email template here...</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'newsletter',
    name: 'Newsletter Pro',
    description: 'Professional newsletter layout',
    icon: Sparkles,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">{{company}}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 18px;">Monthly Newsletter</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 50px 40px;">
      <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Hi {{firstName}},</h2>
      <p style="color: #4a5568; line-height: 1.7; margin: 0 0 24px; font-size: 16px;">
        We're excited to share our latest updates and insights with you this month. Here's what's new!
      </p>
      
      <!-- Feature Box -->
      <div style="background: linear-gradient(135deg, #f6f8fb 0%, #eef2f7 100%); padding: 30px; border-radius: 12px; margin: 32px 0; border-left: 4px solid #667eea;">
        <h3 style="color: #1a1a1a; margin: 0 0 12px; font-size: 20px; font-weight: 600;">✨ What's New</h3>
        <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 15px;">
          Discover our exciting new features and improvements designed to make your experience even better.
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://example.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
          Learn More
        </a>
      </div>
      
      <p style="color: #718096; line-height: 1.6; margin: 32px 0 0; font-size: 14px;">
        Thanks for being part of our community!<br>
        The {{company}} Team
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #a0aec0; font-size: 13px; margin: 0 0 8px;">
        © 2026 {{company}}. All rights reserved.
      </p>
      <p style="color: #cbd5e0; font-size: 12px; margin: 0;">
        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
        <span style="color: #e2e8f0;">•</span>
        <a href="#" style="color: #667eea; text-decoration: none; margin: 0 8px;">Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'promo',
    name: 'Promotional',
    description: 'High-converting promo template',
    icon: Zap,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Hero -->
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 60px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 48px; font-weight: 800; letter-spacing: -1px;">SPECIAL OFFER</h1>
      <p style="color: #ffffff; margin: 20px 0 0; font-size: 28px; font-weight: 600;">50% OFF Everything!</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 50px 40px; text-align: center;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 26px; font-weight: 600;">Limited Time Only, {{firstName}}!</h2>
      <p style="color: #4a5568; line-height: 1.7; margin: 0 0 32px; font-size: 17px;">
        Don't miss out on this incredible opportunity. This exclusive offer ends soon!
      </p>
      
      <!-- Countdown Style Box -->
      <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); padding: 24px; border-radius: 12px; margin: 32px 0; border: 2px dashed #f5576c;">
        <p style="color: #f5576c; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Offer Expires In</p>
        <p style="color: #1a1a1a; margin: 8px 0 0; font-size: 32px; font-weight: 800;">24 HOURS</p>
      </div>
      
      <!-- CTA -->
      <a href="https://example.com" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 20px 60px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
        Claim Your Discount
      </a>
      
      <p style="color: #a0aec0; margin: 32px 0 0; font-size: 13px;">
        *Terms and conditions apply
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 24px; text-align: center;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
        © 2026 {{company}} • <a href="#" style="color: #f5576c; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
  }
];

const VARIABLES = [
  { name: '{{firstName}}', description: 'First name' },
  { name: '{{lastName}}', description: 'Last name' },
  { name: '{{email}}', description: 'Email address' },
  { name: '{{company}}', description: 'Company name' },
];

const COMPONENT_BLOCKS = [
  {
    name: 'Heading 1',
    icon: Type,
    category: 'Text',
    html: '<h1 style="color: #1a1a1a; font-size: 32px; font-weight: bold; margin: 0 0 20px;">Your Heading Here</h1>'
  },
  {
    name: 'Heading 2',
    icon: Type,
    category: 'Text',
    html: '<h2 style="color: #333333; font-size: 24px; font-weight: bold; margin: 0 0 15px;">Your Subheading Here</h2>'
  },
  {
    name: 'Paragraph',
    icon: AlignLeft,
    category: 'Text',
    html: '<p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0 0 15px;">Your paragraph text goes here. Edit this to add your own content.</p>'
  },
  {
    name: 'Button',
    icon: Zap,
    category: 'CTA',
    action: 'openButtonModal'
  },
  {
    name: 'Image',
    icon: ImageIcon,
    category: 'Media',
    action: 'openImageModal'
  },
  {
    name: 'Link',
    icon: Link2,
    category: 'Text',
    action: 'openLinkModal'
  },
  {
    name: 'Divider',
    icon: AlignCenter,
    category: 'Layout',
    html: '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 30px 0;" />'
  },
  {
    name: 'Two Columns',
    icon: Layout,
    category: 'Layout',
    html: `<table style="width: 100%; margin: 20px 0;" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width: 48%; padding: 20px; background-color: #f8f9fa; vertical-align: top; border-radius: 8px;">
      <h3 style="color: #333333; font-size: 20px; margin: 0 0 10px;">Column 1</h3>
      <p style="color: #666666; line-height: 1.6; margin: 0;">Add your content here</p>
    </td>
    <td style="width: 4%;"></td>
    <td style="width: 48%; padding: 20px; background-color: #f8f9fa; vertical-align: top; border-radius: 8px;">
      <h3 style="color: #333333; font-size: 20px; margin: 0 0 10px;">Column 2</h3>
      <p style="color: #666666; line-height: 1.6; margin: 0;">Add your content here</p>
    </td>
  </tr>
</table>`
  },
  {
    name: 'Feature Box',
    icon: Layout,
    category: 'Layout',
    html: '<div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #667eea;"><h3 style="color: #333333; font-size: 22px; margin: 0 0 15px; font-weight: bold;">Feature Title</h3><p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0;">Feature description goes here. Highlight your key points or features in this beautifully styled box.</p></div>'
  },
  {
    name: 'Spacer',
    icon: Plus,
    category: 'Layout',
    html: '<div style="height: 40px;"></div>'
  }
];

export const ModernTemplateEditor = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showCode, setShowCode] = useState(false);
  const [showStarters, setShowStarters] = useState(!template);
  const [activeTab, setActiveTab] = useState('components'); // 'components' or 'variables'
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('Click Here');
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [buttonText, setButtonText] = useState('Click Here');
  const [buttonUrl, setButtonUrl] = useState('https://example.com');
  const [buttonColor, setButtonColor] = useState('#667eea');
  const editorRef = React.useRef(null);

  const insertComponent = (componentHtml) => {
    const editor = editorRef.current;
    if (editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = htmlContent.substring(0, start);
      const after = htmlContent.substring(end);
      const newContent = before + '\n' + componentHtml + '\n' + after;
      setHtmlContent(newContent);
      
      setTimeout(() => {
        editor.focus();
        const newPosition = start + componentHtml.length + 2;
        editor.setSelectionRange(newPosition, newPosition);
      }, 0);
      
      toast.success('Component added!');
    } else {
      setHtmlContent(htmlContent + '\n' + componentHtml + '\n');
      toast.success('Component added!');
    }
  };

  const insertVariable = (varName) => {
    const editor = editorRef.current;
    if (editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const before = htmlContent.substring(0, start);
      const after = htmlContent.substring(end);
      const newContent = before + varName + after;
      setHtmlContent(newContent);
      
      setTimeout(() => {
        editor.focus();
        const newPosition = start + varName.length;
        editor.setSelectionRange(newPosition, newPosition);
      }, 0);
      
      toast.success('Variable inserted!');
    } else {
      setHtmlContent(htmlContent + varName);
      toast.success('Variable inserted!');
    }
  };

  const insertImage = () => {
    if (!imageUrl) {
      toast.error('Please enter an image URL');
      return;
    }
    const imageHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="width: 100%; max-width: 600px; height: auto; display: block; border-radius: 8px; margin: 20px auto;" />`;
    insertComponent(imageHtml);
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
  };

  const insertLink = () => {
    if (!linkUrl || !linkText) {
      toast.error('Please enter both URL and text');
      return;
    }
    const linkHtml = `<a href="${linkUrl}" style="color: #667eea; text-decoration: none; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 2px;">${linkText}</a>`;
    insertComponent(linkHtml);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('Click Here');
  };

  const insertCustomButton = () => {
    if (!buttonUrl || !buttonText) {
      toast.error('Please enter both URL and button text');
      return;
    }
    const buttonHtml = `<div style="text-align: center; margin: 30px 0;">
  <a href="${buttonUrl}" style="display: inline-block; background-color: ${buttonColor}; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;">
    ${buttonText}
  </a>
</div>`;
    insertComponent(buttonHtml);
    setShowButtonModal(false);
    setButtonUrl('https://example.com');
    setButtonText('Click Here');
    setButtonColor('#667eea');
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject line');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Please add email content');
      return;
    }

    onSave({
      name: name.trim(),
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
      variables: extractVariables(htmlContent),
    });
    toast.success(template ? 'Template updated!' : 'Template created!');
    onClose();
  };

  const extractVariables = (html) => {
    const regex = /\{\{(\w+)\}\}/g;
    const vars = new Set();
    let match;
    while ((match = regex.exec(html)) !== null) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  };

  const useStarter = (starter) => {
    setHtmlContent(starter.html);
    setShowStarters(false);
  };

  const getPreviewStyle = () => {
    if (previewMode === 'mobile') {
      return { maxWidth: '375px', margin: '0 auto' };
    }
    return { width: '100%' };
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden">
      {/* Starter Templates Modal */}
      {showStarters && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center p-8">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Starting Point</h2>
              <p className="text-gray-600 text-lg">Select a template to customize or start from scratch</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {TEMPLATE_STARTERS.map((starter) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={starter.id}
                    onClick={() => useStarter(starter)}
                    className="group p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{starter.name}</h3>
                    <p className="text-gray-600 text-sm">{starter.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowStarters(false)}
                className="text-gray-500 hover:text-gray-700 font-semibold"
              >
                Skip and create from current content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStarters(true)}
              icon={<Wand2 size={16} />}
            >
              Templates
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X size={18} />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            icon={<Save size={18} />}
            className="btn-gradient"
          >
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Editor */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Template Settings */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monthly Newsletter"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Your Monthly Update from {{company}}"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* Variables Helper */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'components'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📦 Components
              </button>
              <button
                onClick={() => setActiveTab('variables')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'variables'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔤 Variables
              </button>
            </div>

            {activeTab === 'variables' ? (
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => insertVariable(v.name)}
                    className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    title={v.description}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {COMPONENT_BLOCKS.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.name}
                      onClick={() => {
                        if (block.action === 'openImageModal') {
                          setShowImageModal(true);
                        } else if (block.action === 'openButtonModal') {
                          setShowButtonModal(true);
                        } else if (block.action === 'openLinkModal') {
                          setShowLinkModal(true);
                        } else if (block.html) {
                          insertComponent(block.html);
                        }
                      }}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate">{block.name}</p>
                        <p className="text-[10px] text-gray-500">{block.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Code size={18} className="text-gray-600" />
                <span className="text-sm font-bold text-gray-700">HTML Editor</span>
              </div>
            </div>
            <textarea
              ref={editorRef}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="flex-1 p-6 font-mono text-sm resize-none focus:outline-none bg-gray-50"
              placeholder="Paste your HTML template here or select a starter template..."
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
          {/* Preview Controls */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-700">Live Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Desktop view"
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Mobile view"
              >
                <Smartphone size={18} />
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-6">
            <div style={getPreviewStyle()} className="bg-white shadow-2xl rounded-lg overflow-hidden">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full min-h-[600px] border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                Add Image
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Tip: Use services like Imgur, Cloudinary, or host on your own server
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Alt Text (Accessibility)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {imageUrl && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-600 mb-2">Preview:</p>
                  <img src={imageUrl} alt="Preview" className="w-full rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={insertImage}
                className="btn-gradient"
                icon={<ImageIcon size={18} />}
              >
                Add Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Link2 className="w-6 h-6 text-blue-600" />
                Add Link
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Link Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here to learn more"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={insertLink}
                className="btn-gradient"
                icon={<Link2 size={18} />}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Button Modal */}
      {showButtonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Create Button
              </h3>
              <button
                onClick={() => setShowButtonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Button Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Button URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Button Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    placeholder="#667eea"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-600 mb-3">Preview:</p>
                <div style={{ textAlign: 'center' }}>
                  <a
                    href="#"
                    style={{
                      display: 'inline-block',
                      backgroundColor: buttonColor,
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '15px 40px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {buttonText}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowButtonModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={insertCustomButton}
                className="btn-gradient"
                icon={<Zap size={18} />}
              >
                Add Button
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTemplateEditor;
