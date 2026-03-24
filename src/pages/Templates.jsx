import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Copy, Eye, FileText, Sparkles, Search,
  LayoutGrid, List, Download, Upload, X, Tag, Clock, Hash, ChevronDown,
  Star, Zap, Mail, Gift, Calendar, Bell, Package, MoreHorizontal,
  SortAsc, SortDesc, Check, Info, AlertCircle,
  RefreshCw, FolderOpen, Globe
} from 'lucide-react';
import EmailBuilder from '../components/templates/EmailBuilder';
import VariableManager from '../components/templates/VariableManager';
import { useTemplateStore } from '../store/templateStore.db';
import { renderEmailHTML } from '../utils/emailHtmlRenderer';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all',           label: 'All',           icon: 'Globe',    color: 'text-gray-600',   bg: 'bg-gray-100'     },
  { id: 'newsletter',    label: 'Newsletter',    icon: 'Mail',     color: 'text-blue-600',   bg: 'bg-blue-100'     },
  { id: 'promotional',   label: 'Promotional',   icon: 'Gift',     color: 'text-orange-600', bg: 'bg-orange-100'   },
  { id: 'transactional', label: 'Transactional', icon: 'Zap',      color: 'text-yellow-600', bg: 'bg-yellow-100'   },
  { id: 'welcome',       label: 'Welcome',       icon: 'Star',     color: 'text-green-600',  bg: 'bg-green-100'    },
  { id: 'event',         label: 'Event',         icon: 'Calendar', color: 'text-purple-600', bg: 'bg-purple-100'   },
  { id: 'announcement',  label: 'Announcement',  icon: 'Bell',     color: 'text-red-600',    bg: 'bg-red-100'      },
  { id: 'product',       label: 'Product',       icon: 'Package',  color: 'text-teal-600',   bg: 'bg-teal-100'     },
  { id: 'other',         label: 'Other',         icon: 'Tag',      color: 'text-gray-600',   bg: 'bg-gray-100'     },
];

const ICON_MAP = { Globe, Mail, Gift, Zap, Star, Calendar, Bell, Package, Tag };

const SORT_OPTIONS = [
  { id: 'newest',  label: 'Newest first',    icon: SortDesc },
  { id: 'oldest',  label: 'Oldest first',    icon: SortAsc  },
  { id: 'az',      label: 'Name A \u2192 Z', icon: SortAsc  },
  { id: 'za',      label: 'Name Z \u2192 A', icon: SortDesc },
  { id: 'updated', label: 'Recently edited', icon: Clock    },
];

function getCategoryMeta(id) {
  const c = CATEGORIES.find(c => c.id === (id || 'other')) || CATEGORIES[CATEGORIES.length - 1];
  return { ...c, Icon: ICON_MAP[c.icon] || Tag };
}

/* ── Scale-preview thumbnail ── */
const TemplateThumbnail = React.memo(function TemplateThumbnail({ template }) {
  const [loaded, setLoaded] = useState(false);
  const html = useMemo(() => {
    try {
      if (template.htmlContent) return template.htmlContent;
      return renderEmailHTML({
        settings: template.builderData?.settings || {},
        blocks: template.builderData?.blocks || template.blocks || [],
        subject: template.subject,
      });
    }
    catch { return '<p style="font-family:sans-serif;padding:16px;color:#888;">Preview unavailable</p>'; }
  }, [template.htmlContent, template.builderData, template.blocks, template.subject]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-50" style={{ height: 170 }}>
      <div className="absolute inset-0" style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '286%', height: '286%', pointerEvents: 'none' }}>
        <iframe
          title="preview"
          srcDoc={html}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          style={{ minHeight: 480 }}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw size={20} className="text-gray-300 animate-spin" />
        </div>
      )}
    </div>
  );
});

/* ── Full Preview Modal ── */
const PreviewModal = React.memo(function PreviewModal({ template, onClose, onEdit }) {
  const meta = getCategoryMeta(template.category);
  const CatIcon = meta.Icon;
  const [viewMode, setViewMode] = useState('desktop');

  const html = useMemo(() => {
    try {
      if (template.htmlContent) return template.htmlContent;
      return renderEmailHTML({
        settings: template.builderData?.settings || {},
        blocks: template.builderData?.blocks || template.blocks || [],
        subject: template.subject,
      });
    }
    catch { return '<p style="font-family:sans-serif;padding:24px;color:#888;">Could not render.</p>'; }
  }, [template.htmlContent, template.builderData, template.blocks, template.subject]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative ml-auto flex flex-col bg-gray-50 shadow-2xl" style={{ width: 'min(96vw,1000px)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
              <CatIcon size={15} className={meta.color} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 truncate">{template.name}</div>
              <div className="text-xs text-gray-500 truncate">Subject: {template.subject || '(no subject)'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('desktop')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Desktop</button>
              <button onClick={() => setViewMode('mobile')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Mobile</button>
            </div>
            <button onClick={() => onEdit(template)} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors">Edit Template</button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 gap-4 bg-gray-100">
          <div className="w-full max-w-2xl flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}><CatIcon size={11} /> {meta.label}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600"><Hash size={11} /> {(template.blocks || []).length} blocks</span>
            {(template.variables || []).length > 0 && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700"><Info size={11} /> {template.variables.length} variables</span>}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 ml-auto"><Clock size={11} /> {formatDistanceToNow(new Date(template.updatedAt || template.createdAt))} ago</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300" style={{ width: viewMode === 'mobile' ? 375 : 620, maxWidth: '100%' }}>
            <iframe title="full-preview" srcDoc={html} sandbox="allow-scripts" className="w-full block border-0" style={{ height: '70vh' }} />
          </div>
          {(template.variables || []).length > 0 && (
            <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Merge Variables</div>
              <div className="flex flex-wrap gap-1.5">
                {template.variables.map((v, i) => <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-mono rounded border border-indigo-200">{v}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/* ── Template Card (Grid) ── */
const TemplateCard = React.memo(function TemplateCard({ template, onEdit, onPreview, onDuplicate, onDelete }) {
  const meta = getCategoryMeta(template.category);
  const CatIcon = meta.Icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = e => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 overflow-hidden group flex flex-col">
      <div className="relative overflow-hidden cursor-pointer" onClick={() => onPreview(template)}>
        <TemplateThumbnail template={template} />
          <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 backdrop-blur-sm text-primary-700 font-semibold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2"><Eye size={14} /> Preview</div>
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${meta.bg} ${meta.color}`}><CatIcon size={9} /> {meta.label}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{(template.blocks || []).length} blocks</div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-primary-600 transition-colors line-clamp-1 cursor-pointer flex-1" onClick={() => onPreview(template)}>{template.name}</h3>
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button onClick={() => setMenuOpen(v => !v)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={15} /></button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 w-40 text-sm">
                <button onClick={() => { setMenuOpen(false); onEdit(template); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium"><Edit size={13} className="text-blue-500" /> Edit</button>
                <button onClick={() => { setMenuOpen(false); onPreview(template); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium"><Eye size={13} className="text-green-500" /> Preview</button>
                <button onClick={() => { setMenuOpen(false); onDuplicate(template.id); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium"><Copy size={13} className="text-indigo-500" /> Duplicate</button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { setMenuOpen(false); onDelete(template.id); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 hover:bg-red-50 text-red-600 font-medium"><Trash2 size={13} /> Delete</button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{template.subject || <span className="italic text-gray-400">No subject</span>}</p>
        {(template.variables || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {template.variables.slice(0, 3).map((v, i) => <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-mono rounded border border-indigo-100">{v}</span>)}
            {template.variables.length > 3 && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">+{template.variables.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
          <span className="text-[11px] text-gray-400">{template.updatedAt ? `Updated ${formatDistanceToNow(new Date(template.updatedAt))} ago` : `Created ${format(new Date(template.createdAt), 'MMM d, yyyy')}`}</span>
          <button onClick={() => onEdit(template)} className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 hover:underline">Edit &rarr;</button>
        </div>
      </div>
    </div>
  );
});

/* ── Template Row (List view) ── */
const TemplateRow = React.memo(function TemplateRow({ template, onEdit, onPreview, onDuplicate, onDelete }) {
  const meta = getCategoryMeta(template.category);
  const CatIcon = meta.Icon;
  return (
    <div className="flex items-center gap-4 bg-white hover:bg-primary-50/50 border-b border-gray-100 px-5 py-3.5 group transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}><CatIcon size={14} className={meta.color} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">{template.name}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${meta.bg} ${meta.color}`}>{meta.label}</span>
        </div>
        <div className="text-xs text-gray-500 truncate">{template.subject || <span className="italic text-gray-400">No subject</span>}</div>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400 w-24 text-right hidden md:block">{(template.blocks || []).length} blocks</div>
      <div className="flex-shrink-0 text-xs text-gray-400 w-36 text-right hidden lg:block">{template.updatedAt ? formatDistanceToNow(new Date(template.updatedAt)) + ' ago' : format(new Date(template.createdAt), 'MMM d, yyyy')}</div>
      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onPreview(template)} title="Preview" className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-500 hover:text-primary-700"><Eye size={14} /></button>
        <button onClick={() => onEdit(template)} title="Edit" className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-500 hover:text-primary-700"><Edit size={14} /></button>
        <button onClick={() => onDuplicate(template.id)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-indigo-100 text-gray-500 hover:text-indigo-700"><Copy size={14} /></button>
        <button onClick={() => onDelete(template.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
      </div>
    </div>
  );
});

/* ── Delete Confirmation Dialog ── */
const DeleteDialog = React.memo(function DeleteDialog({ templateName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertCircle size={22} className="text-red-600" /></div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Template?</h3>
        <p className="text-gray-600 text-sm mb-5"><span className="font-semibold">"{templateName}"</span> will be permanently deleted. This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
});

/* ── Sort Dropdown ── */
const SortDropdown = React.memo(function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find(s => s.id === value) || SORT_OPTIONS[0];
  const Icon = current.icon;
  useEffect(() => {
    if (!open) return;
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
        <Icon size={14} /> {current.label} <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 w-44">
          {SORT_OPTIONS.map(opt => { const OIcon = opt.icon; return (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }} className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors ${value === opt.id ? 'font-semibold text-primary-600' : 'text-gray-700 font-medium'}`}>
              <OIcon size={13} /> {opt.label}
              {value === opt.id && <Check size={12} className="ml-auto text-primary-600" />}
            </button>
          ); })}
        </div>
      )}
    </div>
  );
});

/* ── Main Page ── */
const Templates = () => {
  const { templates, initializeTemplates, deleteTemplate, addTemplate, updateTemplate, duplicateTemplate, loadStarterTemplates } = useTemplateStore();

  const [showEditor, setShowEditor]             = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate]   = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy]     = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { initializeTemplates(); }, []);

  const displayed = useMemo(() => {
    let list = [...templates];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        (t.variables || []).some(v => v.toLowerCase().includes(q))
      );
    }
    if (category !== 'all') list = list.filter(t => (t.category || 'other') === category);
    switch (sortBy) {
      case 'oldest':  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'az':      list.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'za':      list.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
      case 'updated': list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); break;
      default:        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return list;
  }, [templates, search, category, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = { all: templates.length };
    for (const t of templates) { const c = t.category || 'other'; counts[c] = (counts[c] || 0) + 1; }
    return counts;
  }, [templates]);

  const totalBlocks = useMemo(() => templates.reduce((s, t) => s + (t.blocks?.length || 0), 0), [templates]);
  const totalVars   = useMemo(() => new Set(templates.flatMap(t => t.variables || [])).size, [templates]);

  const handleSaveTemplate = useCallback(async (data) => {
    if (selectedTemplate) { await updateTemplate(selectedTemplate.id, data); toast.success('Template updated!'); }
    else { await addTemplate(data); toast.success('Template created!'); }
    initializeTemplates(); setShowEditor(false); setSelectedTemplate(null);
  }, [selectedTemplate, addTemplate, updateTemplate, initializeTemplates]);

  const handleEdit    = useCallback(t => { setSelectedTemplate(t); setPreviewTemplate(null); setShowEditor(true); }, []);
  const handlePreview = useCallback(t => { setPreviewTemplate(t); }, []);

  const handleDuplicate = useCallback(async id => {
    await duplicateTemplate(id); toast.success('Template duplicated!'); initializeTemplates();
  }, [duplicateTemplate, initializeTemplates]);

  const handleDeleteRequest = useCallback(id => {
    const t = templates.find(t => t.id === id); if (t) setDeleteTarget(t);
  }, [templates]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteTemplate(deleteTarget.id); toast.success('Template deleted'); initializeTemplates(); setDeleteTarget(null);
  }, [deleteTarget, deleteTemplate, initializeTemplates]);

  const handleExport = useCallback(() => {
    if (!templates.length) { toast.error('No templates to export'); return; }
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `templates-${format(new Date(), 'yyyy-MM-dd')}.json`; a.click();
    URL.revokeObjectURL(url); toast.success(`Exported ${templates.length} templates`);
  }, [templates]);

  const handleLoadStarters = useCallback(async () => {
    try {
      await loadStarterTemplates();
      toast.success('15 starter templates loaded!');
    } catch { toast.error('Failed to load starter templates'); }
  }, [loadStarterTemplates]);

  const importRef = useRef(null);
  const handleImportFile = useCallback(async e => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) throw new Error('invalid');
      let count = 0;
      for (const t of arr) {
        if (t.name) { await addTemplate({ ...t, id: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); count++; }
      }
      await initializeTemplates(); toast.success(`Imported ${count} template${count !== 1 ? 's' : ''}`);
    } catch { toast.error('Import failed: invalid JSON'); }
    finally { e.target.value = ''; }
  }, [addTemplate, initializeTemplates]);

  const openNew = useCallback(() => { setSelectedTemplate(null); setShowEditor(true); }, []);

  if (showEditor) {
    return <EmailBuilder template={selectedTemplate} onSave={handleSaveTemplate} onClose={() => { setShowEditor(false); setSelectedTemplate(null); }} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Email Templates</h1>
          <p className="page-subtitle">Design, organize and reuse your email designs</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          <button onClick={handleLoadStarters} className="flex items-center gap-1.5 px-3.5 py-2 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
            <Sparkles size={14} /> Load Starters
          </button>
          <button onClick={() => importRef.current?.click()} className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <Upload size={14} /> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {templates.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Templates',  value: templates.length, icon: FileText, iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-500'  },
            { label: 'Total Blocks',     value: totalBlocks,      icon: Hash,     iconBg: 'bg-violet-50',  iconColor: 'text-violet-500'  },
            { label: 'Unique Variables', value: totalVars,        icon: Tag,      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          ].map(stat => { const Icon = stat.icon; return (
            <div key={stat.label} className="stat-card">
              <div className={`icon-box ${stat.iconBg} mb-3`}><Icon size={18} className={stat.iconColor} /></div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ); })}
        </div>
      )}

      {/* Variables Reference */}
      {templates.length > 0 && (
        <div className="card p-4">
          <VariableManager onInsert={(v) => { navigator.clipboard?.writeText(v); }} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates, subjects, variables\u2026"
              className="w-full pl-9 pr-4 py-2 border border-surface-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}><List size={16} /></button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Tag;
            const count = categoryCounts[cat.id] || 0;
            const active = category === cat.id;
            if (cat.id !== 'all' && count === 0 && !active) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${active ? `${cat.bg} ${cat.color} border-transparent shadow-sm` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <Icon size={11} /> {cat.label}
                {count > 0 && <span className={`px-1 rounded text-[10px] font-bold ${active ? 'bg-white/60' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
              </button>
            );
          })}
          {(search || category !== 'all') && (
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100">
              <X size={10} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {templates.length > 0 && (
        <div className="text-sm text-gray-500">
          {displayed.length === templates.length
            ? `${templates.length} template${templates.length !== 1 ? 's' : ''}`
            : `${displayed.length} of ${templates.length} templates`}
          {search && <span> matching <strong className="text-gray-700">"{search}"</strong></span>}
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="card p-0">
          <div className="text-center py-16 px-8">
            <div className="icon-box-lg bg-indigo-50 mx-auto mb-5">
              <FileText size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">Build beautiful, responsive emails with the drag-and-drop editor.</p>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={15} /> Create Your First Template
            </button>
          </div>
          <div className="border-t border-surface-100 px-8 pb-8 pt-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Quick-start by category</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => { const Icon = ICON_MAP[cat.icon] || Tag; return (
                <button key={cat.id} onClick={openNew} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:shadow-sm ${cat.bg} ${cat.color} border-transparent`}>
                  <Icon size={12} /> {cat.label}
                </button>
              ); })}
            </div>
          </div>
        </div>
      )}

      {/* No results (filter) */}
      {templates.length > 0 && displayed.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 px-8 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FolderOpen size={26} className="text-gray-400" /></div>
          <h3 className="font-bold text-gray-900 mb-1">No matches found</h3>
          <p className="text-gray-500 text-sm mb-4">Try different search terms or clear your filters.</p>
          <button onClick={() => { setSearch(''); setCategory('all'); }} className="px-4 py-2 bg-primary-50 text-primary-700 font-semibold rounded-xl text-sm hover:bg-primary-100 transition-colors">Clear filters</button>
        </div>
      )}

      {/* Grid view */}
      {displayed.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayed.map(t => (
            <TemplateCard key={t.id} template={t} onEdit={handleEdit} onPreview={handlePreview} onDuplicate={handleDuplicate} onDelete={handleDeleteRequest} />
          ))}
        </div>
      )}

      {/* List view */}
      {displayed.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <div className="flex-shrink-0 w-8" />
            <div className="flex-1">Template</div>
            <div className="flex-shrink-0 w-24 text-right hidden md:block">Blocks</div>
            <div className="flex-shrink-0 w-36 text-right hidden lg:block">Last Modified</div>
            <div className="flex-shrink-0 w-28" />
          </div>
          {displayed.map(t => (
            <TemplateRow key={t.id} template={t} onEdit={handleEdit} onPreview={handlePreview} onDuplicate={handleDuplicate} onDelete={handleDeleteRequest} />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} onEdit={t => { setPreviewTemplate(null); handleEdit(t); }} />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog templateName={deleteTarget.name} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default Templates;
