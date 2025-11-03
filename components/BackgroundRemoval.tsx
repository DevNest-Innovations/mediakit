'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FileUpload from './FileUpload';
import { motion } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';
import Image from 'next/image';

export default function BackgroundRemoval() {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const modelRef = useRef<bodyPix.BodyPix | null>(null);

  // receive preview URL and original filename from FileUpload
  const onFileProcessed = useCallback((url?: string, name?: string) => {
    setSrcUrl(url ?? null);
    setOriginalFilename(name ?? null);
  }, []);

  // load body-pix model when needed
  const ensureModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    try {
      // ensure backend and core tf are initialized (imports at top)
      try {
        await tf.setBackend?.('webgl');
        await tf.ready();
      } catch (bErr) {
        // backend may already be set or not supported; continue
        console.warn('tf.setBackend/ready issue, continuing', bErr);
      }
      // load lightweight model configuration for speed
      const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.5,
        quantBytes: 2,
      });
      modelRef.current = net;
      return net;
    } catch (err) {
      console.error('Model load failed', err);
      throw err;
    }
  }, []);

  // run segmentation and draw result to canvas
  const runRemoval = useCallback(async () => {
    if (!srcUrl) return;
    setProcessing(true);
    try {
      const net = await ensureModel();
      // create an Image element to ensure correct sizing
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;
      await new Promise((res, rej) => {
        img.onload = () => res(null);
        img.onerror = rej;
      });
      imgRef.current = img;

      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { alpha: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // segmentation: person
      const segmentation = await net.segmentPerson(img, {
        internalResolution: 'medium',
        segmentationThreshold: 0.7,
      });

      // draw transparent background and copy only foreground pixels
      const imgDataCanvas = document.createElement('canvas');
      imgDataCanvas.width = img.naturalWidth;
      imgDataCanvas.height = img.naturalHeight;
      const imgCtx = imgDataCanvas.getContext('2d')!;
      imgCtx.drawImage(img, 0, 0);
      const imgPixels = imgCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const out = ctx.createImageData(img.naturalWidth, img.naturalHeight);

      // keep foreground pixels, set background alpha to 0
      for (let i = 0; i < segmentation.data.length; i++) {
        const seg = segmentation.data[i]; // 1 = person
        const pxIndex = i * 4;
        if (seg === 1) {
          // copy RGBA
          out.data[pxIndex] = imgPixels.data[pxIndex];
          out.data[pxIndex + 1] = imgPixels.data[pxIndex + 1];
          out.data[pxIndex + 2] = imgPixels.data[pxIndex + 2];
          out.data[pxIndex + 3] = imgPixels.data[pxIndex + 3];
        } else {
          // transparent
          out.data[pxIndex] = 0;
          out.data[pxIndex + 1] = 0;
          out.data[pxIndex + 2] = 0;
          out.data[pxIndex + 3] = 0;
        }
      }

      ctx.putImageData(out, 0, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }, [srcUrl, ensureModel]);

  // auto-run when new srcUrl arrives
  useEffect(() => {
    if (!srcUrl) return;
    // slight delay to let UI update
    const t = setTimeout(() => {
      runRemoval().catch(() => { });
    }, 150);
    return () => clearTimeout(t);
  }, [srcUrl, runRemoval]);

  const downloadResult = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blobPromise = new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/png')
    );
    blobPromise.then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const name = originalFilename ? `mediakit_${originalFilename.replace(/\.[^/.]+$/, '')}.png` : 'mediakit_result.png';
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }, [originalFilename]);

  return (
    <section className="mt-6 space-y-4">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
        Background Removal
      </motion.h2>

      <div className="grid  gap-4">
        <div className="lg:col-span-2">
          <FileUpload onProcess={onFileProcessed} />
        </div>

        <div className="lg:col-span-2 space-y-2">
          <div className="p-4 border rounded min-h-[200px] flex items-center justify-center">
            {srcUrl ? (
              <div className="flex gap-4 items-start">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Original</div>
                  <Image
                    width={100}
                    height={100}
                    src={srcUrl}
                    alt="original"
                    className="max-w-[320px] max-h-80 object-contain border w-100 h-100"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Result</div>
                  <canvas ref={canvasRef} className="max-w-[320px] max-h-80 border bg-white" />
                </div>
              </div>
            ) : (
              <div className="text-slate-500">Upload an image to remove background</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => runRemoval()}
              disabled={!srcUrl || processing}
              className="px-3 py-2 bg-primary text-white rounded disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Remove Background'}
            </button>
            <button
              onClick={downloadResult}
              disabled={!srcUrl}
              className="px-3 py-2 border rounded disabled:opacity-60"
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
