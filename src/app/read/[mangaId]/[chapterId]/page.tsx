'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMultiSourceImages, useSourceChapterNavigation } from '@/hooks/useApi';
import { MangaReader } from '@/components/reader';
import { getChaptersFromSource } from '@/lib/sources';
import { Loader2, AlertCircle } from 'lucide-react';
import type { MangaSource, SourceChapter } from '@/types';

interface ReaderPageProps {
  params: Promise<{ mangaId: string; chapterId: string }>;
}

function ReaderLoading() {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-dark-400">Loading reader...</p>
      </div>
    </div>
  );
}

function ReaderContent({ mangaId, chapterId }: { mangaId: string; chapterId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get source from URL query params (default to consumet)
  const source = (searchParams.get('source') as MangaSource) || 'consumet';
  const sourceId = searchParams.get('sourceId') || mangaId;
  
  const [chapters, setChapters] = useState<SourceChapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  // Fetch chapter images from the appropriate source
  const { 
    data: multiSourceImages, 
    isLoading: imagesLoading, 
    isError: imagesError 
  } = useMultiSourceImages(source, chapterId);

  // Fetch chapters for navigation
  useEffect(() => {
    async function loadChapters() {
      setChaptersLoading(true);
      try {
        const fetchedChapters = await getChaptersFromSource(source, sourceId);
        setChapters(fetchedChapters);
      } catch (error) {
        console.error('Failed to load chapters:', error);
      }
      setChaptersLoading(false);
    }
    loadChapters();
  }, [source, sourceId]);

  // Get navigation using multi-source chapters
  const { currentChapter, prevChapter, nextChapter } = useSourceChapterNavigation(
    chapters,
    chapterId
  );

  if (imagesLoading || chaptersLoading) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (imagesError || !multiSourceImages || multiSourceImages.images.length === 0) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">Chapter Not Available</h1>
          <p className="text-dark-300 mb-2">
            This chapter's images could not be loaded.
          </p>
          <p className="text-dark-400 text-sm mb-6">
            This manga may be licensed and not available through free sources. 
            Try reading on official platforms like{' '}
            <a 
              href="https://www.webtoons.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              Webtoon
            </a>
            ,{' '}
            <a 
              href="https://www.crunchyroll.com/comics" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              Crunchyroll
            </a>
            , or{' '}
            <a 
              href="https://www.viz.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              VIZ
            </a>
            .
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-white"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push(`/manga/${mangaId}`)}
              className="px-6 py-2.5 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors text-white"
            >
              View Manga
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrls = multiSourceImages.images;
  const chapterNumber = currentChapter?.chapter || '1';
  const mangaTitle = 'Reading';

  // Convert SourceChapter to navigation format expected by MangaReader
  const prevNav = prevChapter ? {
    id: prevChapter.id,
    attributes: { chapter: prevChapter.chapter }
  } : null;
  
  const nextNav = nextChapter ? {
    id: nextChapter.id,
    attributes: { chapter: nextChapter.chapter }
  } : null;

  return (
    <MangaReader
      mangaId={mangaId}
      mangaTitle={mangaTitle}
      coverUrl=""
      chapterId={chapterId}
      chapterNumber={chapterNumber}
      imageUrls={imageUrls}
      prevChapter={prevNav as any}
      nextChapter={nextNav as any}
      source={source}
      sourceId={sourceId}
    />
  );
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { mangaId, chapterId } = use(params);
  
  return (
    <Suspense fallback={<ReaderLoading />}>
      <ReaderContent mangaId={mangaId} chapterId={chapterId} />
    </Suspense>
  );
}
