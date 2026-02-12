'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CollectionLikeButton from '../../../src/components/CollectionLikeButton';
import CollectionRatingButton from '../../../src/components/CollectionRatingButton';
import CollectionComments from '../../../src/components/CollectionComments';

interface Card {
  id: number;
  name: string;
  type: string;
  supertype: string;
  imageData?: {
    backgroundImageUrl?: string;
  };
  backgroundImageUrl?: string;
  collectionPosition: number;
  addedToCollectionAt: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  type: string;
  isPrivate: boolean;
  totalCards?: number;
  createdAt: string;
  cards: Card[];
}

export default function CollectionViewPage() {
  const params = useParams();
  const router = useRouter();
  const { collectionId } = params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) return;

    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Collection not found');
          }
          throw new Error('Failed to fetch collection');
        }

        const data = await response.json();
        setCollection(data.collection);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  const getCardImageUrl = (card: Card) => {
    return (
      card.imageData?.backgroundImageUrl ||
      card.backgroundImageUrl ||
      '/placeholder-card.png'
    );
  };

  const removeCardFromCollection = async (_cardId: number) => {
    if (!confirm('Remove this card from the collection?')) return;

    try {
      // For now, this is a placeholder - we'll need to implement the remove API
      alert('Remove functionality will be implemented in the API');
    } catch (err) {
      alert('Failed to remove card from collection');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-12">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-red-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Error loading collection
              </h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/collections')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Collections
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Collection not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link
                      href="/collections"
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Collections
                    </Link>
                  </li>
                  <li>
                    <svg
                      className="flex-shrink-0 h-4 w-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li>
                    <span className="text-gray-900 text-sm font-medium">
                      {collection.name}
                    </span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                {collection.name}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="capitalize">
                  {collection.type.replace('_', ' ')} Collection
                </span>
                <span>•</span>
                <span>{collection.cards.length} cards</span>
                <span>•</span>
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
            </div>

            <div className="flex items-center space-x-3">
              <CollectionRatingButton
                collectionId={collection.id}
                size="small"
                showStats={true}
                className="mr-4"
              />
              <CollectionLikeButton
                collectionId={collection.id}
                size="md"
                className="text-sm"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm">
                Add Cards
              </button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm">
                Share
              </button>
            </div>
          </div>

          {collection.description && (
            <div className="mt-4 text-gray-600 max-w-3xl">
              {collection.description}
            </div>
          )}
        </div>
      </div>

      {/* Collection Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {collection.cards.length === 0 ? (
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
              No cards in this collection
            </h3>
            <p className="mt-2 text-gray-600">
              {collection.type === 'nano_composite'
                ? 'Save some nano composites to see them here!'
                : 'Add some cards to get started.'}
            </p>
            <div className="mt-6 space-x-4">
              <Link
                href="/nano"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create Nano Composite
              </Link>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Browse Gallery
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-blue-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Cards
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {collection.cards.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Visibility
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {collection.isPrivate ? 'Private' : 'Public'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-2xl font-semibold text-gray-900 capitalize">
                      {collection.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {collection.cards.map(card => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="aspect-[2.5/3.5] relative">
                    <Image
                      src={getCardImageUrl(card)}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {card.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {card.supertype}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => router.push(`/card/${card.id}`)}
                          className="text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                          title="View card details"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeCardFromCollection(card.id)}
                          className="text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                          title="Remove from collection"
                        >
                          <svg
                            className="w-4 h-4"
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
                    <div className="mt-2 text-xs text-gray-500">
                      Added{' '}
                      {new Date(card.addedToCollectionAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <CollectionComments collectionId={collection.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
