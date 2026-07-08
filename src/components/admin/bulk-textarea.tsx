'use client';

// =============================================================================
// ExamVault - Admin > BulkTextarea (shared)
// =============================================================================
// Reusable textarea for the 7 bulk-add dialogs (categories, subjects, tests,
// questions, upcoming-exams, current-affairs, announcements). Solves two
// pain points the admin reported:
//
//   1. SCROLLING — the base <Textarea> component bakes `field-sizing-content`
//      into its className, which makes the textarea grow to fit its content
//      instead of presenting a scrollbar. Pasting a large JSON blob blew
//      the dialog out of the viewport. We override that here with
//      `field-sizing-fixed` + `max-h-[50vh]` + `overflow-y-auto` so long
//      pastes scroll INSIDE the box, and `resize-y` so the admin can drag
//      the corner to resize manually.
//
//   2. FILE UPLOAD — the admin previously had to copy/paste template text
//      by hand. The bulk dialogs already had "Download Template" / "Download
//      CSV" / "Load Sample" buttons, but no way to push a filled template
//      back. We add an "Upload File" button that opens a file picker,
//      reads the file as text (CSV or JSON), and drops it straight into
//      the textarea.
//
// Drop-in replacement for the previous pattern:
//   <Textarea
//     value={bulkText}
//     onChange={(e) => setBulkText(e.target.value)}
//     rows={15}
//     placeholder='[{"...":"..."}]'
//     className="bg-slate-800 border-slate-700 font-mono text-xs"
//   />
// becomes:
//   <BulkTextarea
//     value={bulkText}
//     onChange={setBulkText}
//     placeholder='[{"...":"..."}]'
//   />
// =============================================================================

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface BulkTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** File types accepted by the upload button. */
  accept?: string;
  /** Optional id so a <label htmlFor> can be associated for a11y. */
  id?: string;
}

export function BulkTextarea({
  value,
  onChange,
  placeholder,
  accept = '.json,.csv,.txt',
  id,
}: BulkTextareaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    // Cheap size guard — refuse anything over 1 MB. Bulk templates should
    // be tiny; a giant file is almost certainly the wrong file.
    if (file.size > 1_048_576) {
      toast.error(
        `File too large (${(file.size / 1024).toFixed(0)} KB). Max 1 MB.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      onChange(text);
      toast.success(
        `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      );
    };
    reader.onerror = () =>
      toast.error('Failed to read file. Try again or paste manually.');
    reader.readAsText(file);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar: upload + clear + byte counter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
            title="Upload a CSV or JSON template file"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload File
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
              title="Clear the textarea"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
        {value && (
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {value.length.toLocaleString()} chars
          </span>
        )}
        {/* Hidden file input — opened by the Upload File button. */}
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            // Reset value so picking the same file twice still fires onChange.
            e.target.value = '';
          }}
        />
      </div>

      {/* The textarea itself.
          - field-sizing-fixed overrides the base Textarea's
            field-sizing-content (which grows to fit content).
          - max-h-[50vh] caps the height to half the viewport so the dialog
            never blows out.
          - overflow-y-auto enables the scrollbar once content exceeds the box.
          - resize-y lets the admin drag the corner to resize. */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={15}
        className="bg-slate-800 border-slate-700 font-mono text-xs field-sizing-fixed resize-y max-h-[50vh] overflow-y-auto"
      />
    </div>
  );
}
