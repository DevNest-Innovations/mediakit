'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Sidebar() {
	const tools = useMemo(
		() => [
			{ id: 'image-to-video', name: 'Image → Video' },
			{ id: 'subtitle-automation', name: 'Subtitle Automation' },
			{ id: 'background-removal', name: 'Background Removal' },
			{ id: 'audio-editor', name: 'Audio Editor' },
		],
		[]
	);

	return (
		<nav className="sticky top-6">
			<ul className="space-y-2">
				{tools.map((t) => (
					<li key={t.id}>
						<motion.div whileHover={{ x: 4 }} className="rounded">
							<Link href={`/tools/${t.id}`} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
								{t.name}
							</Link>
						</motion.div>
					</li>
				))}
			</ul>
		</nav>
	);
}
