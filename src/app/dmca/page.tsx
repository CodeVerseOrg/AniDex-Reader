import Link from 'next/link';
import { Shield, AlertTriangle, Mail, FileText } from 'lucide-react';

export default function DMCAPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-primary-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">DMCA & Copyright</h1>
            <p className="text-dark-400">Information about content takedowns</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notice */}
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                  Important Notice
                </h2>
                <p className="text-dark-300">
                  AniDex Reader does not host, store, or distribute any copyrighted
                  content. All manga images are sourced from third-party APIs,
                  and metadata is obtained from AniList's public API.
                </p>
              </div>
            </div>
          </div>

          {/* Content Source */}
          <section className="p-6 bg-dark-800/50 border border-dark-700 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Content Sources
            </h2>
            <div className="space-y-4 text-dark-300">
              <p>
                <strong className="text-white">Images:</strong> All manga pages and
                cover images are streamed from third-party sources.
                We do not host or cache any images on our servers.
              </p>
              <p>
                <strong className="text-white">Metadata:</strong> Manga information
                including titles, descriptions, ratings, and genres are fetched from
                AniList's public GraphQL API.
              </p>
              <p>
                <strong className="text-white">Chapter Data:</strong> Chapter
                listings and reading order are provided by third-party APIs.
              </p>
            </div>
          </section>

          {/* DMCA Process */}
          <section className="p-6 bg-dark-800/50 border border-dark-700 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              DMCA Takedown Process
            </h2>
            <div className="space-y-4 text-dark-300">
              <p>
                If you believe that content accessible through our service infringes
                your copyright, please note the following:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>
                  We do not host the content directly. We aggregate content from
                  third-party sources.
                </li>
                <li>
                  For metadata concerns, please contact{' '}
                  <a
                    href="https://anilist.co/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                  >
                    AniList
                  </a>
                  .
                </li>
                <li>
                  If you need us to block specific content from appearing on our
                  platform, please contact us with proper documentation.
                </li>
              </ol>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 bg-dark-800/50 border border-dark-700 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-500" />
              Contact Information
            </h2>
            <div className="text-dark-300">
              <p className="mb-4">
                For DMCA takedown requests or copyright concerns, please email:
              </p>
              <a
                href="mailto:dmca@anidex-reader.com"
                className="text-primary-500 hover:underline text-lg"
              >
                dmca@anidex-reader.com
              </a>
              <p className="mt-4 text-sm text-dark-500">
                Please include the following in your request:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-dark-500 pl-4">
                <li>Identification of the copyrighted work</li>
                <li>URL of the infringing content</li>
                <li>Your contact information</li>
                <li>Statement of good faith belief</li>
                <li>Statement of accuracy and authorization</li>
              </ul>
            </div>
          </section>

          {/* Credits */}
          <section className="p-6 bg-dark-800/50 border border-dark-700 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Scanlation Group Credits
            </h2>
            <p className="text-dark-300">
              We believe in giving credit where it's due. All chapter listings
              display the scanlation group that translated/cleaned the chapter. We
              encourage users to support these groups and the original creators by
              purchasing official releases when available.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-500 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
