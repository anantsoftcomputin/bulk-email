import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Type, Image, MousePointer, Minus, ArrowUpDown, Columns, Share2, AlignCenter,
  Trash2, Copy, Save, Eye, Undo2, Redo2, ChevronDown, ChevronRight, ChevronUp,
  Monitor, Smartphone, X, Code, Download, Layout, Heading, Sparkles,
  Plus, GripVertical, Settings, Palette, FileText, Zap,
  Video, MessageSquareQuote, ShoppingBag, Menu, Code2, Send, Star,
  Tag, CheckCircle2, Lock, Unlock, Cloud, Bold, Italic, Underline,
  Link2, List, ListOrdered, AlignLeft, AlignCenter as AlignCenterIcon, AlignRight,
  RefreshCw,
} from 'lucide-react';
import { renderEmailHTML, createBlock, BLOCK_DEFAULTS, STARTER_TEMPLATES, extractVariables } from '../../utils/emailHtmlRenderer';
import toast from 'react-hot-toast';

// ─── Block type metadata organized by section ──────────────────
const BLOCK_SECTIONS = [
  {
    label: 'Structure',
    colorClass: 'text-blue-600',
    items: [
      { type: 'header', label: 'Header', icon: Layout, color: 'bg-blue-100 text-blue-600' },
      { type: 'hero', label: 'Hero Banner', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
      { type: 'columns', label: 'Columns', icon: Columns, color: 'bg-cyan-100 text-cyan-600' },
      { type: 'menu', label: 'Nav Menu', icon: Menu, color: 'bg-slate-100 text-slate-600' },
    ],
  },
  {
    label: 'Content',
    colorClass: 'text-emerald-600',
    items: [
      { type: 'text', label: 'Text', icon: Type, color: 'bg-emerald-100 text-emerald-600' },
      { type: 'image', label: 'Image', icon: Image, color: 'bg-orange-100 text-orange-600' },
      { type: 'button', label: 'Button', icon: MousePointer, color: 'bg-pink-100 text-pink-600' },
      { type: 'video', label: 'Video', icon: Video, color: 'bg-red-100 text-red-600' },
    ],
  },
  {
    label: 'Advanced',
    colorClass: 'text-violet-600',
    items: [
      { type: 'testimonial', label: 'Testimonial', icon: MessageSquareQuote, color: 'bg-amber-100 text-amber-600' },
      { type: 'products', label: 'Products', icon: ShoppingBag, color: 'bg-teal-100 text-teal-600' },
      { type: 'social', label: 'Social Links', icon: Share2, color: 'bg-rose-100 text-rose-600' },
      { type: 'html', label: 'Custom HTML', icon: Code2, color: 'bg-gray-100 text-gray-600' },
    ],
  },
  {
    label: 'Utility',
    colorClass: 'text-gray-600',
    items: [
      { type: 'divider', label: 'Divider', icon: Minus, color: 'bg-gray-100 text-gray-600' },
      { type: 'spacer', label: 'Spacer', icon: ArrowUpDown, color: 'bg-indigo-100 text-indigo-600' },
      { type: 'footer', label: 'Footer', icon: AlignCenter, color: 'bg-amber-100 text-amber-600' },
    ],
  },
];

const ALL_BLOCK_TYPES = BLOCK_SECTIONS.flatMap(s => s.items);

// ─── Variable Tags ─────────────────────────────────────────────
const MERGE_TAGS = [
  { tag: '{{firstName}}', label: 'First Name' },
  { tag: '{{lastName}}', label: 'Last Name' },
  { tag: '{{email}}', label: 'Email' },
  { tag: '{{company}}', label: 'Company' },
  { tag: '{{phone}}', label: 'Phone' },
  { tag: '{{unsubscribe_url}}', label: 'Unsubscribe URL' },
];

const TEMPLATE_CATEGORIES = [
  'Newsletter', 'Promotional', 'Transactional', 'Welcome', 'Event', 'Announcement', 'Product', 'Other',
];

const FONT_OPTIONS = ['Arial', 'Helvetica', 'Georgia', 'Verdana', 'Trebuchet MS', 'Courier New', 'Times New Roman'];

// ─── Rich Text Editor (WYSIWYG) ────────────────────────────────
function RichTextEditor({ value, onChange, placeholder = 'Click to edit...' }) {
  const editorRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }
  };
  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    notifyChange();
  };
  const notifyChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const insertLink = () => {
    restoreRange();
    if (linkUrl) exec('createLink', linkUrl);
    setShowLinkDialog(false);
    setLinkUrl('');
  };
  const insertTag = (tag) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) {
      sel.deleteFromDocument();
      const node = document.createTextNode(tag);
      sel.getRangeAt(0).insertNode(node);
      sel.collapseToEnd();
    }
    notifyChange();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 bg-gray-50 border-b border-gray-200">
        <button onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Bold"><Bold size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Italic"><Italic size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Underline"><Underline size={11} /></button>
        <div className="w-px h-3.5 bg-gray-300 mx-0.5"></div>
        <button onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Bullet list"><List size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Numbered list"><ListOrdered size={11} /></button>
        <div className="w-px h-3.5 bg-gray-300 mx-0.5"></div>
        <button onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Align left"><AlignLeft size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Center"><AlignCenterIcon size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Right"><AlignRight size={11} /></button>
        <div className="w-px h-3.5 bg-gray-300 mx-0.5"></div>
        <select onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => { exec('formatBlock', e.target.value); e.target.value = ''; }}
          defaultValue=""
          className="text-[10px] border-0 bg-transparent text-gray-600 focus:outline-none cursor-pointer">
          <option value="" disabled>H</option>
          <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="p">P</option>
        </select>
        <div className="w-px h-3.5 bg-gray-300 mx-0.5"></div>
        <button onMouseDown={(e) => { e.preventDefault(); saveRange(); setShowLinkDialog(true); }} className="p-1 rounded hover:bg-gray-200 text-gray-600" title="Link"><Link2 size={11} /></button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }} className="p-1 rounded hover:bg-gray-200 text-gray-600 text-[9px] font-bold leading-none" title="Clear format">Tx</button>
      </div>
      {showLinkDialog && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 border-b border-blue-200">
          <input autoFocus type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setShowLinkDialog(false); }}
            placeholder="https://..." className="flex-1 px-2 py-0.5 text-xs border border-blue-300 rounded" />
          <button onClick={insertLink} className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium">OK</button>
          <button onClick={() => setShowLinkDialog(false)}><X size={11} className="text-gray-400" /></button>
        </div>
      )}
      <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={notifyChange}
        className="min-h-[80px] p-2.5 focus:outline-none leading-relaxed text-gray-800"
        style={{ fontFamily: 'inherit' }} />
      <div className="flex flex-wrap gap-1 px-2 pb-2 bg-gray-50 border-t border-gray-100">
        <span className="text-[9px] text-gray-400 self-center">Insert:</span>
        {MERGE_TAGS.slice(0, 5).map(t => (
          <button key={t.tag} onMouseDown={(e) => { e.preventDefault(); insertTag(t.tag); }}
            className="px-1.5 py-0.5 text-[9px] bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-medium">
            {t.tag}
          </button>
        ))}
      </div>
    </div>
  );
}


// ─── Sortable Block Item ───────────────────────────────────────
function SortableBlock({ block, isSelected, onClick, onDelete, onDuplicate, onMoveUp, onMoveDown, onToggleLock, settings, isFirst, isLast }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = ALL_BLOCK_TYPES.find(b => b.type === block.type);
  const Icon = meta?.icon || Type;
  const isLocked = block.locked;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border-2 transition-all rounded-lg mt-5 ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
      } ${isLocked ? 'opacity-80' : ''}`}
      onClick={(e) => { e.stopPropagation(); if (!isLocked) onClick(); }}
    >
      {/* Block type badge */}
      <div className={`absolute -top-3.5 left-2 z-10 flex items-center gap-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${meta?.color || 'bg-gray-100 text-gray-600'}`}>
          <Icon size={9} /> {meta?.label}
        </span>
        {isLocked && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-yellow-100 text-yellow-700 font-semibold"><Lock size={8} /> Locked</span>}
      </div>

      {/* Action buttons */}
      <div className={`absolute -top-3.5 right-2 z-10 flex items-center gap-0.5 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        {!isLocked && (
          <>
            <button onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }} disabled={isFirst}
              className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
              <ChevronUp size={11} className="text-gray-500" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }} disabled={isLast}
              className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
              <ChevronDown size={11} className="text-gray-500" />
            </button>
            <button {...attributes} {...listeners} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 cursor-grab active:cursor-grabbing" title="Drag to reorder">
              <GripVertical size={11} className="text-gray-400" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 bg-white rounded shadow-sm hover:bg-blue-50" title="Duplicate">
              <Copy size={11} className="text-gray-500" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 bg-white rounded shadow-sm hover:bg-red-50" title="Delete">
              <Trash2 size={11} className="text-red-400" />
            </button>
          </>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleLock?.(); }}
          className={`p-1 bg-white rounded shadow-sm ${isLocked ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-yellow-50'}`}
          title={isLocked ? 'Unlock block' : 'Lock block'}>
          {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
      </div>

      {/* Block preview */}
      <BlockPreview block={block} settings={settings} />
    </div>
  );
}

// ─── Block Preview (simplified visual) ──────────────────────────
function BlockPreview({ block, settings }) {
  const p = block.properties;

  switch (block.type) {
    case 'header':
      return (
        <div style={{ backgroundColor: p.backgroundColor, color: p.textColor, padding: p.padding, textAlign: p.alignment }} className="rounded-lg">
          {p.logoUrl && <img src={p.logoUrl} alt="" className="max-h-10 mx-auto mb-2" style={{ display: 'block', margin: p.alignment === 'center' ? '0 auto 8px' : '0 0 8px' }} />}
          <div style={{ fontSize: p.fontSize, fontWeight: 700 }}>{p.companyName}</div>
          {p.tagline && <div style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>{p.tagline}</div>}
        </div>
      );

    case 'hero':
      return (
        <div style={{ backgroundColor: p.backgroundColor, color: p.textColor, padding: p.padding, textAlign: p.alignment, backgroundImage: p.backgroundImage ? `url(${p.backgroundImage})` : undefined, backgroundSize: 'cover' }} className="rounded-lg">
          <div style={{ fontSize: p.headingSize, fontWeight: 800, lineHeight: 1.25 }}>{p.heading}</div>
          {p.subheading && <div style={{ fontSize: p.subheadingSize, opacity: 0.8, marginTop: '12px' }}>{p.subheading}</div>}
          {p.buttonText && (
            <div style={{ marginTop: '20px' }}>
              <span style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: p.buttonColor, color: p.buttonTextColor, borderRadius: p.buttonRadius, fontWeight: 600, fontSize: '15px' }}>{p.buttonText}</span>
            </div>
          )}
        </div>
      );

    case 'text':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, fontSize: p.fontSize, color: p.color, textAlign: p.alignment, lineHeight: p.lineHeight }} className="rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: p.content || '<p style="color:#999;">Click to edit text...</p>' }} />
        </div>
      );

    case 'image':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, textAlign: p.alignment }} className="rounded-lg">
          <img src={p.src || 'https://placehold.co/520x260/e2e8f0/94a3b8?text=Click+to+add+image'} alt={p.alt} style={{ maxWidth: '100%', display: 'block', margin: p.alignment === 'center' ? '0 auto' : undefined, borderRadius: '4px' }} />
        </div>
      );

    case 'button':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.containerBg, textAlign: p.alignment }} className="rounded-lg">
          <span style={{ display: 'inline-block', padding: p.buttonPadding, backgroundColor: p.backgroundColor, color: p.textColor, borderRadius: p.borderRadius, fontWeight: p.fontWeight, fontSize: p.fontSize, width: p.fullWidth ? '100%' : undefined, textAlign: 'center' }}>
            {p.text}
          </span>
        </div>
      );

    case 'divider':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor }} className="rounded-lg">
          <hr style={{ border: 'none', borderTop: `${p.thickness} ${p.style} ${p.color}`, margin: 0 }} />
        </div>
      );

    case 'spacer':
      return (
        <div style={{ height: p.height, backgroundColor: p.backgroundColor, position: 'relative' }} className="rounded-lg flex items-center justify-center">
          <span className="text-[10px] text-gray-400 bg-white px-2 absolute">{p.height}</span>
          <div className="w-full border-t border-dashed border-gray-200"></div>
        </div>
      );

    case 'columns':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor }} className="rounded-lg">
          <div className="flex gap-2">
            {(p.columns || []).map((col, i) => (
              <div key={i} className="flex-1 border border-dashed border-gray-200 rounded p-2 text-xs" style={{ color: col.color, textAlign: col.alignment }}>
                <div dangerouslySetInnerHTML={{ __html: col.content || `Column ${i + 1}` }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'social':
      const socialColors = { facebook: '#1877F2', twitter: '#000', instagram: '#E4405F', linkedin: '#0A66C2', youtube: '#FF0000' };
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, textAlign: p.alignment }} className="rounded-lg">
          <div className="flex gap-2 justify-center">
            {(p.networks || []).map((n, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: socialColors[n.platform] || '#666' }}>
                {n.platform === 'twitter' ? '𝕏' : n.platform?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      );

    case 'footer':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, color: p.textColor, textAlign: p.alignment, fontSize: p.fontSize }} className="rounded-lg">
          {p.companyName && <div className="font-semibold text-sm mb-1" style={{ color: p.companyNameColor }}>{p.companyName}</div>}
          {p.address && <div>{p.address}</div>}
          <div className="mt-2 underline">Unsubscribe</div>
        </div>
      );

    case 'video':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, textAlign: 'center' }} className="rounded-lg">
          <div className="relative inline-block w-full max-w-md bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '40%' }}>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="w-14 h-14 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                <Video size={22} className="text-red-500 ml-1" />
              </div>
            </div>
            {p.videoUrl && <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white opacity-70 truncate px-2">{p.videoUrl}</div>}
          </div>
          {p.caption && <p className="text-xs text-gray-500 mt-2">{p.caption}</p>}
        </div>
      );

    case 'testimonial':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, textAlign: 'center' }} className="rounded-lg border border-gray-200">
          <div className="flex justify-center mb-2">
            {Array.from({ length: p.rating || 5 }).map((_, i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-sm italic text-gray-700 mb-3">"{p.quote || 'Amazing product! Highly recommend.'}"</p>
          <div className="flex items-center justify-center gap-2">
            {p.avatarUrl && <img src={p.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />}
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-800">{p.authorName || 'Customer Name'}</div>
              {(p.authorTitle || p.company) && <div className="text-[10px] text-gray-500">{[p.authorTitle, p.company].filter(Boolean).join(', ')}</div>}
            </div>
          </div>
        </div>
      );

    case 'products':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor }} className="rounded-lg">
          <div className="flex gap-2">
            {(p.items || []).slice(0, 3).map((item, i) => (
              <div key={i} className="flex-1 border border-gray-100 rounded-lg overflow-hidden text-center" style={{ backgroundColor: item.backgroundColor || '#fff' }}>
                <div className="h-16 bg-gray-100 relative">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full"><ShoppingBag size={18} className="text-gray-300" /></div>}
                  {item.badge && <span className="absolute top-1 right-1 px-1 py-0.5 bg-red-500 text-white text-[8px] rounded-full font-bold">{item.badge}</span>}
                </div>
                <div className="p-1.5">
                  <div className="text-[10px] font-semibold text-gray-800 truncate">{item.name || `Product ${i + 1}`}</div>
                  <div className="text-[10px] text-blue-600 font-bold mt-0.5">{item.price || '$0.00'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'menu':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor, textAlign: 'center' }} className="rounded-lg">
          <nav className="flex flex-wrap gap-3 justify-center">
            {(p.links || []).map((link, i) => (
              <span key={i} className="text-xs font-medium" style={{ color: link.color || p.linkColor || '#333' }}>
                {link.label || `Link ${i + 1}`}
              </span>
            ))}
          </nav>
        </div>
      );

    case 'html':
      return (
        <div style={{ padding: p.padding, backgroundColor: p.backgroundColor }} className="rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Code2 size={14} />
            <span className="truncate font-mono">{(p.html || '<!-- Custom HTML -->').substring(0, 60)}...</span>
          </div>
        </div>
      );

    default:
      return <div className="p-4 text-gray-400 text-center text-sm">Unknown block type</div>;

  }
}

// ─── MODULE-LEVEL Panel Sub-Components ────────────────────────
// CRITICAL: Defined OUTSIDE PropertyPanel so React sees the same
// component type every render. Defining them inside (as was done before)
// causes React to unmount+remount every input on every keystroke → focus loss.

const PField = ({ label, children, className = '' }) => (
  <div className={`mb-3 ${className}`}>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

const PInput = React.memo(({ value, onChange, placeholder, type = 'text', className = '' }) => (
  <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className={`w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors outline-none ${className}`} />
));
PInput.displayName = 'PInput';

const PSelect = React.memo(({ value, onChange, options }) => (
  <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none">
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
));
PSelect.displayName = 'PSelect';

const PColor = React.memo(({ value, onChange }) => {
  const [hex, setHex] = useState(value || '#000000');
  const prevValue = useRef(value);
  if (value !== prevValue.current) { prevValue.current = value; }
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0" />
      <input type="text" value={hex} onChange={(e) => { setHex(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value); }}
        onFocus={() => setHex(value || '#000000')}
        onBlur={() => setHex(value || '#000000')}
        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" />
    </div>
  );
});
PColor.displayName = 'PColor';

const PToggle = React.memo(({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${value ? 'bg-blue-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
    {label && <span className="text-sm text-gray-700 select-none">{label}</span>}
  </label>
));
PToggle.displayName = 'PToggle';

const PTextarea = React.memo(({ value, onChange, rows = 4, placeholder, mono = false }) => (
  <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    className={`w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white resize-y outline-none transition-colors ${mono ? 'font-mono text-xs' : ''}`} />
));
PTextarea.displayName = 'PTextarea';

const ALIGN_OPTIONS = [
  { value: 'left', label: '← Left' },
  { value: 'center', label: '↔ Center' },
  { value: 'right', label: '→ Right' },
];

// Collapsible section within the property panel
const PSection = ({ title, defaultOpen = true, children, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl mb-2.5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-left transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
          {badge && <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-600 rounded-full font-bold">{badge}</span>}
        </div>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3 space-y-0">{children}</div>}
    </div>
  );
};

// ─── Property Panel ─────────────────────────────────────────────
// Uses LOCAL state — input fields control local state and call onChange
// simultaneously. This decouples the panel from the parent render cycle
// entirely, so typing never triggers a parent re-render mid-keystroke.
const PropertyPanel = React.memo(function PropertyPanel({ block, onChange }) {
  const [local, setLocal] = useState(block?.properties || {});
  const prevBlockId = useRef(block?.id);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Reset local state when the user selects a different block
  useEffect(() => {
    if (block?.id !== prevBlockId.current) {
      prevBlockId.current = block?.id;
      setLocal(block?.properties ? JSON.parse(JSON.stringify(block.properties)) : {});
    }
  }, [block?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // update: writes to local state AND immediately propagates upward
  const update = useCallback((key, value) => {
    setLocal(prev => {
      const next = { ...prev, [key]: value };
      onChangeRef.current(next);
      return next;
    });
  }, []);

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-4 shadow-sm">
          <Palette size={26} className="text-blue-400" />
        </div>
        <p className="font-semibold text-gray-700 text-sm">No block selected</p>
        <p className="text-xs mt-1 text-gray-400 leading-relaxed">Click any block on the canvas to edit its properties here.</p>
        <div className="mt-5 w-full p-3 bg-blue-50 rounded-xl text-left">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">Quick Tips</p>
          <ul className="text-xs text-blue-600 space-y-1.5">
            <li className="flex items-center gap-1.5"><span className="w-4 h-4 bg-blue-200 rounded text-center text-[9px] font-bold flex items-center justify-center">↕</span> Drag blocks to reorder</li>
            <li className="flex items-center gap-1.5"><span className="w-4 h-4 bg-blue-200 rounded text-center text-[9px] font-bold flex items-center justify-center">⌘</span> ⌘Z undo · ⌘S save</li>
            <li className="flex items-center gap-1.5"><span className="w-4 h-4 bg-blue-200 rounded text-center text-[9px] font-bold flex items-center justify-center">🔒</span> Lock to protect a block</li>
          </ul>
        </div>
      </div>
    );
  }

  const p = local;

  switch (block.type) {
    case 'header':
      return (
        <div>
          <PSection title="Content">
            <PField label="Company Name"><PInput value={p.companyName} onChange={v => update('companyName', v)} /></PField>
            <PField label="Tagline"><PInput value={p.tagline} onChange={v => update('tagline', v)} placeholder="Optional tagline" /></PField>
            <PField label="Logo URL"><PInput value={p.logoUrl} onChange={v => update('logoUrl', v)} placeholder="https://..." /></PField>
            <PField label="Logo Width (px)"><PInput value={p.logoWidth} onChange={v => update('logoWidth', v)} type="number" /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Font Size"><PInput value={p.fontSize} onChange={v => update('fontSize', v)} /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Text Color"><PColor value={p.textColor} onChange={v => update('textColor', v)} /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} placeholder="30px 40px" /></PField>
          </PSection>
        </div>
      );

    case 'hero':
      return (
        <div>
          <PSection title="Content">
            <PField label="Heading"><PTextarea value={p.heading} onChange={v => update('heading', v)} rows={2} /></PField>
            <PField label="Heading Size"><PInput value={p.headingSize} onChange={v => update('headingSize', v)} /></PField>
            <PField label="Subheading"><PTextarea value={p.subheading} onChange={v => update('subheading', v)} rows={2} /></PField>
            <PField label="Button Text"><PInput value={p.buttonText} onChange={v => update('buttonText', v)} /></PField>
            <PField label="Button URL"><PInput value={p.buttonUrl} onChange={v => update('buttonUrl', v)} /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Button Color"><PColor value={p.buttonColor} onChange={v => update('buttonColor', v)} /></PField>
            <PField label="Button Text Color"><PColor value={p.buttonTextColor} onChange={v => update('buttonTextColor', v)} /></PField>
            <PField label="Background Color"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Text Color"><PColor value={p.textColor} onChange={v => update('textColor', v)} /></PField>
            <PField label="Background Image URL"><PInput value={p.backgroundImage} onChange={v => update('backgroundImage', v)} placeholder="https://..." /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'text':
      return (
        <div>
          <PSection title="Content">
            <PField label="Rich Text Editor">
              <RichTextEditor key={block.id} value={p.content} onChange={v => update('content', v)} />
            </PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Font Size"><PInput value={p.fontSize} onChange={v => update('fontSize', v)} /></PField>
            <PField label="Line Height"><PInput value={p.lineHeight} onChange={v => update('lineHeight', v)} /></PField>
            <PField label="Text Color"><PColor value={p.color} onChange={v => update('color', v)} /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'image':
      return (
        <div>
          <PSection title="Image Source">
            <PField label="URL"><PInput value={p.src} onChange={v => update('src', v)} placeholder="https://..." /></PField>
            <PField label="Upload from Device">
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-gray-500 font-medium">
                <Image size={14} className="text-gray-400" /> Choose file (max 2MB)
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
                  const reader = new FileReader();
                  reader.onload = (ev) => update('src', ev.target.result);
                  reader.readAsDataURL(file);
                }} />
              </label>
            </PField>
          </PSection>
          <PSection title="Settings" defaultOpen={false}>
            <PField label="Alt Text"><PInput value={p.alt} onChange={v => update('alt', v)} /></PField>
            <PField label="Link URL"><PInput value={p.linkUrl} onChange={v => update('linkUrl', v)} placeholder="Optional click-through link" /></PField>
            <PField label="Width (px)"><PInput value={p.pixelWidth} onChange={v => update('pixelWidth', parseInt(v) || 520)} type="number" /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'button':
      return (
        <div>
          <PSection title="Button">
            <PField label="Label"><PInput value={p.text} onChange={v => update('text', v)} /></PField>
            <PField label="Link URL"><PInput value={p.url} onChange={v => update('url', v)} /></PField>
            <PField label="Full Width"><PToggle value={p.fullWidth} onChange={v => update('fullWidth', v)} label="Stretch to container width" /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Button Color"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Text Color"><PColor value={p.textColor} onChange={v => update('textColor', v)} /></PField>
            <PField label="Border Radius"><PInput value={p.borderRadius} onChange={v => update('borderRadius', v)} /></PField>
            <PField label="Font Size"><PInput value={p.fontSize} onChange={v => update('fontSize', v)} /></PField>
            <PField label="Container Bg"><PColor value={p.containerBg} onChange={v => update('containerBg', v)} /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'divider':
      return (
        <div>
          <PSection title="Divider">
            <PField label="Color"><PColor value={p.color} onChange={v => update('color', v)} /></PField>
            <PField label="Thickness"><PInput value={p.thickness} onChange={v => update('thickness', v)} /></PField>
            <PField label="Style"><PSelect value={p.style} onChange={v => update('style', v)} options={[{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}]} /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'spacer':
      return (
        <div>
          <PSection title="Spacer">
            <PField label="Height"><PInput value={p.height} onChange={v => update('height', v)} placeholder="30px" /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
          </PSection>
        </div>
      );

    case 'columns': {
      const cols = p.columns || [];
      return (
        <div>
          <PSection title={`Columns (${cols.length})`} badge={`${cols.length} cols`}>
            <div className="flex gap-2 mb-3">
              <button onClick={() => { if (cols.length < 4) update('columns', [...cols, { content: '<p>New column</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' }]); }}
                className="flex-1 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-40" disabled={cols.length >= 4}>
                + Add Column
              </button>
              <button onClick={() => { if (cols.length > 1) update('columns', cols.slice(0, -1)); }}
                className="flex-1 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-40" disabled={cols.length <= 1}>
                − Remove
              </button>
            </div>
            {cols.map((col, i) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Column {i + 1}</div>
                <PField label="Content (HTML)">
                  <PTextarea value={col.content} rows={3} onChange={v => { const c = [...cols]; c[i] = { ...c[i], content: v }; update('columns', c); }} />
                </PField>
                <PField label="Text Color">
                  <PColor value={col.color} onChange={v => { const c = [...cols]; c[i] = { ...c[i], color: v }; update('columns', c); }} />
                </PField>
                <PField label="Alignment">
                  <PSelect value={col.alignment} options={ALIGN_OPTIONS} onChange={v => { const c = [...cols]; c[i] = { ...c[i], alignment: v }; update('columns', c); }} />
                </PField>
              </div>
            ))}
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Gap (px)"><PInput value={p.gap} onChange={v => update('gap', v)} type="number" /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );
    }

    case 'social':
      return (
        <div>
          <PSection title="Social Links">
            {(p.networks || []).map((n, i) => (
              <PField key={i} label={n.platform?.charAt(0).toUpperCase() + n.platform?.slice(1)}>
                <PInput value={n.url} placeholder={`https://${n.platform}.com/...`} onChange={v => { const nets = [...(p.networks||[])]; nets[i] = { ...nets[i], url: v }; update('networks', nets); }} />
              </PField>
            ))}
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Icon Size (px)"><PInput value={p.iconSize} onChange={v => update('iconSize', v)} type="number" /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'footer':
      return (
        <div>
          <PSection title="Footer Content">
            <PField label="Company Name"><PInput value={p.companyName} onChange={v => update('companyName', v)} /></PField>
            <PField label="Address"><PInput value={p.address} onChange={v => update('address', v)} /></PField>
            <PField label="Extra Text"><PTextarea value={p.extraText} onChange={v => update('extraText', v)} rows={2} /></PField>
            <PField label="Show Unsubscribe"><PToggle value={p.showUnsubscribe !== false} onChange={v => update('showUnsubscribe', v)} label="Include unsubscribe link" /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Text Color"><PColor value={p.textColor} onChange={v => update('textColor', v)} /></PField>
            <PField label="Font Size"><PInput value={p.fontSize} onChange={v => update('fontSize', v)} /></PField>
            <PField label="Alignment"><PSelect value={p.alignment} onChange={v => update('alignment', v)} options={ALIGN_OPTIONS} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'video':
      return (
        <div>
          <PSection title="Video">
            <PField label="Video URL (YouTube/Vimeo)"><PInput value={p.videoUrl} onChange={v => update('videoUrl', v)} placeholder="https://youtube.com/watch?v=..." /></PField>
            <PField label="Thumbnail URL"><PInput value={p.thumbnailUrl} onChange={v => update('thumbnailUrl', v)} placeholder="Auto-detected from URL" /></PField>
            <PField label="Caption"><PInput value={p.caption} onChange={v => update('caption', v)} /></PField>
            <PField label="Button Text"><PInput value={p.buttonText} onChange={v => update('buttonText', v)} /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'testimonial':
      return (
        <div>
          <PSection title="Testimonial">
            <PField label="Quote"><PTextarea value={p.quote} onChange={v => update('quote', v)} rows={3} /></PField>
            <PField label="Star Rating (1–5)"><PInput value={p.rating} onChange={v => update('rating', Math.min(5, Math.max(1, parseInt(v) || 5)))} type="number" /></PField>
            <PField label="Author Name"><PInput value={p.authorName} onChange={v => update('authorName', v)} /></PField>
            <PField label="Author Title"><PInput value={p.authorTitle} onChange={v => update('authorTitle', v)} /></PField>
            <PField label="Company"><PInput value={p.company} onChange={v => update('company', v)} /></PField>
            <PField label="Avatar URL"><PInput value={p.avatarUrl} onChange={v => update('avatarUrl', v)} placeholder="https://..." /></PField>
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    case 'products': {
      const items = p.items || [];
      return (
        <div>
          <PSection title={`Products (${items.length})`} badge={`${items.length}`}>
            <div className="flex gap-2 mb-3">
              <button onClick={() => { if (items.length < 4) update('items', [...items, { name: 'New Product', price: '$0.00', imageUrl: '', buttonText: 'Shop Now', buttonUrl: '#', badge: '' }]); }}
                className="flex-1 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-40" disabled={items.length >= 4}>
                + Add Product
              </button>
              <button onClick={() => { if (items.length > 1) update('items', items.slice(0, -1)); }}
                className="flex-1 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-40" disabled={items.length <= 1}>
                − Remove
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Product {i + 1}</div>
                <PField label="Name"><PInput value={item.name} onChange={v => { const it=[...items]; it[i]={...it[i],name:v}; update('items',it); }} /></PField>
                <PField label="Price"><PInput value={item.price} onChange={v => { const it=[...items]; it[i]={...it[i],price:v}; update('items',it); }} placeholder="$9.99" /></PField>
                <PField label="Image URL"><PInput value={item.imageUrl} onChange={v => { const it=[...items]; it[i]={...it[i],imageUrl:v}; update('items',it); }} /></PField>
                <PField label="Badge"><PInput value={item.badge} onChange={v => { const it=[...items]; it[i]={...it[i],badge:v}; update('items',it); }} placeholder="NEW, SALE…" /></PField>
                <PField label="Button URL"><PInput value={item.buttonUrl} onChange={v => { const it=[...items]; it[i]={...it[i],buttonUrl:v}; update('items',it); }} /></PField>
              </div>
            ))}
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );
    }

    case 'menu': {
      const links = p.links || [];
      return (
        <div>
          <PSection title={`Nav Links (${links.length})`}>
            <button onClick={() => update('links', [...links, { label: 'Link', url: '#' }])}
              className="w-full mb-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
              + Add Link
            </button>
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-2">
                <input value={link.label} onChange={e => { const l=[...links]; l[i]={...l[i],label:e.target.value}; update('links',l); }}
                  placeholder="Label" className="flex-1 px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none" />
                <input value={link.url} onChange={e => { const l=[...links]; l[i]={...l[i],url:e.target.value}; update('links',l); }}
                  placeholder="URL" className="flex-1 px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none" />
                <button onClick={() => { const l=[...links]; l.splice(i,1); update('links',l); }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={11} /></button>
              </div>
            ))}
          </PSection>
          <PSection title="Style" defaultOpen={false}>
            <PField label="Link Color"><PColor value={p.linkColor} onChange={v => update('linkColor', v)} /></PField>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );
    }

    case 'html':
      return (
        <div>
          <PSection title="Custom HTML">
            <PField label="HTML Code">
              <PTextarea value={p.html} onChange={v => update('html', v)} rows={14} placeholder="<!-- Enter custom HTML -->" mono />
            </PField>
          </PSection>
          <PSection title="Wrapper Style" defaultOpen={false}>
            <PField label="Background"><PColor value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></PField>
            <PField label="Padding"><PInput value={p.padding} onChange={v => update('padding', v)} /></PField>
          </PSection>
        </div>
      );

    default:
      return <p className="text-sm text-gray-400 p-4">No properties available.</p>;
  }
});

// ─── Main Email Builder ────────────────────────────────────────

const EmailBuilder = ({ template, onSave, onClose }) => {
  // State
  const [settings, setSettings] = useState(
    template?.builderData?.settings || {
      backgroundColor: '#f4f4f4',
      contentBackgroundColor: '#ffffff',
      fontFamily: 'Arial',
      contentWidth: 600,
      preheader: '',
      title: template?.name || '',
    }
  );
  const [blocks, setBlocks] = useState(() => {
    if (template?.builderData?.blocks) {
      return template.builderData.blocks.map(b => ({
        ...b,
        id: b.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      }));
    }
    return [];
  });
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateCategory, setTemplateCategory] = useState(template?.category || 'Other');
  const [showStarters, setShowStarters] = useState(!template && blocks.length === 0);
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateSubject, setTemplateSubject] = useState(template?.subject || '');

  // ─── Undo / Redo (using refs to avoid stale closures) ────────
  const historyRef = useRef([JSON.stringify({ blocks: blocks, settings })]);
  const historyIdxRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncUndoRedo = () => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  };

  const pushHistory = useCallback((newBlocks, newSettings) => {
    const snapshot = JSON.stringify({ blocks: newBlocks, settings: newSettings });
    // Don't push if unchanged
    if (historyRef.current[historyIdxRef.current] === snapshot) return;
    // Truncate forward history
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
    syncUndoRedo();
  }, []);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const state = JSON.parse(historyRef.current[historyIdxRef.current]);
    setBlocks(state.blocks);
    setSettings(state.settings);
    syncUndoRedo();
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const state = JSON.parse(historyRef.current[historyIdxRef.current]);
    setBlocks(state.blocks);
    setSettings(state.settings);
    syncUndoRedo();
  }, []);

  // ─── Auto-save to localStorage ─────────────────────────────
  const [autoSavedAt, setAutoSavedAt] = useState(null);
  const autoSaveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('emailbuilder_draft', JSON.stringify({ blocks, settings, name: templateName, subject: templateSubject, savedAt: Date.now() }));
        setAutoSavedAt(new Date());
      } catch (_) {}
    }, 3000);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [blocks, settings, templateName, templateSubject]);

  // ─── Keyboard Shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setShowSaveModal(true); }
      if (e.key === 'Escape') setSelectedBlockId(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Handle drag end (reorder)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(oldIndex, 1);
    newBlocks.splice(newIndex, 0, moved);
    setBlocks(newBlocks);
    pushHistory(newBlocks, settings);
  };

  // ─── Block operations ────────────────────────────────────
  const addBlock = (type) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    pushHistory(newBlocks, settings);
  };

  const deleteBlock = (id) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
    pushHistory(newBlocks, settings);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const clone = {
      ...JSON.parse(JSON.stringify(blocks[idx])),
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, clone);
    setBlocks(newBlocks);
    pushHistory(newBlocks, settings);
  };

  const moveBlockUp = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
    setBlocks(newBlocks);
    pushHistory(newBlocks, settings);
  };

  const moveBlockDown = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
    setBlocks(newBlocks);
    pushHistory(newBlocks, settings);
  };

  const toggleBlockLock = (id) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, locked: !b.locked } : b);
    setBlocks(newBlocks);
    pushHistory(newBlocks, settings);
  };


  const propHistoryTimerRef = useRef(null);
  // IMPORTANT: Do NOT include `blocks` in deps — keeps the callback stable between
  // keystrokes so PropertyPanel (React.memo) doesn't re-render on every character.
  const updateBlockProperties = useCallback((properties) => {
    setBlocks(prev => {
      const newBlocks = prev.map(b => b.id === selectedBlockId ? { ...b, properties } : b);
      // Debounce history snapshot
      clearTimeout(propHistoryTimerRef.current);
      propHistoryTimerRef.current = setTimeout(() => pushHistory(newBlocks, settings), 800);
      return newBlocks;
    });
  }, [selectedBlockId, settings, pushHistory]);

  // Apply starter template
  const applyStarter = (starter) => {
    const newBlocks = starter.blocks.map(b => ({
      ...b,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      properties: { ...b.properties },
    }));
    const newSettings = starter.settings;
    setSettings(newSettings);
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    setShowStarters(false);
    pushHistory(newBlocks, newSettings);
  };

  // Generate HTML
  const generateHTML = () => renderEmailHTML({ settings, blocks });

  // Save template
  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    const html = generateHTML();
    const variables = extractVariables(blocks);
    onSave({
      name: templateName.trim(),
      subject: templateSubject,
      category: templateCategory,
      body: html,
      htmlContent: html,
      builderData: { settings, blocks },
      variables,
      status: 'active',
    });
    setShowSaveModal(false);
    toast.success('Template saved!');
  };

  // Export HTML file
  const exportHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'email-template'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exported!');
  };

  const selectedBlock = useMemo(
    () => blocks.find(b => b.id === selectedBlockId),
    [blocks, selectedBlockId]
  );

  // ─── Template Selector (shown on first open if no template) ───
  if (showStarters) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Choose a Template</h1>
              <p className="text-xs text-gray-500">Select a starter template or build from scratch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STARTER_TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                onClick={() => applyStarter(tmpl)}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all p-6 text-left group"
              >
                <div className="text-4xl mb-4">{tmpl.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tmpl.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{tmpl.description}</p>
                <p className="text-xs text-gray-400 mt-3">{tmpl.blocks.length} blocks</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Full-Screen Preview ──────────────────────────────────────
  if (showPreview) {
    const html = generateHTML();
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Email Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Smartphone size={18} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
              Back to Editor
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-start justify-center p-6">
          <div className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all ${
            previewDevice === 'mobile' ? 'w-[375px]' : 'w-[700px]'
          }`}>
            <iframe
              srcDoc={html}
              className="w-full border-0"
              style={{ height: '80vh' }}
              title="Email preview"
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Code View ──────────────────────────────────────────────
  if (showCode) {
    const html = generateHTML();
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
          <h2 className="font-bold text-white flex items-center gap-2"><Code size={18} /> HTML Source</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { navigator.clipboard.writeText(html); toast.success('Copied!'); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
              Copy HTML
            </button>
            <button onClick={() => setShowCode(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium">
              Back to Editor
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">{html}</pre>
        </div>
      </div>
    );
  }

  // ─── Main Editor Layout ──────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
          <div className="w-px h-6 bg-gray-200"></div>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="text-sm font-semibold text-gray-900 border-0 bg-transparent focus:outline-none focus:ring-0 w-48 placeholder:text-gray-300"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={undo} disabled={!canUndo} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Undo (⌘Z)"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!canRedo} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Redo (⌘Y)"><Redo2 size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button onClick={() => setPreviewDevice(previewDevice === 'desktop' ? 'mobile' : 'desktop')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Toggle device">
            {previewDevice === 'desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
          </button>
          <button onClick={() => setShowPreview(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Preview"><Eye size={16} /></button>
          <button onClick={() => setShowCode(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="View HTML"><Code size={16} /></button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg hover:bg-gray-100 ${showSettings ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`} title="Email settings"><Settings size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          {autoSavedAt && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Cloud size={10} /> Saved</span>}
          <button onClick={exportHTML} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Export HTML"><Download size={16} /></button>
          <button onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm flex items-center gap-1.5">
            <Save size={14} /> Save
          </button>
        </div>

      </div>

      {/* ── Subject Line Bar ───────────────────────────────────── */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject:</span>
        <input
          type="text"
          value={templateSubject}
          onChange={(e) => setTemplateSubject(e.target.value)}
          placeholder="Enter email subject line..."
          className="flex-1 text-sm text-gray-800 border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-300"
        />
        <div className="flex gap-1">
          {MERGE_TAGS.slice(0, 3).map(t => (
            <button key={t.tag} onClick={() => setTemplateSubject(prev => prev + ' ' + t.tag)}
              className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-medium whitespace-nowrap">
              {t.tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Settings Panel (conditional) ────────────────────────── */}
      {showSettings && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Background</label>
            <input type="color" value={settings.backgroundColor} onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
              className="w-7 h-7 rounded border-0 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Content Bg</label>
            <input type="color" value={settings.contentBackgroundColor} onChange={(e) => setSettings(s => ({ ...s, contentBackgroundColor: e.target.value }))}
              className="w-7 h-7 rounded border-0 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Font</label>
            <select value={settings.fontFamily} onChange={(e) => setSettings(s => ({ ...s, fontFamily: e.target.value }))}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white">
              <option>Arial</option><option>Helvetica</option><option>Georgia</option><option>Verdana</option><option>Trebuchet MS</option><option>Courier New</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Width</label>
            <input type="number" value={settings.contentWidth} onChange={(e) => setSettings(s => ({ ...s, contentWidth: parseInt(e.target.value) || 600 }))}
              className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500">Preheader</label>
            <input type="text" value={settings.preheader} onChange={(e) => setSettings(s => ({ ...s, preheader: e.target.value }))}
              placeholder="Preview text in inbox" className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg" />
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Block Palette */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content Blocks</h3>
          </div>
          <div className="p-2 flex-1 space-y-3">
            {BLOCK_SECTIONS.map((section) => (
              <div key={section.label}>
                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${section.colorClass}`}>{section.label}</div>
                <div className="space-y-0.5">
                  {section.items.map((bt) => {
                    const Icon = bt.icon;
                    return (
                      <button key={bt.type} onClick={() => addBlock(bt.type)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bt.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <Icon size={12} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button onClick={() => setShowStarters(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-sm font-medium text-purple-600">
              <Zap size={14} /> Starter Templates
            </button>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto p-6" onClick={() => setSelectedBlockId(null)}>
          <div className={`mx-auto transition-all ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[640px]'}`}
            style={{ backgroundColor: settings.backgroundColor, minHeight: '400px', borderRadius: '12px', padding: '20px' }}>
            
            <div style={{ maxWidth: `${settings.contentWidth}px`, margin: '0 auto', backgroundColor: settings.contentBackgroundColor, borderRadius: '8px', overflow: 'hidden' }}>
              {blocks.length === 0 ? (
                <div className="text-center py-20 px-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={28} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Start building your email</h3>
                  <p className="text-sm text-gray-300 mb-4">Click blocks from the left panel to add them here.</p>
                  <button onClick={() => setShowStarters(true)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
                    Or choose a starter template
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, idx) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isSelected={block.id === selectedBlockId}
                        onClick={() => setSelectedBlockId(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onMoveUp={() => moveBlockUp(block.id)}
                        onMoveDown={() => moveBlockDown(block.id)}
                        onToggleLock={() => toggleBlockLock(block.id)}
                        isFirst={idx === 0}
                        isLast={idx === blocks.length - 1}
                        settings={settings}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Right: Property Panel */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            {selectedBlock ? (() => {
              const meta = ALL_BLOCK_TYPES.find(b => b.type === selectedBlock.type);
              const Icon = meta?.icon || Settings;
              return (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.color || 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-800 leading-tight">{meta?.label || selectedBlock.type}</div>
                    <div className="text-[10px] text-gray-400">Edit properties</div>
                  </div>
                </div>
              );
            })() : (
              <div className="flex items-center gap-2">
                <Palette size={15} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Properties</span>
              </div>
            )}
            {selectedBlock && (
              <button onClick={() => setSelectedBlockId(null)} className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0" title="Deselect">
                <X size={13} className="text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <PropertyPanel
              block={selectedBlock}
              onChange={updateBlockProperties}
            />
          </div>
        </div>
      </div>

      {/* ── Save Modal ─────────────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Save Template</h2>
              <button onClick={() => setShowSaveModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Template Name *</label>
                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Email Template"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject Line</label>
                <input type="text" value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Your email subject..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                <select value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2">
                <Save size={14} /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailBuilder;
