'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Globe,
  BookOpen,
} from 'lucide-react';
import type { MangaDexChapter } from '@/types';
import { formatChapterNumber, getScanlationGroup, groupChaptersByVolume } from '@/lib/mangadex';
import { getRelativeTime, getLanguageName, cn } from '@/lib/utils';

interface ChapterListProps {
  chapters: MangaDexChapter[];
  mangaId: string;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  availableLanguages: string[];
}

export function ChapterList({
  chapters,
  mangaId,
  currentLanguage,
  onLanguageChange,
  availableLanguages,
}: ChapterListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupByVolume, setGroupByVolume] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());

  const sortedChapters = [...chapters].sort((a, b) => {
    const aNum = parseFloat(a.attributes.chapter || '0');
    const bNum = parseFloat(b.attributes.chapter || '0');
    return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
  });

  const groupedChapters = groupByVolume
    ? groupChaptersByVolume(sortedChapters)
    : null;

  const toggleVolume = (volume: string) => {
    const newExpanded = new Set(expandedVolumes);
    if (newExpanded.has(volume)) {
      newExpanded.delete(volume);
    } else {
      newExpanded.add(volume);
    }
    setExpandedVolumes(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-dark-400" />
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white hover:bg-dark-600 transition-colors"
        >
          {sortOrder === 'desc' ? (
            <>
              <ChevronDown className="w-4 h-4" />
              Newest First
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              Oldest First
            </>
          )}
        </button>

        {/* Group by Volume */}
        <button
          onClick={() => setGroupByVolume(!groupByVolume)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors',
            groupByVolume
              ? 'bg-primary-500/20 border-primary-500 text-primary-400'
              : 'bg-dark-700 border-dark-600 text-white hover:bg-dark-600'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Group by Volume
        </button>

        {/* Chapter Count */}
        <span className="text-dark-400 text-sm ml-auto">
          {chapters.length} chapters
        </span>
      </div>

      {/* Chapter List */}
      <div className="space-y-2">
        {groupByVolume && groupedChapters ? (
          // Grouped View
          Array.from(groupedChapters.entries()).map(([volume, volumeChapters]) => (
            <div key={volume} className="border border-dark-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleVolume(volume)}
                className="w-full flex items-center justify-between p-3 bg-dark-800 hover:bg-dark-700 transition-colors"
              >
                <span className="font-medium text-white">
                  {volume === 'No Volume' ? 'No Volume' : `Volume ${volume}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-dark-400 text-sm">
                    {volumeChapters.length} chapters
                  </span>
                  {expandedVolumes.has(volume) ? (
                    <ChevronUp className="w-4 h-4 text-dark-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-dark-400" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {expandedVolumes.has(volume) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    {volumeChapters.map((chapter) => (
                      <ChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        mangaId={mangaId}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          // Flat View
          sortedChapters.map((chapter) => (
            <ChapterRow key={chapter.id} chapter={chapter} mangaId={mangaId} />
          ))
        )}
      </div>
    </div>
  );
}

interface ChapterRowProps {
  chapter: MangaDexChapter;
  mangaId: string;
}

function ChapterRow({ chapter, mangaId }: ChapterRowProps) {
  const scanlationGroup = getScanlationGroup(chapter);
  const chapterTitle = formatChapterNumber(chapter);
  const uploadDate = getRelativeTime(chapter.attributes.publishAt);

  return (
    <motion.a
      href={`/read/${mangaId}/${chapter.id}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 bg-dark-800/30 hover:bg-dark-700/50 border border-dark-700/50 rounded-lg transition-colors group"
    >
      {/* Chapter Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white group-hover:text-primary-400 transition-colors truncate">
          {chapterTitle}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {scanlationGroup}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {uploadDate}
          </span>
        </div>
      </div>

      {/* Page Count */}
      {chapter.attributes.pages > 0 && (
        <span className="text-dark-400 text-sm">
          {chapter.attributes.pages} pages
        </span>
      )}
    </motion.a>
  );
}

// Skeleton
export function ChapterListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-dark-800/50 rounded-lg animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-dark-800/30 border border-dark-700/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
