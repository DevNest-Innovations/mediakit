import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="py-6 bg-gray-900">
			<div className="max-w-5xl mx-auto text-center text-sm text-gray-900 dark:text-white">
				<p>© {new Date().getFullYear()} MediaKit — Built for creators.</p>
				<div className="mt-2 space-x-4">
					<Link href="/about">About</Link>
					<Link href="/privacy">Privacy</Link>
				</div>
			</div>
		</footer>
	);
}
