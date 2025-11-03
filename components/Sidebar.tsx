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
							<Link href={`/tools/${t.id}`} className="block px-3 py-2 text-sm text-gray-900 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
								{t.name}
							</Link>
						</motion.div>
					</li>
				))}
			</ul>
		</nav>
	);
}
