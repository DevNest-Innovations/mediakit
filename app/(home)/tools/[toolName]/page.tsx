import { use } from 'react';
import ImageToVideo from '@/components/ImageToVideo';
import SubtitleAutomation from '@/components/SubtitleAutomation';
import AudioEditor from '@/components/AudioEditor';
import BackgroundRemoval from '@/components/BackgroundRemoval';
import Link from 'next/link';

// List of tool slugs used by the app — keep in sync with Sidebar / tools dashboard
const TOOL_SLUGS = [
  'image-to-video',
  'subtitle-automation',
  'background-removal',
  'audio-editor',
];

// Required for static export: generate all variants
export async function generateStaticParams() {
  return TOOL_SLUGS.map((toolName) => ({ toolName }));
}

export default function Page({ params }: { params: Promise<{ toolName: string }> }) {
  const { toolName } = use(params);
  // Server component: pass toolName to client component for interactivity
  // return <ImageToVideo toolName={toolName} />;


  // Render the matching client component for the tool. Add more mappings as components are created.
  switch (toolName) {
    case 'image-to-video':
      return <ImageToVideo />;
    case 'subtitle-automation':
      return <SubtitleAutomation />;
    case 'background-removal':
      return <BackgroundRemoval />;
    case 'audio-editor':
      return <AudioEditor />;
    default:
      break;
  }

  // Fallback for unimplemented tools: simple server-rendered message with link back.
  return (
    <section className="mt-6">
      <h1 className="text-2xl font-bold">Tool: {toolName}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        This tool is not yet implemented. Visit the tools dashboard to try other tools.
      </p>
      <div className="mt-4">
        <Link href="/tools" className="px-4 py-2 bg-primary text-white rounded">Back to Tools</Link>
      </div>
    </section>
  );
}
