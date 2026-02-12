'use client';

import { FC, useEffect, useState } from 'react';

interface Card {
  id: number;
  name: string;
  type: string;
  animationUrl?: string;
  imageData?: { generated?: string[] };
  username?: string;
}

const MinimalFeed: FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards/feed/animated?limit=5');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        setCards(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>✨ Recently Animated</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>✨ Recently Animated</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>✨ Recently Animated</h2>
      <p>Discover the latest animated cards from our community</p>

      {cards.length === 0 ? (
        <p>No animated cards found.</p>
      ) : (
        <div>
          {cards.map(card => (
            <div
              key={card.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                  }}
                >
                  {(card.username || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <strong>{card.username || 'Anonymous'}</strong>
                  <br />
                  <small>Just animated this card! ✨</small>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                {card.animationUrl ? (
                  <div>
                    <video
                      src={card.animationUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        maxWidth: '200px',
                        maxHeight: '280px',
                        borderRadius: '8px',
                        border: '2px solid #007bff',
                      }}
                    />
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '12px',
                      }}
                    >
                      ✨ ANIMATED
                    </div>
                  </div>
                ) : card.imageData?.generated?.[0] ? (
                  <img
                    src={card.imageData.generated[0]}
                    alt={card.name}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '280px',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '200px',
                      height: '280px',
                      backgroundColor: '#ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                    }}
                  >
                    {card.name} Card
                  </div>
                )}
              </div>

              <div>
                <h3>{card.name}</h3>
                <p>
                  <strong>Type:</strong> {card.type}
                </p>
                <p>Card ID: {card.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinimalFeed;
