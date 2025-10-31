import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="mt-8 py-6 border-t border-slate-200 dark:border-slate-700">
			<div className="max-w-5xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
				<p>© {new Date().getFullYear()} MediaKit — Built for creators.</p>
				<div className="mt-2 space-x-4">
					<Link href="/about">About</Link>
					<Link href="/privacy">Privacy</Link>
				</div>
			</div>
		</footer>
	);
}
