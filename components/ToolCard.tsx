'use client';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

type Props = {
	id: string;
	name: string;
	description?: string;
};

function ToolCardComponent({ id, name, description }: Props) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ scale: 1.02 }}
			transition={{ duration: 0.25 }}
			className="p-4 border rounded bg-white dark:bg-slate-800"
		>
			<h3 className="font-semibold text-lg">{name}</h3>
			<p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>

			<div className="mt-3">
				<Link href={`/tools/${id}`} className="text-indigo-600 text-sm">Open</Link>
			</div>
		</motion.article>
	);
}

// Memoized to avoid re-renders when props are stable
export default memo(ToolCardComponent);
