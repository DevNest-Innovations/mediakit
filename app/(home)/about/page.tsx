import Head from 'next/head';

export default function About() {
	return (
		<>
			<Head>
				<title>About — MediaKit</title>
				<meta name="description" content="About MediaKit - mission, team, and values." />
			</Head>

			<section className="mt-6 space-y-4">
				<h1 className="text-2xl font-bold">About MediaKit</h1>
				<p className="text-slate-600 dark:text-slate-300 max-w-3xl">
					MediaKit is built for creators who want intuitive, performant tools in the browser.
				</p>
				<p className="text-slate-500 text-sm">We focus on privacy, speed, and simplicity.</p>
			</section>
		</>
	);
}
