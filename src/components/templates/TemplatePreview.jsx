import React, { useRef, useEffect, useState } from 'react';
import { X, Monitor, Smartphone, Hash, Clock } from 'lucide-react';
import { renderEmailHTML } from '../../utils/emailHtmlRenderer';
import { formatDistanceToNow } from 'date-fns';

const TemplatePreview = ({ template, onClose, onUse }) => {
  const iframeRef = useRef(null);
  const [viewMode, setViewMode] = useState('desktop');

  const html = React.useMemo(() => {
    if (!template) return '';
    try {
      return renderEmailHTML({
        settings: template.builderData?.settings || {},
        blocks: template.builderData?.blocks || template.blocks || [],
        subject: template.subject,
      });
    } catch {
      return '<p style="font-family:sans-serif;padding:24px;color:#888;">Could not render.</p>';
    }
  }, [template]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
  }, [html, viewMode]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: 'min(95vw, 800px)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-100 flex-shrink-0">
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate">{template.name}</div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Hash size={10} /> {(template.blocks || []).length} blocks
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {template.updatedAt ? formatDistanceToNow(new Date(template.updatedAt)) + ' ago' : 'Unknown'}
              </span>
              {(template.tags || []).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-surface-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'desktop' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                }`}
              >
                <Monitor size={12} /> Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'mobile' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                }`}
              >
                <Smartphone size={12} /> Mobile
              </button>
            </div>
            {onUse && (
              <button
                onClick={() => { onUse(template); onClose(); }}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Use Template
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-6 px-4">
          <div
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300"
            style={{ width: viewMode === 'mobile' ? 375 : 600, maxWidth: '100%' }}
          >
            <iframe
              ref={iframeRef}
              title="template-preview"
              sandbox="allow-same-origin"
              className="w-full block border-0"
              style={{ height: '60vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
