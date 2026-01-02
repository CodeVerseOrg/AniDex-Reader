# 📖 AniDex Reader

A modern, feature-rich manga reading website. Built with Next.js, React, and Tailwind CSS.

![AniDex Reader](https://via.placeholder.com/1200x630/111827/f97316?text=AniDex+Reader)

## ✨ Features

### 📚 Core Features
- **Home Page** - Trending manga, popular titles, top rated, and recently updated
- **Advanced Search** - Search with filters for genre, status, year, and popularity
- **Manga Details** - Comprehensive information with cover, description, genres, tags, and ratings
- **Chapter List** - Browse chapters with language selector, sorting, and volume grouping

### 📖 Manga Reader (High Priority)
- **Multiple Reading Modes** - Vertical scroll and horizontal page-by-page
- **Theme Options** - Light, dark, and sepia reading modes
- **Zoom Controls** - Zoom in/out with mouse wheel or keyboard
- **Fullscreen Mode** - Immersive reading experience
- **Keyboard Navigation** - Arrow keys, WASD, and space for navigation
- **Page Progress** - Visual progress indicator and page slider
- **Smart Preloading** - Preloads upcoming pages for smooth reading
- **Chapter Navigation** - Quick access to previous/next chapters

### 🎨 UI/UX
- **Modern Design** - Clean, modern interface
- **Mobile-First** - Fully responsive design for all devices
- **Dark Mode** - Eye-friendly dark theme by default
- **Smooth Animations** - Framer Motion powered transitions
- **Skeleton Loaders** - Loading states for better UX
- **Infinite Scroll** - Seamless content loading

### ⚡ Performance
- **API Caching** - Server-side caching for faster responses
- **Image Optimization** - Next.js Image component with lazy loading
- **Debounced Search** - Optimized API calls
- **State Management** - Zustand for efficient state handling

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand, React Query |
| APIs | AniList GraphQL, Comick REST |
| Backend | Node.js, Express |
| Caching | node-cache |

## 📁 Project Structure

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
│   │   ├── comick.ts          # Comick REST API client
│   │   ├── sources.ts         # Multi-source chapter handling
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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/anidex-reader.git
   cd anidex-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:all
   
   # Or start separately:
   npm run dev     # Frontend on http://localhost:3000
   npm run server  # Backend on http://localhost:3001
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📡 API Integration

### AniList GraphQL API

Used for manga metadata, search, and filtering.

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

### Comick REST API

Used for chapters and reading images.

```typescript
// Get chapters for a manga
const chapters = await axios.get('https://api.comick.fun/comic/{hid}/chapters', {
  params: {
    lang: 'en',
    page: 1,
    limit: 100,
  },
});

// Get chapter images
const images = await axios.get(`https://api.comick.fun/chapter/${hid}`);
const imageUrls = images.data.chapter.md_images.map(
  (img) => `https://meo.comick.pictures/${img.b2key}`
);
```

## 🎮 Reader Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` / `A` `D` | Navigate pages (horizontal mode) |
| `↑` `↓` / `W` `S` | Navigate pages (vertical mode) |
| `Space` | Next page |
| `F` | Toggle fullscreen |
| `+` / `-` | Zoom in/out |
| `0` | Reset zoom |
| `Esc` | Exit fullscreen / Close settings |

## 🌐 Deployment

### Vercel (Recommended - One-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/anidex-reader)

#### Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables** (optional)
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

#### Vercel Features Used

- **Serverless Functions** - API routes for Comick proxying
- **Edge Caching** - Automatic CDN caching for API responses  
- **Standalone Output** - Optimized production build
- **Zero Config** - Works out of the box with `vercel.json`

### Alternative Platforms

#### Cloudflare Pages

```bash
# Build command
npm run build

# Output directory  
.next

# Node.js version
18.x
```

#### Railway / Render

```bash
# Build command
npm run build

# Start command
npm start

# Port
3000
```

#### Docker

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

### Local Backend (Optional)

The Express backend is optional for local development with caching:

```bash
# Start backend separately
npm run server  # Runs on port 3001

# With PM2 for production
pm2 start server/index.js --name anidex-api
```

## ⚖️ Legal & Credits

### Important Notices

- **No Image Hosting** - All images are streamed directly from Comick CDN
- **Metadata Only** - We only store/cache API responses, not copyrighted content
- **DMCA Compliant** - See [/dmca](/dmca) page for takedown procedures

### Credits

- [AniList](https://anilist.co) - Manga metadata and search
- [Comick](https://comick.io) - Chapters and images
- Scanlation groups - Translations and cleaning
- Original creators - Manga authors and artists

### License

This project is for educational purposes. Please support official releases.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

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

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check if Comick CDN is accessible
   - Verify CORS settings in `next.config.js`

2. **API rate limiting**
   - Enable server-side caching
   - Use the backend proxy

3. **Search not working**
   - Ensure AniList API is reachable
   - Check for GraphQL query errors

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

---

<p align="center">
  Made with ❤️ for manga readers everywhere
</p>

<p align="center">
  <a href="https://github.com/yourusername/anidex-reader/stargazers">⭐ Star this repo</a> •
  <a href="https://github.com/yourusername/anidex-reader/issues">🐛 Report Bug</a> •
  <a href="https://github.com/yourusername/anidex-reader/issues">✨ Request Feature</a>
</p>