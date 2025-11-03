'use client';
import { useCallback, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './FileUpload';

/*
  SubtitleAutomation (updated)
  - Tries server transcription: POST /api/transcribe with FormData { file }.
    Expect response { text: string }.
  - Provides live-record path using Web Speech API (SpeechRecognition) when available.
  - Falls back to simulated generation if no server or record support.
  - Uses FileUpload onProcess(previewUrl, filename) to receive file preview URL + original filename.
*/

export default function SubtitleAutomation() {
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [hasFile, setHasFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // For Web Speech API recording
  const recogRef = useRef<any | null>(null);
  const [recording, setRecording] = useState(false);

  // Called by FileUpload: receive preview URL and original filename
  const onFileProcessed = useCallback((preview?: string, filename?: string) => {
    setPreviewUrl(preview ?? null);
    setOriginalFilename(filename ?? null);
    setHasFile(Boolean(preview));
    setTranscript('');
    setStatus(null);
  }, []);

  // Try server transcription by fetching the preview URL blob and POSTing it
  const transcribeUploadedFile = useCallback(async (previewUrl?: string, filename?: string) => {
    if (!previewUrl) return null;
    setProcessing(true);
    setStatus('Fetching file...');
    try {
      const resp = await fetch(previewUrl);
      if (!resp.ok) throw new Error('Failed to fetch uploaded file');
      const blob = await resp.blob();

      setStatus('Uploading to transcription service...');
      const form = new FormData();
      // use original filename when available
      form.append('file', blob, filename ?? 'upload');
      // POST to /api/transcribe (implement server-side to call chosen STT)
      const apiResp = await fetch('/api/transcribe', {
        method: 'POST',
        body: form,
      });

      if (!apiResp.ok) {
        // non-2xx -> treat as no-server/failure
        throw new Error('Transcription API failed');
      }

      const json = await apiResp.json();
      const text = (json && json.text) ? String(json.text) : null;
      return text;
    } catch (err) {
      // propagate null to signal fallback
      console.warn('Server transcription failed:', err);
      return null;
    } finally {
      setProcessing(false);
      setStatus(null);
    }
  }, []);

  // Simulated generation (fallback)
  const simulateTranscript = useCallback(async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    const example = [
      { start: '00:00:00,000', end: '00:00:02,000', text: 'Welcome to MediaKit subtitle automation.' },
      { start: '00:00:02,000', end: '00:00:05,000', text: 'This demo generates simple SRT output.' },
      { start: '00:00:05,000', end: '00:00:07,500', text: 'Edit the transcript and export.' },
    ];
    const s = example.map((e, i) => `${i + 1}\n${e.start} --> ${e.end}\n${e.text}\n`).join('\n');
    setProcessing(false);
    return s;
  }, []);

  // Main generate: try server transcription, else simulate
  const generateTranscript = useCallback(async () => {
    if (!hasFile || !previewUrl) return;
    setProcessing(true);
    setStatus('Starting transcription...');
    try {
      const remote = await transcribeUploadedFile(previewUrl, originalFilename ?? undefined);
      if (remote) {
        // If remote returns plain text, convert to simple SRT (very naive: split by sentences)
        // If backend returns structured SRT already, you can set it directly.
        if (remote.trim().includes('\n')) {
          // If server returned SRT or multiline, use as-is
          setTranscript(remote);
        } else {
          // Convert plain text to basic SRT (split into ~3-second chunks)
          const words = remote.split(/\s+/).filter(Boolean);
          const wordsPerChunk = 8;
          const chunks: string[] = [];
          for (let i = 0; i < words.length; i += wordsPerChunk) {
            chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
          }
          const srt = chunks.map((text, i) => {
            const startSec = i * 3;
            const endSec = startSec + 3;
            const fmt = (s: number) => {
              const mm = Math.floor(s / 60).toString().padStart(2, '0');
              const ss = Math.floor(s % 60).toString().padStart(2, '0');
              return `${mm}:${ss},000`;
            };
            return `${i + 1}\n${fmt(startSec)} --> ${fmt(endSec)}\n${text}\n`;
          }).join('\n');
          setTranscript(srt);
        }
      } else {
        // fallback
        const sim = await simulateTranscript();
        setTranscript(sim);
      }
    } catch (err) {
      // fallback
      const sim = await simulateTranscript();
      setTranscript(sim);
    } finally {
      setProcessing(false);
      setStatus(null);
    }
  }, [hasFile, previewUrl, originalFilename, transcribeUploadedFile, simulateTranscript]);

  // Web Speech API: record from microphone
  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('SpeechRecognition not supported in this browser.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.continuous = true;

    const chunks: string[] = [];
    recog.onresult = (ev: any) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res.isFinal) {
          chunks.push(res[0].transcript);
        } else {
          interim += res[0].transcript;
        }
      }
      setTranscript([...chunks, interim].filter(Boolean).join(' '));
    };
    recog.onerror = (e: any) => {
      console.error('Recognition error', e);
      setStatus('Recognition error');
    };
    recog.onend = () => {
      setRecording(false);
      recogRef.current = null;
      setStatus('Recording stopped');
    };
    recog.start();
    recogRef.current = recog;
    setRecording(true);
    setStatus('Recording...');
  }, []);

  const stopRecording = useCallback(() => {
    const recog = recogRef.current;
    if (recog && typeof recog.stop === 'function') recog.stop();
    setRecording(false);
  }, []);

  const downloadSrt = useCallback(() => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // name using original filename if present
    const base = originalFilename ? originalFilename.replace(/\.[^/.]+$/, '') : 'captions';
    a.download = `${base}.srt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [transcript, originalFilename]);

  const isGenerateDisabled = useMemo(() => !hasFile || processing, [hasFile, processing]);

  return (
    <section className="mt-6 space-y-4">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
        Subtitle Automation
      </motion.h1>

      <div className="grid gap-4">
        <div className="lg:col-span-2">
          {/* Upload / Input */}
          <FileUpload onProcess={onFileProcessed} />

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={generateTranscript}
              disabled={isGenerateDisabled}
              className="px-3 py-2 bg-primary text-white rounded disabled:opacity-60"
            >
              {processing ? 'Generating...' : 'Generate Transcript'}
            </button>

            <button
              onClick={downloadSrt}
              disabled={!transcript}
              className="px-3 py-2 border rounded disabled:opacity-60"
            >
              Export SRT
            </button>

            {/* Record controls */}
            <button
              onClick={() => (recording ? stopRecording() : startRecording())}
              className="px-3 py-2 border rounded disabled:opacity-60"
              type="button"
            >
              {recording ? 'Stop Recording' : 'Record (mic)'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-2">
          <div className="p-4 border rounded min-h-[200px] bg-white dark:bg-gray-900">
            {status && <div className="text-sm text-gray-500 mb-2">{status}</div>}

            {processing && (
              <div className="animate-pulse text-sm text-gray-500">Processing audio for subtitles…</div>
            )}

            {!processing && !transcript && (
              <div className="text-sm text-gray-500">No transcript yet. Upload a file or record and click Generate Transcript.</div>
            )}

            {!processing && transcript && (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full min-h-40 resize-y bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              />
            )}
          </div>

          <div className="text-xs text-gray-500">
            Tip: You can provide a server transcription endpoint at /api/transcribe that accepts FormData &apos;file&apos; and returns JSON.
            If not available, the component falls back to a simulated transcript. Live recording uses your browser&apos;s SpeechRecognition.
          </div>
        </div>
      </div>
    </section>
  );
}
