'use client';

import { useEffect, useState } from 'react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: string;
    name: string | null;
  };
}

interface CollectionCommentsProps {
  collectionId: number;
  className?: string;
}

export default function CollectionComments({
  collectionId,
  className = '',
}: CollectionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collections/social/comments?collectionId=${collectionId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/collections/social/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      console.error('Comment submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/collections/social/comments?commentId=${commentId}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Add Comment Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add a Comment
        </h3>
        <form onSubmit={handleSubmitComment}>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this collection..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="mt-1 text-sm text-gray-500">
              {newComment.length}/1000 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>

          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 text-gray-300 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h4 className="text-gray-900 font-medium mb-2">No comments yet</h4>
            <p className="text-gray-500">
              Be the first to share your thoughts about this collection!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div
                key={comment.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {(comment.user.name || 'User').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      {/* User Name and Date */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user.name || 'Anonymous User'}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 mt-3">
                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                          Reply
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                          Like
                        </button>
                        {/* Show delete button for own comments - you'd need to check ownership */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-sm ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
