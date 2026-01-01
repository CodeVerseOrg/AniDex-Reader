'use client';

import { History, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useHistoryStore } from '@/store';
import { getRelativeTime } from '@/lib/utils';

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useHistoryStore();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Reading History</h1>
              <p className="text-dark-400">Continue where you left off</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-dark-300 mb-2">
              No Reading History
            </h2>
            <p className="text-dark-500 mb-6">
              Start reading manga to build your history
            </p>
            <Link
              href="/search"
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors inline-block"
            >
              Discover Manga
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <motion.div
                key={entry.mangaId + entry.lastChapterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-dark-600 transition-colors group"
              >
                {/* Cover */}
                <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  {entry.coverUrl ? (
                    <Image
                      src={entry.coverUrl}
                      alt={entry.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-700" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-dark-400 mt-1">
                    Chapter {entry.lastChapterNumber} • Page {entry.lastPage + 1}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">
                    {getRelativeTime(entry.timestamp)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/read/${entry.mangaId}/${entry.lastChapterId}`}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Continue
                  </Link>
                  <button
                    onClick={() => removeFromHistory(entry.mangaId)}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
