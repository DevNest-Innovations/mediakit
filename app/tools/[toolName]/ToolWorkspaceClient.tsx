'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '../../../components/FileUpload';
import Modal from '../../../components/Modal';
import { motion } from 'framer-motion';

/*
  ToolWorkspaceClient
  - Keep this file focused on client-only logic (hooks, event handlers, UI).
  - Memoization/useCallback used to avoid unnecessary re-renders.
  - Use a plain <img> for object/blob URLs (next/image doesn't support them).
*/
type Props = {
  toolName: string;
};

export default function ToolWorkspaceClient({ toolName }: Props) {
  const router = useRouter();
  // Defensive: toolName might be undefined during some client renders/hydration.
  // Use a safe fallback to avoid calling .replace on undefined.
  const title = useMemo(() => (toolName ?? '').replace(/-/g, ' ').trim() || 'Tool', [toolName]);

  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const onFileProcessed = useCallback((url?: string) => {
    // previewUrl is typically an object URL created by FileUpload
    setPreviewUrl(url ?? null);
  }, []);

  const onExport = useCallback(async () => {
    setProcessing(true);
    // Simulate work; replace with real export logic / server call
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    setShowModal(true);
  }, []);

  return (
    <section className="mt-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
        {title}
      </motion.h1>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload / Input */}
        <div className="lg:col-span-1">
          <FileUpload onProcess={onFileProcessed} />
        </div>

        {/* Preview */}
        <div className="lg:col-span-1 rounded border p-4 min-h-[200px] flex items-center justify-center">
          {processing ? (
            <div className="text-center">
              <div className="animate-pulse text-slate-500">Processing...</div>
            </div>
          ) : previewUrl ? (
            // Use a plain <img> for blob/object URLs
            <img src={previewUrl} alt="preview" className="max-h-64 object-contain" />
          ) : (
            <div className="text-slate-500">Upload a file to preview</div>
          )}
        </div>

        {/* Settings & Export */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Adjust parameters for {title}.</p>
            {/* Placeholder controls */}
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span className="text-slate-600 dark:text-slate-300">Enable advanced mode</span>
              </label>
            </div>
          </div>

          <button
            onClick={onExport}
            disabled={processing}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
          >
            {processing ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Export ready">
        <div className="space-y-2">
          <p className="text-sm">Your file is ready. Download or share it.</p>
          <button className="text-indigo-600" onClick={() => router.push('/tools')}>
            Return to Tools
          </button>
        </div>
      </Modal>
    </section>
  );
}
