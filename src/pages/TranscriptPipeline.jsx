import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import TranscriptPipeline from '../components/TranscriptPipeline';

export default function TranscriptPipelinePage() {
  return (
    <>
      <SEO title="Transcript Pipeline" description="Synthesia transcript fetch and content gap analysis" noIndex />
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <TranscriptPipeline />
      </main>
    </>
  );
}
