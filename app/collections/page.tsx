'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Collection {
  id: number;
  name: string;
  description?: string;
  type: string;
  isPrivate: boolean;
  totalCards?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  categories?: string[];
  avgRating?: number;
}

interface Filters {
  availableTags: string[];
  availableCategories: string[];
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableFilters, setAvailableFilters] = useState<Filters>({
    availableTags: [],
    availableCategories: [],
  });
  const [creatingCollection, setCreatingCollection] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'all') {
          params.set('type', typeFilter);
        }
        if (tagFilter) {
          params.set('tag', tagFilter);
        }
        if (categoryFilter) {
          params.set('category', categoryFilter);
        }
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const response = await fetch(`/api/collections?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        const data = await response.json();
        setCollections(data.collections);
        setAvailableFilters(data.filters);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [typeFilter, tagFilter, categoryFilter, searchQuery]);

  const createCollection = async (name: string, description?: string) => {
    setCreatingCollection(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          type: 'user_created',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create collection');
      }

      const data = await response.json();
      setCollections(prev => [data.collection, ...prev]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleCreateCollection = async () => {
    const name = prompt('Enter collection name:');
    if (!name?.trim()) return;

    const description = prompt('Enter description (optional):');
    await createCollection(name.trim(), description?.trim());
  };

  const deleteCollection = async (collectionId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this collection? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }

      setCollections(prev => prev.filter(c => c.id !== collectionId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Collections
          </h1>
          <p className="text-lg text-gray-600">
            Organize your cards into collections for better management and
            sharing
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">
                Search collections
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="typeFilter"
                className="text-sm font-medium text-gray-700"
              >
                Type:
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Collections</option>
                <option value="nano_composite">Nano Composites</option>
                <option value="user_created">User Created</option>
                <option value="special_pack">Special Packs</option>
              </select>
            </div>

            {availableFilters.availableTags.length > 0 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="tagFilter"
                  className="text-sm font-medium text-gray-700"
                >
                  Tag:
                </label>
                <select
                  id="tagFilter"
                  value={tagFilter}
                  onChange={e => setTagFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Tags</option>
                  {availableFilters.availableTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableFilters.availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="categoryFilter"
                  className="text-sm font-medium text-gray-700"
                >
                  Category:
                </label>
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {availableFilters.availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(typeFilter !== 'all' ||
              tagFilter ||
              categoryFilter ||
              searchQuery.trim()) && (
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setTagFilter('');
                  setCategoryFilter('');
                  setSearchQuery('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={handleCreateCollection}
                disabled={creatingCollection}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {creatingCollection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Collection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No collections found
            </h3>
            <p className="mt-2 text-gray-500">
              {typeFilter === 'all'
                ? 'Get started by creating your first collection or try the Nano Studio to generate AI composites.'
                : `No ${typeFilter.replace('_', ' ')} collections found.`}
            </p>
            <div className="mt-6 space-x-4">
              <button
                onClick={handleCreateCollection}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Collection
              </button>
              <Link
                href="/nano"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Nano Studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <div
                key={collection.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {collection.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => deleteCollection(collection.id)}
                        className="text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                        title="Delete collection"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 011-1v1M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {collection.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      {collection.totalCards || 0} cards
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        collection.isPrivate
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {collection.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Link
                      href={`/collections/${collection.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Collection →
                    </Link>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Created{' '}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
