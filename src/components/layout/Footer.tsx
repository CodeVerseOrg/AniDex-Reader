import Link from 'next/link';
import { BookOpen, Github, Twitter, Heart } from 'lucide-react';

const footerLinks = {
  browse: [
    { label: 'Trending', href: '/trending' },
    { label: 'Popular', href: '/popular' },
    { label: 'Top Rated', href: '/top-rated' },
    { label: 'New Releases', href: '/new' },
  ],
  genres: [
    { label: 'Action', href: '/search?genre=Action' },
    { label: 'Romance', href: '/search?genre=Romance' },
    { label: 'Fantasy', href: '/search?genre=Fantasy' },
    { label: 'Comedy', href: '/search?genre=Comedy' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'DMCA', href: '/dmca' },
    { label: 'Contact', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">
                Ani<span className="text-primary-500">Dex</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm">
              A modern manga reading experience powered by AniList.
              Read your favorite manga for free.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-white font-semibold mb-4">Browse</h3>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold mb-4">Genres</h3>
            <ul className="space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-12 pt-8 border-t border-dark-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} AniDex Reader. All rights reserved.
            </p>
            <p className="text-dark-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" /> using{' '}
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                AniList
              </a>
            </p>
          </div>
          <p className="text-dark-600 text-xs text-center mt-4">
            AniDex Reader does not host any images. All credits go to the respective
            scanlation groups and original creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
