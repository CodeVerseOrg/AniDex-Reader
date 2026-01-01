'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Globe,
  BookOpen,
  Database,
} from 'lucide-react';
import type { SourceChapter, MangaSource } from '@/types';
import { getRelativeTime, getLanguageName, cn } from '@/lib/utils';
import { SOURCE_INFO } from '@/lib/sources';

interface MultiSourceChapterListProps {
  chapters: SourceChapter[];
  mangaId: string;
  sourceId: string;
  source: MangaSource;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  availableLanguages: string[];
  availableSources?: { source: MangaSource; sourceId: string }[];
  onSourceChange?: (source: MangaSource, sourceId: string) => void;
}

export function MultiSourceChapterList({
  chapters,
  mangaId,
  sourceId,
  source,
  currentLanguage,
  onLanguageChange,
  availableLanguages,
  availableSources,
  onSourceChange,
}: MultiSourceChapterListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupByVolume, setGroupByVolume] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());

  const sortedChapters = [...chapters].sort((a, b) => {
    const aNum = parseFloat(a.chapter || '0');
    const bNum = parseFloat(b.chapter || '0');
    return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
  });

  // Group chapters by volume
  const groupChaptersByVolume = (chapters: SourceChapter[]) => {
    const groups: Record<string, SourceChapter[]> = {};
    chapters.forEach((chapter) => {
      const volume = chapter.volume || 'No Volume';
      if (!groups[volume]) {
        groups[volume] = [];
      }
      groups[volume].push(chapter);
    });
    return groups;
  };

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

  // Build URL with source info
  const buildChapterUrl = (chapter: SourceChapter) => {
    const params = new URLSearchParams();
    if (chapter.source !== 'mangadex') params.set('source', chapter.source);
    params.set('sourceId', sourceId);
    const queryString = params.toString();
    return `/read/${mangaId}/${chapter.id}${queryString ? `?${queryString}` : ''}`;
  };

  const formatChapterNumber = (chapter: SourceChapter) => {
    if (!chapter.chapter) return 'Oneshot';
    const vol = chapter.volume ? `Vol. ${chapter.volume} ` : '';
    return `${vol}Ch. ${chapter.chapter}`;
  };

  const sourceInfo = SOURCE_INFO[source];

  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            Chapters
            <span className="text-dark-400 font-normal">({chapters.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Source Selector */}
            {availableSources && availableSources.length > 1 && onSourceChange && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-dark-400" />
                <select
                  value={source}
                  onChange={(e) => {
                    const selectedSource = availableSources.find(
                      (s) => s.source === e.target.value
                    );
                    if (selectedSource) {
                      onSourceChange(selectedSource.source, selectedSource.sourceId);
                    }
                  }}
                  className="bg-dark-700 border border-dark-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {availableSources.map((s) => (
                    <option key={s.source} value={s.source}>
                      {SOURCE_INFO[s.source]?.name || s.source}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Source Badge */}
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
              style={{ backgroundColor: sourceInfo?.color || '#666' }}
            >
              <span>{sourceInfo?.icon}</span>
              <span>{sourceInfo?.name || source}</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-dark-400" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-dark-700 border border-dark-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-300 hover:text-white transition-colors"
            >
              {sortOrder === 'desc' ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>

            {/* Group by Volume Toggle */}
            <button
              onClick={() => setGroupByVolume(!groupByVolume)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                groupByVolume
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 border border-dark-600 text-dark-300 hover:text-white'
              )}
            >
              Group by Volume
            </button>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="max-h-[600px] overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-dark-400">
            No chapters available for this language from {sourceInfo?.name || source}.
          </div>
        ) : groupByVolume && groupedChapters ? (
          // Grouped view
          <div className="divide-y divide-dark-700">
            {Object.entries(groupedChapters).map(([volume, volumeChapters]) => (
              <div key={volume}>
                <button
                  onClick={() => toggleVolume(volume)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 hover:bg-dark-750 transition-colors"
                >
                  <span className="font-medium text-white">
                    {volume === 'No Volume' ? 'No Volume' : `Volume ${volume}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dark-400">
                      {volumeChapters.length} chapters
                    </span>
                    {expandedVolumes.has(volume) ? (
                      <ChevronUp className="w-5 h-5 text-dark-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-dark-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedVolumes.has(volume) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {volumeChapters.map((chapter) => (
                        <ChapterItem
                          key={chapter.id}
                          chapter={chapter}
                          mangaId={mangaId}
                          buildUrl={buildChapterUrl}
                          formatNumber={formatChapterNumber}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          // Flat list
          <div className="divide-y divide-dark-700/50">
            {sortedChapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                mangaId={mangaId}
                buildUrl={buildChapterUrl}
                formatNumber={formatChapterNumber}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Chapter item component
function ChapterItem({
  chapter,
  mangaId,
  buildUrl,
  formatNumber,
}: {
  chapter: SourceChapter;
  mangaId: string;
  buildUrl: (chapter: SourceChapter) => string;
  formatNumber: (chapter: SourceChapter) => string;
}) {
  return (
    <Link
      href={buildUrl(chapter)}
      className="block px-4 py-3 hover:bg-dark-700/50 transition-colors group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white group-hover:text-primary-500 transition-colors">
              {formatNumber(chapter)}
            </span>
            {chapter.title && (
              <span className="text-dark-400 truncate">
                - {chapter.title}
              </span>
            )}
            {/* Source badge for mixed sources */}
            {chapter.source !== 'mangadex' && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: SOURCE_INFO[chapter.source]?.color || '#666' }}
              >
                {SOURCE_INFO[chapter.source]?.icon}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-dark-400">
            {chapter.scanlationGroup && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {chapter.scanlationGroup}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getRelativeTime(chapter.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {getLanguageName(chapter.language)}
            </span>
          </div>
        </div>
        <div className="text-dark-400 group-hover:text-primary-500 transition-colors">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

export function MultiSourceChapterListSkeleton() {
  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-dark-700 rounded" />
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-dark-700 rounded" />
            <div className="h-8 w-24 bg-dark-700 rounded" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-dark-700/50">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-5 w-48 bg-dark-700 rounded mb-2" />
            <div className="h-4 w-64 bg-dark-700/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
