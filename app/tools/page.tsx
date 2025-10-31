import Head from 'next/head';

// ToolCard is a client component; dynamically import for better SSR behavior
import ToolCard from '../../components/ToolCard';

const TOOLS = [
  { id: 'image-to-video', name: 'Image → Video', desc: 'Turn images into motion clips' },
  { id: 'subtitle-automation', name: 'Subtitle Automation', desc: 'Auto transcripts & SRT' },
  { id: 'background-removal', name: 'Background Removal', desc: 'Transparent backgrounds' },
  { id: 'audio-editor', name: 'Audio Editor', desc: 'Trim, fade, normalize' },
];

export default function ToolsPage() {
  return (
    <>
      <Head>
        <title>Tools — MediaKit</title>
        <meta name="description" content="Browse MediaKit tools." />
      </Head>

      <section className="mt-6">
        <h1 className="text-2xl font-bold mb-4">Tools</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            // ToolCard is memoized on its own
            <ToolCard key={t.id} id={t.id} name={t.name} description={t.desc} />
          ))}
        </div>
      </section>
    </>
  );
}
