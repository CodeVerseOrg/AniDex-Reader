'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  className,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-dark-800 border rounded-lg text-sm transition-colors',
          value
            ? 'border-primary-500 text-primary-400'
            : 'border-dark-700 text-dark-300 hover:border-dark-600'
        )}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50"
            >
              {value && (
                <button
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-dark-400 hover:bg-dark-700 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors',
                    value === option.value
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-dark-300 hover:bg-dark-700'
                  )}
                >
                  {option.label}
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GenreFilterProps {
  genres: string[];
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
  className?: string;
}

export function GenreFilter({
  genres,
  selectedGenres,
  onChange,
  className,
}: GenreFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre));
    } else {
      onChange([...selectedGenres, genre]);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-dark-800 border rounded-lg text-sm transition-colors',
          selectedGenres.length > 0
            ? 'border-primary-500 text-primary-400'
            : 'border-dark-700 text-dark-300 hover:border-dark-600'
        )}
      >
        <span>
          {selectedGenres.length > 0
            ? `${selectedGenres.length} genres`
            : 'Genres'}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 p-3"
            >
              {selectedGenres.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-dark-400 hover:bg-dark-700 rounded text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-1">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors text-left',
                      selectedGenres.includes(genre)
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-700'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center',
                        selectedGenres.includes(genre)
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-dark-600'
                      )}
                    >
                      {selectedGenres.includes(genre) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
