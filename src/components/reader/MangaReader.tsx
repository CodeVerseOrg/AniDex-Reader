'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  RotateCcw,
  Columns,
  AlignVerticalJustifyStart,
  Home,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useReaderStore, useHistoryStore } from '@/store';
import { cn, preloadImage, requestFullscreen, exitFullscreen, isFullscreen } from '@/lib/utils';
import { SOURCE_INFO } from '@/lib/sources';
import type { ReaderMode, ReaderTheme, MangaSource, SourceChapter } from '@/types';

interface ChapterNav {
  id: string;
  attributes: { chapter: string | null };
}

interface MangaReaderProps {
  mangaId: string;
  mangaTitle: string;
  coverUrl: string;
  chapterId: string;
  chapterNumber: string;
  imageUrls: string[];
  prevChapter: ChapterNav | null;
  nextChapter: ChapterNav | null;
  source?: MangaSource;
  sourceId?: string;
}

export function MangaReader({
  mangaId,
  mangaTitle,
  coverUrl,
  chapterId,
  chapterNumber,
  imageUrls,
  prevChapter,
  nextChapter,
  source = 'comick',
  sourceId,
}: MangaReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  
  // Build chapter URLs with source info
  const buildChapterUrl = (chapter: ChapterNav | null) => {
    if (!chapter) return null;
    const params = new URLSearchParams();
    if (source !== 'comick') params.set('source', source);
    if (sourceId) params.set('sourceId', sourceId);
    const queryString = params.toString();
    return `/read/${mangaId}/${chapter.id}${queryString ? `?${queryString}` : ''}`;
  };
  
  const {
    settings,
    setMode,
    setTheme,
    setZoom,
    currentPage,
    setCurrentPage,
    setTotalPages,
    isFullscreen: isFullscreenState,
    setFullscreen,
    isSettingsOpen,
    setSettingsOpen,
    nextPage,
    prevPage,
  } = useReaderStore();

  const { addToHistory } = useHistoryStore();

  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showControls, setShowControls] = useState(true);
  const [showPageIndicator, setShowPageIndicator] = useState(false);

  // Initialize
  useEffect(() => {
    setTotalPages(imageUrls.length);
    setCurrentPage(0);
  }, [imageUrls.length, setTotalPages, setCurrentPage]);

  // Save to history
  useEffect(() => {
    if (mangaId && chapterId) {
      addToHistory({
        mangaId,
        title: mangaTitle,
        coverUrl,
        lastChapterId: chapterId,
        lastChapterNumber: chapterNumber,
        lastPage: currentPage,
      });
    }
  }, [mangaId, chapterId, currentPage, mangaTitle, coverUrl, chapterNumber, addToHistory]);

  // Preload images
  useEffect(() => {
    const preloadAhead = settings.preloadPages;
    const toPreload = [];
    
    for (let i = currentPage; i < Math.min(currentPage + preloadAhead + 1, imageUrls.length); i++) {
      if (!loadedImages.has(i)) {
        toPreload.push(i);
      }
    }

    toPreload.forEach((index) => {
      preloadImage(imageUrls[index]).then(() => {
        setLoadedImages((prev) => new Set(prev).add(index));
      });
    });
  }, [currentPage, imageUrls, settings.preloadPages, loadedImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
          if (settings.mode === 'horizontal') nextPage();
          break;
        case 'ArrowLeft':
        case 'a':
          if (settings.mode === 'horizontal') prevPage();
          break;
        case 'ArrowDown':
        case 's':
          if (settings.mode === 'vertical') nextPage();
          break;
        case 'ArrowUp':
        case 'w':
          if (settings.mode === 'vertical') prevPage();
          break;
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '+':
        case '=':
          setZoom(settings.zoom + 10);
          break;
        case '-':
          setZoom(settings.zoom - 10);
          break;
        case '0':
          setZoom(100);
          break;
        case 'Escape':
          if (isFullscreenState) toggleFullscreen();
          setSettingsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.mode, settings.zoom, nextPage, prevPage, setZoom, isFullscreenState, setSettingsOpen]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    if (isFullscreen()) {
      await exitFullscreen();
      setFullscreen(false);
    } else {
      await requestFullscreen(containerRef.current);
      setFullscreen(true);
    }
  }, [setFullscreen]);

  // Scroll to page in vertical mode
  const scrollToPage = useCallback((pageIndex: number) => {
    if (settings.mode === 'vertical' && readerRef.current) {
      const pageElement = readerRef.current.children[pageIndex] as HTMLElement;
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [settings.mode]);

  // Track scroll position in vertical mode
  useEffect(() => {
    if (settings.mode !== 'vertical' || !readerRef.current) return;

    const handleScroll = () => {
      if (!readerRef.current) return;
      
      const container = readerRef.current;
      const scrollTop = container.scrollTop;
      const pages = Array.from(container.children) as HTMLElement[];
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const rect = page.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        if (rect.top >= containerRect.top && rect.top < containerRect.bottom) {
          if (currentPage !== i) {
            setCurrentPage(i);
          }
          break;
        }
      }
    };

    const reader = readerRef.current;
    reader.addEventListener('scroll', handleScroll);
    return () => reader.removeEventListener('scroll', handleScroll);
  }, [settings.mode, currentPage, setCurrentPage]);

  // Handle page click navigation
  const handlePageClick = (e: React.MouseEvent) => {
    if (settings.mode !== 'horizontal') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      prevPage();
    } else if (x > (width * 2) / 3) {
      nextPage();
    } else {
      setShowControls(!showControls);
    }
  };

  const themeStyles = {
    light: 'bg-white',
    dark: 'bg-dark-950',
    sepia: 'bg-amber-50',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 flex flex-col',
        themeStyles[settings.theme]
      )}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent"
          >
            <div className="flex items-center gap-4">
              <Link
                href={`/manga/${mangaId}`}
                className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-white font-medium line-clamp-1">{mangaTitle}</h1>
                <p className="text-white/60 text-sm">Chapter {chapterNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsOpen(!isSettingsOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isSettingsOpen
                    ? 'bg-primary-500 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                {isFullscreenState ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 bottom-0 w-72 z-40 bg-dark-900 border-l border-dark-700 p-4 overflow-y-auto"
          >
            <h3 className="text-white font-semibold mb-4">Reader Settings</h3>
            
            {/* Reading Mode */}
            <div className="mb-6">
              <label className="text-dark-300 text-sm mb-2 block">Reading Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('vertical')}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                    settings.mode === 'vertical'
                      ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                  )}
                >
                  <AlignVerticalJustifyStart className="w-5 h-5" />
                  <span className="text-xs">Vertical</span>
                </button>
                <button
                  onClick={() => setMode('horizontal')}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                    settings.mode === 'horizontal'
                      ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                  )}
                >
                  <Columns className="w-5 h-5" />
                  <span className="text-xs">Horizontal</span>
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="text-dark-300 text-sm mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'sepia'] as ReaderTheme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setTheme(theme)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors',
                      settings.theme === theme
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                        : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
                    )}
                  >
                    {theme === 'light' && <Sun className="w-4 h-4" />}
                    {theme === 'dark' && <Moon className="w-4 h-4" />}
                    {theme === 'sepia' && <BookOpen className="w-4 h-4" />}
                    <span className="text-xs capitalize">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div className="mb-6">
              <label className="text-dark-300 text-sm mb-2 block">
                Zoom: {settings.zoom}%
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(settings.zoom - 10)}
                  className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-300 hover:border-dark-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setZoom(settings.zoom + 10)}
                  className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-300 hover:border-dark-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setZoom(100)}
                className="mt-2 flex items-center gap-1 text-sm text-dark-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="border-t border-dark-700 pt-4">
              <h4 className="text-dark-300 text-sm mb-2">Keyboard Shortcuts</h4>
              <div className="space-y-1 text-xs text-dark-400">
                <p>← → / A D: Navigate (Horizontal)</p>
                <p>↑ ↓ / W S: Navigate (Vertical)</p>
                <p>Space: Next Page</p>
                <p>F: Toggle Fullscreen</p>
                <p>+ / -: Zoom In/Out</p>
                <p>0: Reset Zoom</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reader Area */}
      <div
        ref={readerRef}
        onClick={handlePageClick}
        className={cn(
          'flex-1 overflow-auto',
          settings.mode === 'vertical' && 'flex flex-col items-center',
          settings.mode === 'horizontal' && 'flex items-center justify-center'
        )}
        style={{
          cursor: settings.mode === 'horizontal' ? 'pointer' : 'default',
        }}
      >
        {settings.mode === 'vertical' ? (
          // Vertical Mode - All pages stacked
          <div
            className="flex flex-col items-center py-4"
            style={{ width: `${settings.zoom}%`, maxWidth: '100%' }}
          >
            {imageUrls.map((url, index) => (
              <ReaderImage
                key={index}
                src={url}
                alt={`Page ${index + 1}`}
                index={index}
                isLoaded={loadedImages.has(index)}
                onLoad={() => setLoadedImages((prev) => new Set(prev).add(index))}
              />
            ))}
          </div>
        ) : (
          // Horizontal Mode - Single page
          <div
            className="relative flex items-center justify-center h-full"
            style={{ 
              transform: `scale(${settings.zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <ReaderImage
              src={imageUrls[currentPage]}
              alt={`Page ${currentPage + 1}`}
              index={currentPage}
              isLoaded={loadedImages.has(currentPage)}
              onLoad={() => setLoadedImages((prev) => new Set(prev).add(currentPage))}
              priority
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons (Horizontal mode) */}
      {settings.mode === 'horizontal' && showControls && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevPage(); }}
            disabled={currentPage === 0}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white transition-all',
              currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70'
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextPage(); }}
            disabled={currentPage === imageUrls.length - 1}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white transition-all',
              currentPage === imageUrls.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70'
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.footer
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-white/60 text-xs mb-1">
                <span>Page {currentPage + 1}</span>
                <span>{imageUrls.length} pages</span>
              </div>
              <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentPage + 1) / imageUrls.length) * 100}%` }}
                />
              </div>
              {/* Page Slider */}
              <input
                type="range"
                min="0"
                max={imageUrls.length - 1}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  setCurrentPage(page);
                  if (settings.mode === 'vertical') scrollToPage(page);
                }}
                className="w-full mt-2 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href={buildChapterUrl(prevChapter) || '#'}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  prevChapter
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                )}
                onClick={(e) => !prevChapter && e.preventDefault()}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Previous</span>
              </Link>

              <div className="flex items-center gap-2">
                {source && source !== 'comick' && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: SOURCE_INFO[source]?.color || '#666' }}
                  >
                    {SOURCE_INFO[source]?.name || source}
                  </span>
                )}
                <Link
                  href={`/manga/${mangaId}`}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5" />
                </Link>
              </div>

              <Link
                href={buildChapterUrl(nextChapter) || '#'}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  nextChapter
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                )}
                onClick={(e) => !nextChapter && e.preventDefault()}
              >
                <span className="text-sm">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual page image component
interface ReaderImageProps {
  src: string;
  alt: string;
  index: number;
  isLoaded: boolean;
  onLoad: () => void;
  priority?: boolean;
}

function ReaderImage({ src, alt, index, isLoaded, onLoad, priority }: ReaderImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full flex justify-center">
      {loading && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 min-h-[500px]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center bg-dark-800 min-h-[500px] p-8">
          <p className="text-dark-400">Failed to load image</p>
          <button
            onClick={() => { setError(false); setLoading(true); }}
            className="mt-2 text-primary-500 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={800}
          height={1200}
          className={cn(
            'max-w-full h-auto object-contain transition-opacity',
            loading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => { setLoading(false); onLoad(); }}
          onError={() => { setLoading(false); setError(true); }}
          priority={priority}
          unoptimized
        />
      )}
    </div>
  );
}
