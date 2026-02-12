'use client';

import React, { useEffect, useState } from 'react';

interface UserCard {
  id: number;
  name: string;
  imageData?: {
    dataUrl?: string;
    generated?: string[];
    thumbs?: string[];
    width?: number;
    height?: number;
  };
}

export default function EmbedCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [card, setCard] = useState<UserCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardId, setCardId] = useState<string | null>(null);

  useEffect(() => {
    const setId = async () => {
      const resolvedParams = await params;
      setCardId(resolvedParams.id);
    };
    setId();
  }, [params]);

  useEffect(() => {
    if (!cardId) return;

    const run = async () => {
      try {
        const res = await fetch(`/api/cards/${cardId}`, { cache: 'no-store' });
        if (!res.ok) {
          setError('Card not found');
          return;
        }
        const json = await res.json();
        setCard(json.data);
      } catch (e) {
        setError('Failed to load card');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [cardId]);

  const getPrimaryImageUrl = (): string | undefined => {
    if (!card) return undefined;
    return (
      card.imageData?.dataUrl ||
      (Array.isArray(card.imageData?.generated) &&
        card.imageData!.generated![0]) ||
      undefined
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: '#888',
        }}
      >
        Loading…
      </div>
    );
  }

  if (error || !card) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: '#b71c1c',
        }}
      >
        {error || 'Card not found'}
      </div>
    );
  }

  const src = getPrimaryImageUrl();

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #111 0%, #222 100%)',
        padding: 16,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={card.name}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          }}
        />
      ) : (
        <div style={{ color: '#bbb' }}>No image available</div>
      )}
    </div>
  );
}
