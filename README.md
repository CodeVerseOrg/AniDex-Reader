---
description: A modern, feature-rich manga reading website built with Next.js, React, and Tailwind CSS.
---

# AniDex Reader

<figure><img src="https://via.placeholder.com/1200x630/111827/f97316?text=AniDex+Reader" alt="AniDex Reader Banner"><figcaption><p>AniDex Reader - Modern Manga Reading Experience</p></figcaption></figure>

## Overview

AniDex Reader is a modern manga reading platform that provides a seamless reading experience with features like multiple reading modes, theme customization, and smart chapter navigation.

{% hint style="info" %}
This project uses [AniList](https://anilist.co) for manga metadata and the MangaDex API for chapter content.
{% endhint %}

## Features

### Core Features

* **Home Page** - Trending manga, popular titles, top rated, and recently updated
* **Advanced Search** - Search with filters for genre, status, year, and popularity
* **Manga Details** - Comprehensive information with cover, description, genres, tags, and ratings
* **Chapter List** - Browse chapters with sorting and volume grouping

### Manga Reader

* **Multiple Reading Modes** - Vertical scroll and horizontal page-by-page
* **Theme Options** - Light, dark, and sepia reading modes
* **Zoom Controls** - Zoom in/out with mouse wheel or keyboard
* **Fullscreen Mode** - Immersive reading experience
* **Keyboard Navigation** - Arrow keys, WASD, and space for navigation
* **Page Progress** - Visual progress indicator and page slider
* **Smart Preloading** - Preloads upcoming pages for smooth reading
* **Chapter Navigation** - Quick access to previous/next chapters

### UI/UX

* **Modern Design** - Clean, modern interface
* **Mobile-First** - Fully responsive design for all devices
* **Dark Mode** - Eye-friendly dark theme by default
* **Smooth Animations** - Framer Motion powered transitions
* **Skeleton Loaders** - Loading states for better UX
* **Infinite Scroll** - Seamless content loading

### Performance

* **API Caching** - Server-side caching for faster responses
* **Image Optimization** - Next.js Image component with lazy loading
* **Debounced Search** - Optimized API calls
* **State Management** - Zustand for efficient state handling

## Tech Stack

| Category | Technology                     |
| -------- | ------------------------------ |
| Frontend | Next.js 14, React 18, TypeScript |
| Styling  | Tailwind CSS, Framer Motion    |
| State    | Zustand, React Query           |
| APIs     | AniList GraphQL, MangaDex API |
| Backend  | Node.js, Express               |
| Caching  | node-cache                     |

## Project Structure

```
anidex-reader/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── search/            # Search page
│   │   ├── manga/[id]/        # Manga details page
│   │   ├── read/[mangaId]/[chapterId]/  # Reader page
│   │   ├── trending/          # Trending manga
│   │   ├── popular/           # Popular manga
│   │   ├── history/           # Reading history
│   │   └── dmca/              # DMCA/Legal page
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── manga/             # MangaCard, MangaGrid, ChapterList
│   │   ├── reader/            # MangaReader
│   │   └── ui/                # Skeleton, SearchInput, Filters
│   ├── lib/
│   │   ├── anilist.ts         # AniList GraphQL API client
│   │   ├── mangadex.ts        # MangaDex API client
│   │   ├── sources.ts         # Chapter source handling
│   │   └── utils.ts           # Utility functions
│   ├── hooks/
│   │   └── useApi.ts          # React Query hooks
│   ├── store/
│   │   └── index.ts           # Zustand stores
│   ├── providers/
│   │   └── index.tsx          # React Query provider
│   └── types/
│       └── index.ts           # TypeScript types
├── server/
│   └── index.js               # Express backend server
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

{% hint style="warning" %}
Make sure you have Node.js 18 or higher installed on your system.
{% endhint %}

* Node.js 18+
* npm or yarn

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/anidex-reader.git
cd anidex-reader
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set up environment variables

```bash
cp .env.example .env
```

#### 4. Start development servers

```bash
# Start both frontend and backend
npm run dev:all

# Or start separately:
npm run dev     # Frontend on http://localhost:3000
npm run server  # Backend on http://localhost:3001
```

#### 5. Open in browser

```
http://localhost:3000
```

## API Integration

### AniList GraphQL API

Used for manga metadata, search, and filtering.

{% tabs %}
{% tab title="Query Example" %}
```typescript
// Example: Fetch trending manga
const TRENDING_QUERY = gql`
  query TrendingManga($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        hasNextPage
      }
      media(type: MANGA, sort: TRENDING_DESC) {
        id
        title { romaji english }
        coverImage { large }
        averageScore
        genres
      }
    }
  }
`;
```
{% endtab %}
{% endtabs %}

### MangaDex API

Used for manga chapters and images.

{% tabs %}
{% tab title="Search Manga" %}
```typescript
// Search manga
const response = await fetch(
  'https://api.mangadex.org/manga?title=one%20piece'
);
```
{% endtab %}
{% endtabs %}

## Reader Keyboard Shortcuts

| Key                   | Action                           |
| --------------------- | -------------------------------- |
| `←` `→` / `A` `D`     | Navigate pages (horizontal mode) |
| `↑` `↓` / `W` `S`     | Navigate pages (vertical mode)   |
| `Space`               | Next page                        |
| `F`                   | Toggle fullscreen                |
| `+` / `-`             | Zoom in/out                      |
| `0`                   | Reset zoom                       |
| `Esc`                 | Exit fullscreen / Close settings |

## Deployment

### Vercel (Recommended)

{% hint style="success" %}
Vercel is the recommended deployment platform for Next.js applications with zero configuration required.
{% endhint %}

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/anidex-reader)

#### Manual Deployment

**Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**Step 2: Import to Vercel**

* Go to [vercel.com/new](https://vercel.com/new)
* Select your GitHub repository
* Vercel will auto-detect Next.js

**Step 3: Configure Project**

| Setting           | Value                  |
| ----------------- | ---------------------- |
| Framework Preset  | Next.js (auto-detected) |
| Build Command     | `npm run build`        |
| Output Directory  | `.next`                |
| Install Command   | `npm install`          |

**Step 4: Set Environment Variables** (optional)

```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Step 5: Deploy**

Click "Deploy" and your app will be live in ~2 minutes!

#### Vercel Features Used

* **Serverless Functions** - API routes for proxying
* **Edge Caching** - Automatic CDN caching for API responses
* **Standalone Output** - Optimized production build
* **Zero Config** - Works out of the box with `vercel.json`

### Alternative Platforms

{% tabs %}
{% tab title="Cloudflare Pages" %}
```bash
# Build command
npm run build

# Output directory  
.next

# Node.js version
18.x
```
{% endtab %}

{% tab title="Railway / Render" %}
```bash
# Build command
npm run build

# Start command
npm start

# Port
3000
```
{% endtab %}

{% tab title="Docker" %}
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```
{% endtab %}
{% endtabs %}

### Local Backend (Optional)

The Express backend is optional for local development with caching:

```bash
# Start backend separately
npm run server  # Runs on port 3001

# With PM2 for production
pm2 start server/index.js --name anidex-api
```

## Legal & Credits

### Important Notices

{% hint style="danger" %}
**Disclaimer:** This project is for educational purposes only. Please support official manga releases.
{% endhint %}

* **No Image Hosting** - All images are streamed from third-party sources
* **Metadata Only** - We only store/cache API responses, not copyrighted content
* **DMCA Compliant** - See [/dmca](/dmca) page for takedown procedures

### Credits

| Service                                          | Purpose                   |
| ------------------------------------------------ | ------------------------- |
| [AniList](https://anilist.co)                    | Manga metadata and search |
| [MangaDex API](https://api.mangadex.org) | Chapter content |
| Original creators                                | Manga authors and artists |

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

{% hint style="info" %}
Please read our contribution guidelines before submitting a PR.
{% endhint %}

## Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend
PORT=3001
FRONTEND_URL=http://localhost:3000

# Optional: Database (for user accounts)
DATABASE_URL=postgresql://...

# Optional: Auth
JWT_SECRET=your-secret-key
```

## Troubleshooting

### Common Issues

{% tabs %}
{% tab title="Images not loading" %}
**Problem:** Manga images fail to load or show broken image icons.

**Solutions:**
1. Check if the image CDN is accessible in your region
2. Ensure `next.config.js` has correct image domains configured
3. Clear browser cache and try again
4. Check browser console for CORS errors
{% endtab %}

{% tab title="Chapters not found" %}
**Problem:** No chapters appear for a manga title.

**Solutions:**
1. The manga may not be available in the Consumet API
2. Try searching for the exact title
3. Check if the AniList ID is correct
4. Try a different manga to test if the API is working
{% endtab %}

{% tab title="Build errors" %}
**Problem:** Build fails with TypeScript or ESLint errors.

**Solutions:**
1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors: `npm run type-check`
3. Fix lint errors: `npm run lint:fix`
4. Clear `.next` folder and rebuild
{% endtab %}
{% endtabs %}

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using Next.js and React</p>
  <p>
    <a href="https://github.com/yourusername/anidex-reader">GitHub</a> •
    <a href="https://anidex-reader.vercel.app">Demo</a> •
    <a href="/dmca">DMCA</a>
  </p>
</div>
