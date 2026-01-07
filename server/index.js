const express = require('express');
const cors = require('cors');
const compression = require('compression');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Cache setup - TTL in seconds
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every minute
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache stats
app.get('/api/cache/stats', (req, res) => {
  res.json({
    keys: cache.keys().length,
    stats: cache.getStats(),
  });
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared' });
});



// Proxy for AniList GraphQL API with caching
app.post('/api/anilist', async (req, res) => {
  const cacheKey = `anilist:${JSON.stringify(req.body)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  try {
    const response = await axios.post('https://graphql.anilist.co', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Cache the response for 5 minutes
    cache.set(cacheKey, response.data, 300);
    
    res.set('X-Cache', 'MISS');
    res.json(response.data);
  } catch (error) {
    console.error('AniList proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from AniList',
      message: error.message,
    });
  }
});

// Search endpoint with AniList data
app.get('/api/search', async (req, res) => {
  const { q: query, page = 1, perPage = 20 } = req.query;
  const cacheKey = `search:${query}:${page}:${perPage}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  try {
    // Search AniList
    const anilistResponse = await axios.post('https://graphql.anilist.co', {
      query: `
        query ($search: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
            }
            media(search: $search, type: MANGA, isAdult: false) {
              id
              title { romaji english native }
              coverImage { large extraLarge }
              status
              genres
              averageScore
              popularity
            }
          }
        }
      `,
      variables: { search: query, page: parseInt(page), perPage: parseInt(perPage) },
    });

    const result = {
      data: anilistResponse.data.data.Page.media,
      pageInfo: anilistResponse.data.data.Page.pageInfo,
    };

    cache.set(cacheKey, result, 300);
    res.set('X-Cache', 'MISS');
    res.json(result);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Get manga details with Consumet chapter info
app.get('/api/manga/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `manga:${id}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  try {
    // Get AniList data
    const anilistResponse = await axios.post('https://graphql.anilist.co', {
      query: `
        query ($id: Int) {
          Media(id: $id, type: MANGA) {
            id
            title { romaji english native }
            description
            coverImage { extraLarge large color }
            bannerImage
            status
            genres
            tags { name rank }
            averageScore
            popularity
            chapters
            volumes
            staff { edges { role node { name { full } } } }
            startDate { year month day }
          }
        }
      `,
      variables: { id: parseInt(id) },
    });

    const manga = anilistResponse.data.data.Media;
    
    const result = {
      ...manga,
    };

    cache.set(cacheKey, result, 600); // Cache for 10 minutes
    res.set('X-Cache', 'MISS');
    res.json(result);
  } catch (error) {
    console.error('Manga details error:', error.message);
    res.status(500).json({ error: 'Failed to fetch manga', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AniDex Reader API server running on http://localhost:${PORT}`);
  console.log(`📊 Cache stats available at http://localhost:${PORT}/api/cache/stats`);
});

module.exports = app;
