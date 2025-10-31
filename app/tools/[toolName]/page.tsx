import ToolWorkspaceClient from './ToolWorkspaceClient';

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

// Optionally force static rendering for this route
export const dynamic = 'force-static';

export default function Page({ params }: { params: { toolName: string } }) {
  const { toolName } = params;
  // Server component: pass toolName to client component for interactivity
  return <ToolWorkspaceClient toolName={toolName} />;
}
