import { GraphQLClient, gql } from 'graphql-request';
import type { AniListMedia, AniListResponse, AniListPageInfo } from '@/types';

const ANILIST_API = 'https://graphql.anilist.co';

const client = new GraphQLClient(ANILIST_API, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// GraphQL Fragments
const MEDIA_FRAGMENT = gql`
  fragment MediaFragment on Media {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    status
    format
    chapters
    volumes
    averageScore
    meanScore
    popularity
    favourites
    trending
    genres
    tags {
      id
      name
      rank
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    staff(perPage: 10) {
      edges {
        role
        node {
          id
          name {
            full
          }
        }
      }
    }
    isAdult
    countryOfOrigin
  }
`;

// Queries
const TRENDING_MANGA_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query TrendingManga($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
        ...MediaFragment
      }
    }
  }
`;

const POPULAR_MANGA_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query PopularManga($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
        ...MediaFragment
      }
    }
  }
`;

const TOP_RATED_MANGA_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query TopRatedManga($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: MANGA, sort: SCORE_DESC, isAdult: false) {
        ...MediaFragment
      }
    }
  }
`;

const SEARCH_MANGA_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query SearchManga(
    $page: Int
    $perPage: Int
    $search: String
    $genres: [String]
    $status: MediaStatus
    $year: Int
    $sort: [MediaSort]
    $format: MediaFormat
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: MANGA
        search: $search
        genre_in: $genres
        status: $status
        seasonYear: $year
        sort: $sort
        format: $format
        isAdult: false
      ) {
        ...MediaFragment
      }
    }
  }
`;

const MANGA_BY_ID_QUERY = gql`
  ${MEDIA_FRAGMENT}
  query MangaById($id: Int) {
    Media(id: $id, type: MANGA) {
      ...MediaFragment
    }
  }
`;

const GENRE_COLLECTION_QUERY = gql`
  query GenreCollection {
    GenreCollection
  }
`;

// API Functions
export async function getTrendingManga(page = 1, perPage = 20): Promise<{
  media: AniListMedia[];
  pageInfo: AniListPageInfo;
}> {
  const data = await client.request<AniListResponse>(TRENDING_MANGA_QUERY, {
    page,
    perPage,
  });
  return {
    media: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function getPopularManga(page = 1, perPage = 20): Promise<{
  media: AniListMedia[];
  pageInfo: AniListPageInfo;
}> {
  const data = await client.request<AniListResponse>(POPULAR_MANGA_QUERY, {
    page,
    perPage,
  });
  return {
    media: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function getTopRatedManga(page = 1, perPage = 20): Promise<{
  media: AniListMedia[];
  pageInfo: AniListPageInfo;
}> {
  const data = await client.request<AniListResponse>(TOP_RATED_MANGA_QUERY, {
    page,
    perPage,
  });
  return {
    media: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function searchManga(
  options: {
    search?: string;
    genres?: string[];
    status?: string;
    year?: number;
    sort?: string[];
    format?: string;
    page?: number;
    perPage?: number;
  }
): Promise<{
  media: AniListMedia[];
  pageInfo: AniListPageInfo;
}> {
  const {
    search,
    genres,
    status,
    year,
    sort = ['POPULARITY_DESC'],
    format,
    page = 1,
    perPage = 20,
  } = options;

  const data = await client.request<AniListResponse>(SEARCH_MANGA_QUERY, {
    page,
    perPage,
    search: search || undefined,
    genres: genres?.length ? genres : undefined,
    status: status || undefined,
    year: year || undefined,
    sort,
    format: format || undefined,
  });

  return {
    media: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function getMangaById(id: number): Promise<AniListMedia> {
  const data = await client.request<{ Media: AniListMedia }>(MANGA_BY_ID_QUERY, { id });
  return data.Media;
}

export async function getGenres(): Promise<string[]> {
  const data = await client.request<{ GenreCollection: string[] }>(GENRE_COLLECTION_QUERY);
  return data.GenreCollection;
}

// Helper to convert AniList status to display string
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    FINISHED: 'Completed',
    RELEASING: 'Ongoing',
    NOT_YET_RELEASED: 'Upcoming',
    CANCELLED: 'Cancelled',
    HIATUS: 'On Hiatus',
  };
  return statusMap[status] || status;
}

// Helper to get display title
export function getDisplayTitle(title: AniListMedia['title']): string {
  return title.english || title.romaji || title.native || 'Unknown Title';
}

// Helper to format date
export function formatDate(date: { year: number | null; month: number | null; day: number | null }): string {
  if (!date.year) return 'Unknown';
  const parts = [date.year];
  if (date.month) parts.push(date.month);
  if (date.day) parts.push(date.day);
  return parts.join('/');
}
