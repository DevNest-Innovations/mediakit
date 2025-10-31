'use client';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
	{ href: '/', label: 'Home' },
	{ href: '/tools', label: 'Tools' },
	{ href: '/about', label: 'About' },
];

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const toggle = useCallback(() => setOpen((v) => !v), []);

	const links = useMemo(() => NAV, []);

	return (
		<nav className="w-full bg-transparent px-4 py-3 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Link href="/" className="font-bold text-lg">MediaKit</Link>
				<div className="hidden md:flex items-center gap-4 ml-4">
					{links.map((l) => (
						<Link key={l.href} href={l.href} className="text-sm text-slate-600 dark:text-slate-300">
							{l.label}
						</Link>
					))}
				</div>
			</div>

			<div className="flex items-center gap-3">
				<button className="hidden md:inline text-sm px-3 py-1 border rounded">Sign in</button>

				<button className="md:hidden p-2" onClick={toggle} aria-label="Toggle menu">
					<span className="sr-only">Toggle menu</span>
					<div className="w-6 h-5 relative">
						<div className="absolute left-0 top-0 w-6 h-0.5 bg-current"></div>
						<div className="absolute left-0 top-2.5 w-6 h-0.5 bg-current"></div>
						<div className="absolute left-0 bottom-0 w-6 h-0.5 bg-current"></div>
					</div>
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="absolute top-16 left-4 right-4 bg-white dark:bg-slate-800 rounded shadow-md p-4 md:hidden"
					>
						{links.map((l) => (
							<Link key={l.href} href={l.href} className="block py-2">
								{l.label}
							</Link>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
