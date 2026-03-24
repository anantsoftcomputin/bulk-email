import React, { useRef, useEffect, useState } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import { renderEmailHTML } from '../../utils/emailHtmlRenderer';

const CampaignPreview = ({ campaign, template, onClose }) => {
  const iframeRef = useRef(null);
  const [viewMode, setViewMode] = useState('desktop');

  const html = React.useMemo(() => {
    if (!template) return '<p style="font-family:sans-serif;padding:24px;color:#888;">No template selected.</p>';
    try {
      return renderEmailHTML({
        settings: template.builderData?.settings || {},
        blocks: template.builderData?.blocks || template.blocks || [],
        subject: campaign?.subject || template.subject,
      });
    } catch {
      return '<p style="font-family:sans-serif;padding:24px;color:#888;">Could not render preview.</p>';
    }
  }, [template, campaign]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
  }, [html, viewMode]);

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
            <div className="font-bold text-gray-900 truncate">{campaign?.name || 'Email Preview'}</div>
            <div className="text-xs text-gray-500 truncate mt-0.5">
              Subject: {campaign?.subject || '(no subject)'}
              {campaign?.fromName && <span className="ml-3">From: {campaign.fromName} &lt;{campaign.fromEmail}&gt;</span>}
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
              title="email-preview"
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

export default CampaignPreview;
