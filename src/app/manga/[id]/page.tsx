'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  BookOpen,
  Calendar,
  Users,
  Eye,
  Heart,
  Play,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { useMangaWithMultiSourceChapters } from '@/hooks/useApi';
import { MultiSourceChapterList, MultiSourceChapterListSkeleton } from '@/components/manga';
import { DetailsSkeleton } from '@/components/ui';
import { getDisplayTitle, formatStatus, formatDate } from '@/lib/anilist';
import { formatNumber, stripHtml, truncateText, cn } from '@/lib/utils';
import type { MangaSource } from '@/types';

interface MangaDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function MangaDetailsPage({ params }: MangaDetailsPageProps) {
  const { id } = use(params);
  const mangaId = parseInt(id);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { manga, source, sourceId, chapters, languages, isLoading, isError } = useMangaWithMultiSourceChapters(mangaId, selectedLanguage);

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (isError || !manga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Manga Not Found</h1>
          <p className="text-dark-400 mb-4">The requested manga could not be found.</p>
          <Link href="/" className="text-primary-500 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const title = getDisplayTitle(manga.title);
  const status = formatStatus(manga.status);
  const description = manga.description ? stripHtml(manga.description) : null;
  const authors = manga.staff?.edges
    .filter((e) => e.role.toLowerCase().includes('story') || e.role.toLowerCase().includes('art'))
    .map((e) => e.node.name.full) || [];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      {manga.bannerImage && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src={manga.bannerImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('relative', manga.bannerImage ? '-mt-32' : 'pt-8')}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0"
            >
              <div className="relative w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-dark-900">
                <Image
                  src={manga.coverImage.extraLarge || manga.coverImage.large}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {title}
              </h1>
              {manga.title.native && (
                <p className="text-dark-400 text-lg mb-4">{manga.title.native}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {manga.averageScore && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">
                      {manga.averageScore}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-dark-300">
                  <Eye className="w-5 h-5" />
                  <span>{formatNumber(manga.popularity)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-dark-300">
                  <Heart className="w-5 h-5" />
                  <span>{formatNumber(manga.favourites)}</span>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    manga.status === 'RELEASING'
                      ? 'bg-green-500/20 text-green-400'
                      : manga.status === 'FINISHED'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-dark-700 text-dark-300'
                  )}
                >
                  {status}
                </span>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {manga.chapters && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <BookOpen className="w-4 h-4" />
                    <span>{manga.chapters} Chapters</span>
                  </div>
                )}
                {manga.volumes && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <BookOpen className="w-4 h-4" />
                    <span>{manga.volumes} Volumes</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-dark-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(manga.startDate)}</span>
                </div>
                {authors.length > 0 && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <Users className="w-4 h-4" />
                    <span className="truncate">{authors.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/search?genre=${genre}`}
                    className="px-3 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-full text-sm text-dark-200 hover:text-primary-400 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              {/* Description */}
              {description && (
                <div className="mb-6">
                  <p className="text-dark-300 leading-relaxed">
                    {showFullDescription
                      ? description
                      : truncateText(description, 300)}
                  </p>
                  {description.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary-500 hover:underline text-sm mt-2"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {chapters.length > 0 && sourceId && (
                  <Link
                    href={`/read/${id}/${chapters[0].id}?source=${source}&sourceId=${sourceId}`}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Reading
                  </Link>
                )}
                <a
                  href={`https://anilist.co/manga/${manga.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  AniList
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tags */}
        {manga.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-4 bg-dark-800/50 border border-dark-700 rounded-xl"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {manga.tags.slice(0, 20).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300"
                >
                  {tag.name}
                  {tag.rank > 0 && (
                    <span className="ml-1 text-dark-500">{tag.rank}%</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chapters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-16"
        >
          {!source || !sourceId ? (
            <div className="p-8 bg-dark-800/50 border border-dark-700 rounded-xl text-center">
              <p className="text-dark-400 mb-2">
                Chapters not available
              </p>
              <p className="text-dark-500 text-sm">
                This manga may not be available for reading on MangaPlus.
              </p>
            </div>
          ) : chapters.length === 0 ? (
            <MultiSourceChapterListSkeleton />
          ) : (
            <MultiSourceChapterList
              chapters={chapters}
              mangaId={id}
              sourceId={sourceId}
              source={source}
              currentLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              availableLanguages={languages}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
