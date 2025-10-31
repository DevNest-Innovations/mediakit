'use client';
import { useCallback, useRef, useState } from 'react';

type Props = {
	onProcess?: (previewUrl?: string) => void;
};

export default function FileUpload({ onProcess }: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [dragOver, setDragOver] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleFiles = useCallback(async (file?: File) => {
		if (!file) return;
		setLoading(true);

		// Create a preview URL for immediate UX
		const url = URL.createObjectURL(file);

		// Simulate processing (replace with real API call)
		await new Promise((r) => setTimeout(r, 800));

		setLoading(false);
		onProcess?.(url);
	}, [onProcess]);

	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const f = e.dataTransfer.files?.[0];
		if (f) handleFiles(f);
	}, [handleFiles]);

	const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) handleFiles(f);
	}, [handleFiles]);

	return (
		<div>
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={onDrop}
				className={`flex flex-col items-center justify-center gap-2 p-6 border-2 rounded-md cursor-pointer transition ${
					dragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-800' : 'border-dashed'
				}`}
				onClick={() => inputRef.current?.click()}
				role="button"
			>
				{loading ? (
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
						<span className="text-sm text-slate-600 dark:text-slate-300">Processing...</span>
					</div>
				) : (
					<>
						<p className="text-sm text-slate-600 dark:text-slate-300">Drag & drop a file, or click to select</p>
						<p className="text-xs text-slate-400">Supports images, audio, and common formats</p>
					</>
				)}
				<input ref={inputRef} type="file" className="hidden" onChange={onInputChange} />
			</div>
		</div>
	);
}
