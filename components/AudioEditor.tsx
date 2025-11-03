'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './FileUpload';

import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

import * as lame from '@breezystack/lamejs';
/*
  AudioEditor (wavesurfer.js integration)
  - Dynamic import of wavesurfer.js + regions plugin to avoid SSR issues.
  - Provides waveform visualization, draggable/resizable region for trimming,
    play/pause that respects the region, and simulated export using region bounds.
  - For production, replace simulateExport with WebAudio offline rendering or server-side trimming.
  - Install dependency: npm install wavesurfer.js
*/

export default function AudioEditor() {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<RegionsPlugin | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [exportReady, setExportReady] = useState<string | null>(null);

  // store original uploaded filename so exports can be named
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [exportedName, setExportedName] = useState<string | null>(null);


  // New: track container width for pixel positioning of handles
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // receive preview/object URL from FileUpload
  const onFileProcessed = useCallback((url?: string, filename?: string) => {
    setPreviewUrl(url ?? null);
    setExportReady(null);
    setStart(0);
    setEnd(0);
    setDuration(0);
    setPlaying(false);
    regionRef.current = null;
    setOriginalFilename(filename ?? null);

  }, []);

  // Format seconds to MM:SS (00:00) using floor semantics
  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
    const total = Math.floor(seconds);
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  // Update container width with ResizeObserver
  useEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth || 0);
    });
    ro.observe(el);
    resizeObserverRef.current = ro;
    // initialize
    setContainerWidth(el.clientWidth || 0);
    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  // Initialize wavesurfer dynamically and load audio when previewUrl changes
  useEffect(() => {
    let mounted = true;
    let ws: WaveSurfer | null = null;

    (async () => {
      if (!waveformRef.current) return;

      try {
        // Initialize the Regions plugin
        const regions = RegionsPlugin.create();

        ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#8b8989',
          progressColor: '#00d3cf',
          height: 100,
          normalize: true,
          barWidth: 2,
          plugins: [regions],
        });

        wavesurferRef.current = ws;

        // Load currently selected preview (if any)
        if (previewUrl) {
          // load may be async depending on version
          ws.load(previewUrl);
          setExportReady(null);
        }

        ws.on('ready', () => {
          if (!mounted) return;
          const d = (ws?.getDuration && ws?.getDuration()) || 0;
          setDuration(d);
          setStart(0);
          setEnd(d);


          // ensure a region exists
          try {
            regions.addRegion({
              start: 0,
              end: d,
              color: '#00d3cf61',
              minLength: 0.01,
            });
          } catch {
            // ignore if region can't be added
          }

          // store region API and pick first region if available
          regionRef.current = regions;
          const regs = (regions.getRegions && regions.getRegions()) || [];
          if (regs.length) {
            setStart(Number(regs[0].start ?? 0));
            setEnd(Number(regs[0].end ?? d));
          } else {
            setStart(0);
            setEnd(d);
          }

          console.log('wavesufer: ', wavesurferRef.current);
          console.log('regions: ', regionRef.current);
        });

        // region-updated handler
        regions.on('region-updated', (region) => {
          const ws = wavesurferRef.current;
          if (ws && ws.isPlaying()) {
            ws.play(region.start, region.end);
            setPlaying(true);
          }
          setStart(Number(region.start));
          setEnd(Number(region.end));
        });

        ws.on('finish', () => setPlaying(false));
        ws.on('play', () => setPlaying(true));
        ws.on('pause', () => setPlaying(false));
      } catch (err) {
        console.error('Wavesurfer init error:', err);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      } catch {
        // ignore cleanup errors
      }
      wavesurferRef.current = null;
      regionRef.current = null;
    };
    // only re-run when previewUrl changes
  }, [previewUrl]);

  // Toggle play (uses region if present)
  const togglePlay = useCallback(async () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    try {
      if (ws.isPlaying && ws.isPlaying()) {
        ws.pause();
        setPlaying(false);
        return;
      }

      const r = regionRef.current?.getRegions()[0];
      if (r && ws.play) {
        ws.play(r.start, r.end);
        setPlaying(true);
      } else if (ws.play) {
        ws.play();
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  }, []);

  // helper: encode an AudioBuffer to a WAV Blob (16-bit PCM)
  async function encodeWAV(buffer: AudioBuffer) {
    function writeString(view: DataView, offset: number, str: string) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = length * blockAlign;
    const bufferLength = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    /* fmt chunk */
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk length
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    /* data chunk */
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // write interleaved PCM16
    let offset = 44;
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, Math.floor(intSample), true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  // replace exportTrimmedAudio with MP3 encoding using @breezystack/lamejs
  const exportTrimmedAudio = useCallback(async () => {
    if (!previewUrl) return;
    setProcessing(true);

    // revoke previous export URL
    if (exportReady) {
      try { URL.revokeObjectURL(exportReady); } catch { /* ignore */ }
      setExportReady(null);
      setExportedName(null);
    }

    try {
      // determine trim bounds from regions plugin if available
      const regionsApi = regionRef.current;
      let regionStart = start;
      let regionEnd = end;
      if (regionsApi && typeof regionsApi.getRegions === 'function') {
        const regs = regionsApi.getRegions() || [];
        if (regs.length) {
          regionStart = Number(regs[0].start ?? regionStart);
          regionEnd = Number(regs[0].end ?? regionEnd);
        }
      }

      const trimDuration = Math.max(0, regionEnd - regionStart);
      if (trimDuration <= 0) {
        throw new Error('Invalid trim duration');
      }

      // fetch original audio bytes
      const resp = await fetch(previewUrl);
      if (!resp.ok) throw new Error('Failed to fetch audio');
      const arrayBuffer = await resp.arrayBuffer();

      // decode (use a short-lived AudioContext)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));

      const sampleRate = decoded.sampleRate;
      const channels = decoded.numberOfChannels;
      const renderedLength = Math.max(1, Math.floor(trimDuration * sampleRate));

      // Offline rendering for the trimmed segment
      const offlineCtx = new OfflineAudioContext(channels, renderedLength, sampleRate);
      const src = offlineCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(offlineCtx.destination);
      src.start(0, regionStart, trimDuration);

      const renderedBuffer = await offlineCtx.startRendering();

      // Attempt MP3 encoding using @breezystack/lamejs (already imported as lame)
      try {
        const Mp3Encoder = lame.Mp3Encoder;
        if (!Mp3Encoder) throw new Error('Mp3Encoder not available');

        const kbps = 128; // target bitrate
        const encoder = new Mp3Encoder(channels, sampleRate, kbps);

        const chunkSize = 1152;
        const mp3Parts: Uint8Array[] = [];

        // gather channel data
        const channelData: Float32Array[] = [];
        for (let c = 0; c < channels; c++) channelData.push(renderedBuffer.getChannelData(c));

        const totalSamples = renderedBuffer.length;
        let offset = 0;

        while (offset < totalSamples) {
          const frameCount = Math.min(chunkSize, totalSamples - offset);
          // create Int16 arrays
          const left = new Int16Array(frameCount);
          let right: Int16Array | null = null;
          for (let i = 0; i < frameCount; i++) {
            const s = channelData[0][offset + i];
            left[i] = Math.max(-32768, Math.min(32767, Math.floor(s * 32767)));
          }
          if (channels > 1) {
            right = new Int16Array(frameCount);
            for (let i = 0; i < frameCount; i++) {
              const s = channelData[1][offset + i];
              right[i] = Math.max(-32768, Math.min(32767, Math.floor(s * 32767)));
            }
          }

          let mp3buf: Uint8Array;
          if (channels > 1 && right) {
            mp3buf = encoder.encodeBuffer(left, right);
          } else {
            mp3buf = encoder.encodeBuffer(left);
          }
          if (mp3buf) mp3Parts.push(mp3buf);
          offset += frameCount;
        }

        const mp3flush = encoder.flush();
        if (mp3flush && mp3flush.length) mp3Parts.push(mp3flush);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const mp3Blob = new Blob(mp3Parts, { type: 'audio/mpeg' });
        const mp3Url = URL.createObjectURL(mp3Blob);
        setExportReady(mp3Url);

        const originalName = originalFilename ?? 'audio.mp3';
        const safeName = originalName.replace(/\.[^/.]+$/, '') + '.mp3';
        const downloadName = `mediakit_${safeName}`;
        setExportedName(downloadName);

        // trigger download
        const a = document.createElement('a');
        a.href = mp3Url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        try { await decodeCtx.close(); } catch {}
        return;
      } catch (mp3Err) {
        // MP3 encoding failed — fallback to WAV
        console.warn('MP3 encode failed, falling back to WAV', mp3Err);
      }

      // WAV fallback (uncompressed, larger)
      const wavBlob = await encodeWAV(renderedBuffer);
      const wavUrl = URL.createObjectURL(wavBlob);
      setExportReady(wavUrl);

      const originalName = originalFilename ? `${originalFilename.split('.')[0]}.wav` : 'mediakit-audio.wav';
      const downloadName = `mediakit_${originalName}`;
      setExportedName(downloadName);

      const a = document.createElement('a');
      a.href = wavUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      try { await decodeCtx.close(); } catch {}
    } catch (err) {
      console.error('Export failed', err);
      setExportReady(previewUrl);
    } finally {
      setProcessing(false);
    }
  }, [previewUrl, exportReady, start, end, originalFilename]);

  const canExport = useMemo(() => Boolean(previewUrl) && start < end, [previewUrl, start, end]);

  /* -------------------------
     New: handle dragging logic
     ------------------------- */
  const minGap = 0.1; // minimum region length in seconds
  const draggingRef = useRef<{ side: 'start' | 'end' | null; active: boolean }>({ side: null, active: false });

  // convert clientX -> time
  const clientXToTime = useCallback(
    (clientX: number) => {
      const el = waveformRef.current;
      if (!el || !duration || containerWidth <= 0) return 0;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const t = (x / rect.width) * duration;
      return t;
    },
    [containerWidth, duration]
  );

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current.active) return;
      const side = draggingRef.current.side;
      if (!side) return;
      const t = clientXToTime(e.clientX);
      const ws = wavesurferRef.current;
      const region = regionRef.current?.getRegions()[0];
      if (!ws || !region) return;

      if (side === 'start') {
        const newStart = Math.min(Math.max(0, t), region.end - minGap);
        try {
          region.start = newStart;
          region.end = region.end;
        } catch {
          // fallback: directly set times if update not available
          region.start = newStart;
        }
        setStart(newStart);
      } else {
        const newEnd = Math.max(Math.min(duration, t), region.start + minGap);
        try {
          region.start = region.start;
          region.end = newEnd;
        } catch {
          region.end = newEnd;
        }
        setEnd(newEnd);
      }
    }

    function onPointerUp() {
      if (draggingRef.current.active) {
        draggingRef.current = { side: null, active: false };
        // remove pointer capture listeners
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }
    }

    // global listeners attached on pointerdown below; cleanup ensures removal
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [clientXToTime, duration]);

  const onHandlePointerDown = useCallback((side: 'start' | 'end') => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = { side, active: true };
    // attach global listeners
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current.active) return;
      const sideLocal = draggingRef.current.side;
      if (!sideLocal) return;
      const t = clientXToTime(e.clientX);
      const ws = wavesurferRef.current;
      const region = regionRef.current?.getRegions()[0];
      if (!ws || !region) return;

      if (sideLocal === 'start') {
        const newStart = Math.min(Math.max(0, t), region.end - minGap);
        try {
          region.start = newStart;
          region.end = region.end;
        } catch {
          region.start = newStart;
        }
        setStart(newStart);
      } else {
        const newEnd = Math.max(Math.min(duration, t), region.start + minGap);
        try {
          region.start = region.start;
          region.end = newEnd;
        } catch {
          region.end = newEnd;
        }
        setEnd(newEnd);
      }
    }
    function onPointerUp() {
      if (draggingRef.current.active) {
        draggingRef.current = { side: null, active: false };
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [clientXToTime, duration]);

  // compute pixel positions of handles
  const leftPx = useMemo(() => {
    if (!containerWidth || !duration) return 0;
    return Math.max(0, Math.min(containerWidth, (start / duration) * containerWidth));
  }, [start, duration, containerWidth]);

  const rightPx = useMemo(() => {
    if (!containerWidth || !duration) return 0;
    return Math.max(0, Math.min(containerWidth, (end / duration) * containerWidth));
  }, [end, duration, containerWidth]);

  /* -------------------------
     UI (FileUpload + waveform + draggable handles)
     ------------------------- */
  return (
    <section className="mt-6 space-y-4">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
        Audio Editor
      </motion.h2>

      <div className="grid gap-4">
        {/* FileUpload always visible */}
        <div className="lg:col-span-2 space-y-3">
          <FileUpload onProcess={onFileProcessed} />
        </div>

        {/* Show editor only after an audio has been uploaded AND wavesurfer is ready */}
        {previewUrl ? (
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 border rounded min-h-[200px] relative">
              {/* Waveform container */}
              <div ref={waveformRef} id="waveform" className="w-full" />

              {/* Only render handles if region exists and we know dimensions */}
              {regionRef && containerWidth > 0 && duration > 0 && (
                <>
                  {/* Left handle */}
                  <div
                    aria-label="Trim start"
                    aria-valuetext={formatTime(start)}
                    onPointerDown={onHandlePointerDown('start')}
                    className="absolute top-0 h-full -translate-x-1/2"
                    style={{
                      left: `${leftPx}px`,
                      width: '14px', // clickable area
                      cursor: 'ew-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="h-10 w-2 rounded bg-yellow-400 shadow-lg" />
                    <div className="absolute -top-8 px-2 py-1 rounded bg-yellow-400 text-xs text-black font-mono">
                      {formatTime(start)}
                    </div>
                  </div>

                  {/* Right handle */}
                  <div
                    aria-label="Trim end"
                    aria-valuetext={formatTime(end)}
                    onPointerDown={onHandlePointerDown('end')}
                    className="absolute top-0 h-full -translate-x-1/2"
                    style={{
                      left: `${rightPx}px`,
                      width: '14px',
                      cursor: 'ew-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="h-10 w-2 rounded bg-yellow-400 shadow-lg" />
                    <div className="absolute -top-8 px-2 py-1 rounded bg-yellow-400 text-xs text-black font-mono">
                      {formatTime(end)}
                    </div>
                  </div>

                  {/* Highlighted region overlay (visual only) */}
                  <div
                    aria-hidden
                    className="absolute top-0 h-full pointer-events-none"
                    style={{
                      left: `${leftPx}px`,
                      width: `${Math.max(0, rightPx - leftPx)}px`,
                      background: 'rgba(0, 211, 207, 0.06)',
                      borderRadius: 6,
                    }}
                  />
                </>
              )}

              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Duration: {duration ? formatTime(duration) : '—'}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Start</div>
                  <div className="font-mono">{formatTime(start)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">End</div>
                  <div className="font-mono">{formatTime(end)}</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Note: Waveform region is draggable/resizable. You can also drag the yellow handles to trim.
              Export currently simulates trimming — use WebAudio offline rendering or server-side processing to generate actual trimmed files.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={togglePlay}
                disabled={!previewUrl}
                className="px-3 py-2 bg-primary text-white rounded disabled:opacity-60"
              >
                {playing ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={exportTrimmedAudio}
                disabled={!canExport || processing}
                className="px-3 py-2 border rounded disabled:opacity-60"
              >
                {processing ? 'Processing...' : 'Export'}
              </button>
            </div>

            {exportReady && (
              <div>
                <a className="inline-block px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm" href={exportReady} download={exportedName} >
                  Download Trimmed Audio
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-6 border rounded min-h-40 text-slate-500">
            Upload an audio file to start editing.
          </div>
        )}
      </div>
    </section>
  );
}
