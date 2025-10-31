'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Home() {
	return (
		<>
			<Head>
				<title>MediaKit — Create with confidence</title>
				<meta name="description" content="MediaKit - a web toolbox for content creators." />
			</Head>

			<section className="mt-6">
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45 }}
					className="rounded-lg p-6 bg-linear-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-sm"
				>
					<h1 className="text-3xl md:text-4xl font-extrabold mb-2">MediaKit — Toolbox for creators</h1>
					<p className="text-slate-600 dark:text-slate-300 mb-4 max-w-2xl">
						Convert images to video, automate subtitles, remove backgrounds, and edit audio — fast and in the browser.
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link href="/tools" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm">
							Explore Tools
						</Link>
					</div>
				</motion.div>

				{/* Features */}
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{ title: 'Image → Video', desc: 'Create dynamic clips from stills.' },
						{ title: 'Subtitle Automation', desc: 'AI-powered transcripts & SRT.' },
						{ title: 'Background Removal', desc: 'Fast, precise cutouts.' },
						{ title: 'Audio Tools', desc: 'Trim, enhance, and export.' },
					].map((f) => (
						<motion.article
							key={f.title}
							initial={{ opacity: 0, y: 6 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="p-4 rounded-lg border bg-white dark:bg-slate-800"
						>
							<h3 className="font-semibold">{f.title}</h3>
							<p className="text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
						</motion.article>
					))}
				</div>

				{/* CTA */}
				<div className="mt-10 flex justify-center">
					<Link href="/tools" className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
						Try a Tool — Get Started
					</Link>
				</div>
			</section>
		</>
	);
}
