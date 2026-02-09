import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
  Trash2, Copy, MoveVertical, Save, Eye, Undo2, Redo2, ChevronDown, ChevronRight,
  Monitor, Smartphone, X, Code, Download, Layout, Heading, Sparkles,
  Plus, GripVertical, Settings, Palette, FileText, Zap,
} from 'lucide-react';
import { renderEmailHTML, createBlock, BLOCK_DEFAULTS, STARTER_TEMPLATES, extractVariables } from '../../utils/emailHtmlRenderer';
import toast from 'react-hot-toast';

// ─── Block type metadata for the palette ───────────────────────
const BLOCK_TYPES = [
  { type: 'header', label: 'Header', icon: Layout, color: 'bg-blue-100 text-blue-600' },
  { type: 'hero', label: 'Hero Banner', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  { type: 'text', label: 'Text', icon: Type, color: 'bg-emerald-100 text-emerald-600' },
  { type: 'image', label: 'Image', icon: Image, color: 'bg-orange-100 text-orange-600' },
  { type: 'button', label: 'Button', icon: MousePointer, color: 'bg-pink-100 text-pink-600' },
  { type: 'divider', label: 'Divider', icon: Minus, color: 'bg-gray-100 text-gray-600' },
  { type: 'spacer', label: 'Spacer', icon: ArrowUpDown, color: 'bg-indigo-100 text-indigo-600' },
  { type: 'columns', label: 'Columns', icon: Columns, color: 'bg-cyan-100 text-cyan-600' },
  { type: 'social', label: 'Social Links', icon: Share2, color: 'bg-rose-100 text-rose-600' },
  { type: 'footer', label: 'Footer', icon: AlignCenter, color: 'bg-amber-100 text-amber-600' },
];

// ─── Variable Tags ─────────────────────────────────────────────
const MERGE_TAGS = [
  { tag: '{{firstName}}', label: 'First Name' },
  { tag: '{{lastName}}', label: 'Last Name' },
  { tag: '{{email}}', label: 'Email' },
  { tag: '{{company}}', label: 'Company' },
  { tag: '{{phone}}', label: 'Phone' },
  { tag: '{{unsubscribe_url}}', label: 'Unsubscribe URL' },
];

// ─── Sortable Block Item ───────────────────────────────────────
function SortableBlock({ block, isSelected, onClick, onDelete, onDuplicate, settings }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = BLOCK_TYPES.find(b => b.type === block.type);
  const Icon = meta?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border-2 transition-all rounded-lg ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
      }`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Block toolbar */}
      <div className={`absolute -top-3 left-3 z-10 flex items-center gap-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta?.color || 'bg-gray-100 text-gray-600'}`}>
          <Icon size={10} /> {meta?.label}
        </span>
      </div>

      {/* Action buttons */}
      <div className={`absolute -top-3 right-3 z-10 flex items-center gap-0.5 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button {...attributes} {...listeners} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 cursor-grab active:cursor-grabbing" title="Drag to reorder">
          <GripVertical size={12} className="text-gray-400" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 bg-white rounded shadow-sm hover:bg-blue-50" title="Duplicate">
          <Copy size={12} className="text-gray-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 bg-white rounded shadow-sm hover:bg-red-50" title="Delete">
          <Trash2 size={12} className="text-red-400" />
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

    default:
      return <div className="p-4 text-gray-400 text-center text-sm">Unknown block type</div>;
  }
}

// ─── Property Panel ─────────────────────────────────────────────

function PropertyPanel({ block, onChange, onInsertVariable }) {
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
        <Settings size={40} className="mb-3 opacity-50" />
        <p className="font-medium">Select a block</p>
        <p className="text-sm mt-1">Click any block on the canvas to edit its properties.</p>
      </div>
    );
  }

  const p = block.properties;
  const update = (key, value) => onChange({ ...p, [key]: value });

  const Field = ({ label, children }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );

  const TextInput = ({ value, onChange: oc, placeholder, type = 'text' }) => (
    <input type={type} value={value || ''} onChange={(e) => oc(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
  );

  const Select = ({ value, onChange: oc, options }) => (
    <select value={value || ''} onChange={(e) => oc(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const ColorInput = ({ value, onChange: oc }) => (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => oc(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
      <input type="text" value={value || ''} onChange={(e) => oc(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" />
    </div>
  );

  const ToggleInput = ({ value, onChange: oc, label }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-200'}`} onClick={() => oc(!value)}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  const TextArea = ({ value, onChange: oc, rows = 4, placeholder }) => (
    <div className="space-y-1">
      <textarea value={value || ''} onChange={(e) => oc(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" />
      {/* Merge tag buttons */}
      <div className="flex flex-wrap gap-1">
        {MERGE_TAGS.slice(0, 4).map(t => (
          <button key={t.tag} onClick={() => onInsertVariable?.(t.tag)} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-medium">
            {t.tag}
          </button>
        ))}
      </div>
    </div>
  );

  const alignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  // Render properties based on block type
  switch (block.type) {
    case 'header':
      return (
        <div>
          <Field label="Company Name"><TextInput value={p.companyName} onChange={v => update('companyName', v)} /></Field>
          <Field label="Tagline"><TextInput value={p.tagline} onChange={v => update('tagline', v)} placeholder="Optional tagline" /></Field>
          <Field label="Logo URL"><TextInput value={p.logoUrl} onChange={v => update('logoUrl', v)} placeholder="https://..." /></Field>
          <Field label="Logo Width (px)"><TextInput value={p.logoWidth} onChange={v => update('logoWidth', parseInt(v) || 150)} type="number" /></Field>
          <Field label="Font Size"><TextInput value={p.fontSize} onChange={v => update('fontSize', v)} /></Field>
          <Field label="Background Color"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Text Color"><ColorInput value={p.textColor} onChange={v => update('textColor', v)} /></Field>
          <Field label="Alignment"><Select value={p.alignment} onChange={v => update('alignment', v)} options={alignOptions} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} placeholder="30px 40px" /></Field>
        </div>
      );

    case 'hero':
      return (
        <div>
          <Field label="Heading"><TextArea value={p.heading} onChange={v => update('heading', v)} rows={2} /></Field>
          <Field label="Heading Size"><TextInput value={p.headingSize} onChange={v => update('headingSize', v)} /></Field>
          <Field label="Subheading"><TextArea value={p.subheading} onChange={v => update('subheading', v)} rows={2} /></Field>
          <Field label="Button Text"><TextInput value={p.buttonText} onChange={v => update('buttonText', v)} /></Field>
          <Field label="Button URL"><TextInput value={p.buttonUrl} onChange={v => update('buttonUrl', v)} /></Field>
          <Field label="Button Color"><ColorInput value={p.buttonColor} onChange={v => update('buttonColor', v)} /></Field>
          <Field label="Button Text Color"><ColorInput value={p.buttonTextColor} onChange={v => update('buttonTextColor', v)} /></Field>
          <Field label="Background Color"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Text Color"><ColorInput value={p.textColor} onChange={v => update('textColor', v)} /></Field>
          <Field label="Background Image URL"><TextInput value={p.backgroundImage} onChange={v => update('backgroundImage', v)} placeholder="https://..." /></Field>
          <Field label="Alignment"><Select value={p.alignment} onChange={v => update('alignment', v)} options={alignOptions} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'text':
      return (
        <div>
          <Field label="Content (HTML)"><TextArea value={p.content} onChange={v => update('content', v)} rows={8} placeholder="<p>Your text here...</p>" /></Field>
          <Field label="Font Size"><TextInput value={p.fontSize} onChange={v => update('fontSize', v)} /></Field>
          <Field label="Line Height"><TextInput value={p.lineHeight} onChange={v => update('lineHeight', v)} /></Field>
          <Field label="Text Color"><ColorInput value={p.color} onChange={v => update('color', v)} /></Field>
          <Field label="Background Color"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Alignment"><Select value={p.alignment} onChange={v => update('alignment', v)} options={alignOptions} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'image':
      return (
        <div>
          <Field label="Image URL"><TextInput value={p.src} onChange={v => update('src', v)} placeholder="https://..." /></Field>
          <Field label="Alt Text"><TextInput value={p.alt} onChange={v => update('alt', v)} /></Field>
          <Field label="Link URL"><TextInput value={p.linkUrl} onChange={v => update('linkUrl', v)} placeholder="Optional link" /></Field>
          <Field label="Width (px)"><TextInput value={p.pixelWidth} onChange={v => update('pixelWidth', parseInt(v) || 520)} type="number" /></Field>
          <Field label="Background Color"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Alignment"><Select value={p.alignment} onChange={v => update('alignment', v)} options={alignOptions} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'button':
      return (
        <div>
          <Field label="Button Text"><TextInput value={p.text} onChange={v => update('text', v)} /></Field>
          <Field label="Button URL"><TextInput value={p.url} onChange={v => update('url', v)} /></Field>
          <Field label="Button Color"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Text Color"><ColorInput value={p.textColor} onChange={v => update('textColor', v)} /></Field>
          <Field label="Border Radius"><TextInput value={p.borderRadius} onChange={v => update('borderRadius', v)} /></Field>
          <Field label="Font Size"><TextInput value={p.fontSize} onChange={v => update('fontSize', v)} /></Field>
          <Field label="Full Width"><ToggleInput value={p.fullWidth} onChange={v => update('fullWidth', v)} label="Stretch to full width" /></Field>
          <Field label="Container Bg"><ColorInput value={p.containerBg} onChange={v => update('containerBg', v)} /></Field>
          <Field label="Alignment"><Select value={p.alignment} onChange={v => update('alignment', v)} options={alignOptions} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'divider':
      return (
        <div>
          <Field label="Color"><ColorInput value={p.color} onChange={v => update('color', v)} /></Field>
          <Field label="Thickness"><TextInput value={p.thickness} onChange={v => update('thickness', v)} /></Field>
          <Field label="Style">
            <Select value={p.style} onChange={v => update('style', v)} options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ]} />
          </Field>
          <Field label="Background"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'spacer':
      return (
        <div>
          <Field label="Height"><TextInput value={p.height} onChange={v => update('height', v)} placeholder="30px" /></Field>
          <Field label="Background"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
        </div>
      );

    case 'columns':
      return (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{p.columns?.length || 2} Columns</span>
            <button onClick={() => {
              const cols = [...(p.columns || [])];
              if (cols.length < 4) {
                cols.push({ content: '<p>New column</p>', padding: '10px', alignment: 'left', fontSize: '14px', color: '#333333' });
                update('columns', cols);
              }
            }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add</button>
            <button onClick={() => {
              const cols = [...(p.columns || [])];
              if (cols.length > 1) {
                cols.pop();
                update('columns', cols);
              }
            }} className="text-xs text-red-500 hover:text-red-600 font-medium">- Remove</button>
          </div>
          {(p.columns || []).map((col, i) => (
            <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs font-bold text-gray-500 mb-2">Column {i + 1}</div>
              <Field label="Content (HTML)">
                <TextArea value={col.content} onChange={v => {
                  const cols = [...(p.columns || [])];
                  cols[i] = { ...cols[i], content: v };
                  update('columns', cols);
                }} rows={3} />
              </Field>
              <Field label="Text Color">
                <ColorInput value={col.color} onChange={v => {
                  const cols = [...(p.columns || [])];
                  cols[i] = { ...cols[i], color: v };
                  update('columns', cols);
                }} />
              </Field>
              <Field label="Alignment">
                <Select value={col.alignment} onChange={v => {
                  const cols = [...(p.columns || [])];
                  cols[i] = { ...cols[i], alignment: v };
                  update('columns', cols);
                }} options={alignOptions} />
              </Field>
            </div>
          ))}
          <Field label="Gap (px)"><TextInput value={p.gap} onChange={v => update('gap', v)} type="number" /></Field>
          <Field label="Background"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'social':
      return (
        <div>
          {(p.networks || []).map((n, i) => (
            <Field key={i} label={n.platform?.charAt(0).toUpperCase() + n.platform?.slice(1)}>
              <TextInput value={n.url} onChange={v => {
                const nets = [...(p.networks || [])];
                nets[i] = { ...nets[i], url: v };
                update('networks', nets);
              }} placeholder={`https://${n.platform}.com/...`} />
            </Field>
          ))}
          <Field label="Icon Size (px)"><TextInput value={p.iconSize} onChange={v => update('iconSize', v)} type="number" /></Field>
          <Field label="Background"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    case 'footer':
      return (
        <div>
          <Field label="Company Name"><TextInput value={p.companyName} onChange={v => update('companyName', v)} /></Field>
          <Field label="Address"><TextInput value={p.address} onChange={v => update('address', v)} /></Field>
          <Field label="Show Unsubscribe"><ToggleInput value={p.showUnsubscribe !== false} onChange={v => update('showUnsubscribe', v)} label="Include unsubscribe link" /></Field>
          <Field label="Unsubscribe URL"><TextInput value={p.unsubscribeUrl} onChange={v => update('unsubscribeUrl', v)} /></Field>
          <Field label="Extra Text"><TextArea value={p.extraText} onChange={v => update('extraText', v)} rows={2} /></Field>
          <Field label="Background"><ColorInput value={p.backgroundColor} onChange={v => update('backgroundColor', v)} /></Field>
          <Field label="Text Color"><ColorInput value={p.textColor} onChange={v => update('textColor', v)} /></Field>
          <Field label="Padding"><TextInput value={p.padding} onChange={v => update('padding', v)} /></Field>
        </div>
      );

    default:
      return <p className="text-sm text-gray-400 p-4">No properties available.</p>;
  }
}

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
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | mobile
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStarters, setShowStarters] = useState(!template && blocks.length === 0);
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateSubject, setTemplateSubject] = useState(template?.subject || '');

  // Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const pushHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify({ blocks, settings }));
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [blocks, settings, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const state = JSON.parse(history[historyIndex - 1]);
      setBlocks(state.blocks);
      setSettings(state.settings);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const state = JSON.parse(history[historyIndex + 1]);
      setBlocks(state.blocks);
      setSettings(state.settings);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // Save initial state
  useEffect(() => {
    pushHistory();
  }, []);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Handle drag end (reorder)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks(prev => {
      const oldIndex = prev.findIndex(b => b.id === active.id);
      const newIndex = prev.findIndex(b => b.id === over.id);
      const copy = [...prev];
      const [moved] = copy.splice(oldIndex, 1);
      copy.splice(newIndex, 0, moved);
      return copy;
    });
    pushHistory();
  };

  // Block operations
  const addBlock = (type) => {
    const newBlock = createBlock(type);
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    pushHistory();
  };

  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    pushHistory();
  };

  const duplicateBlock = (id) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const clone = {
        ...JSON.parse(JSON.stringify(prev[idx])),
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      };
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
    pushHistory();
  };

  const updateBlockProperties = useCallback((properties) => {
    setBlocks(prev =>
      prev.map(b => b.id === selectedBlockId ? { ...b, properties } : b)
    );
    // Debounce history push
  }, [selectedBlockId]);

  // Apply starter template
  const applyStarter = (starter) => {
    setSettings(starter.settings);
    setBlocks(starter.blocks.map(b => ({
      ...b,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      properties: { ...b.properties },
    })));
    setSelectedBlockId(null);
    setShowStarters(false);
    pushHistory();
  };

  // Generate HTML
  const generateHTML = () => renderEmailHTML({ settings, blocks });

  // Save template
  const handleSave = () => {
    if (!templateName) {
      toast.error('Please enter a template name');
      return;
    }
    const html = generateHTML();
    const variables = extractVariables(blocks);
    onSave({
      name: templateName,
      subject: templateSubject,
      body: html,
      htmlContent: html,
      builderData: { settings, blocks },
      variables,
      status: 'active',
    });
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
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Redo"><Redo2 size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button onClick={() => setPreviewDevice(previewDevice === 'desktop' ? 'mobile' : 'desktop')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Toggle device">
            {previewDevice === 'desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
          </button>
          <button onClick={() => setShowPreview(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Preview"><Eye size={16} /></button>
          <button onClick={() => setShowCode(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="View HTML"><Code size={16} /></button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg hover:bg-gray-100 ${showSettings ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`} title="Email settings"><Settings size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button onClick={exportHTML} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Export HTML"><Download size={16} /></button>
          <button onClick={handleSave}
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
          <div className="p-2 space-y-1 flex-1">
            {BLOCK_TYPES.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bt.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{bt.label}</span>
                </button>
              );
            })}
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
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isSelected={block.id === selectedBlockId}
                        onClick={() => setSelectedBlockId(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        onDuplicate={() => duplicateBlock(block.id)}
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
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {selectedBlock ? `${BLOCK_TYPES.find(b => b.type === selectedBlock.type)?.label} Properties` : 'Properties'}
            </h3>
            {selectedBlock && (
              <button onClick={() => setSelectedBlockId(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <PropertyPanel
              block={selectedBlock}
              onChange={updateBlockProperties}
              onInsertVariable={(tag) => {
                if (selectedBlock?.type === 'text') {
                  updateBlockProperties({
                    ...selectedBlock.properties,
                    content: (selectedBlock.properties.content || '') + tag,
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailBuilder;
