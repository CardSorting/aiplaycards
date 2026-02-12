'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Types from page.tsx - can be moved to a shared types file
type BoosterSlot = 'common' | 'uncommon' | 'rare';

type GeneratedMove = {
  name: string;
  description: string;
  damageAmount?: number;
  damageModifier?: '×' | '+' | null;
  energyCost?: Array<{ amount: number; typeId: number }>;
};

type GeneratedCard = {
  name?: string;
  subname?: string | null;
  hitpoints?: number;
  supertypeId?: number;
  typeId?: number;
  subtypeId?: number | null;
  variationId?: number | null;
  rarityId?: number | null;
  weaknessTypeId?: number | null;
  resistanceTypeId?: number | null;
  retreatCost?: number | null;
  illustrator?: string | null;
  cardNumber?: string;
  totalInSet?: string;
  dexStats?: string;

  description?: string | null;
  hasAbility?: boolean;
  ability?: GeneratedMove | null;
  move1?: GeneratedMove | null;
  hasMove2?: boolean;
  move2?: GeneratedMove | null;
};

type BoosterJobResponse = {
  jobId: string;
};

type JobStatusResponse = {
  status: 'pending' | 'processing' | 'complete' | 'failed';
  card?: {
    rarity: BoosterSlot;
    pokemonName: string;
    card: GeneratedCard;
    imageUrl: string | null;
    images?: string[];
    createdCardId: number;
    cardEditorState?: any;
  };
  error?: string;
};

export type UseBoosterOpeningResult = {
  drawing: boolean;
  error: string | null;
  loadingPhase: 'idle' | 'queued' | 'generating' | 'ready';
  dynamicMessage: string;
  lastCard: JobStatusResponse['card'] | null;
  openSingle: (packSlug?: string) => void;
  isBusy: boolean;
  queuePosition?: number;
  estimatedWaitTime?: number;
  drop: {
    status: 'inactive' | 'active';
    name?: string;
    opensLastHour?: number;
    opensLast24h?: number;
    credits?: number;
    creditCost?: number;
    startsAt?: string | null;
  } | null;
  refreshDrop: () => Promise<void>;
};

const POLLING_INTERVAL = 2500; // 2.5 seconds

export function useBoosterOpening(packSlug?: string): UseBoosterOpeningResult {
  const { data: session } = useSession();
  const user = session?.user;
  const [jobId, setJobId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<
    'idle' | 'queued' | 'generating' | 'ready'
  >('idle');
  const [dynamicMessage, setDynamicMessage] = useState('');
  const [lastCard, setLastCard] = useState<JobStatusResponse['card'] | null>(
    null,
  );
  const [drop, setDrop] = useState<UseBoosterOpeningResult['drop']>(null);
  const [queuePosition, setQueuePosition] = useState<number | undefined>(
    undefined,
  );
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<
    number | undefined
  >(undefined);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const clearIntervals = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/booster-jobs/${id}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`Failed to get job status: ${res.status}`);
        }
        const json = (await res.json()) as JobStatusResponse;

        switch (json.status) {
          case 'complete':
            setLoadingPhase('ready');
            setDynamicMessage('Your unique Pokémon card is ready!');
            setLastCard(json.card || null);
            setDrawing(false);
            clearIntervals();
            break;
          case 'failed':
            setError(json.error || 'Card generation failed.');
            setDrawing(false);
            clearIntervals();
            break;
          case 'processing':
            setLoadingPhase('generating');
            setDynamicMessage('AI is crafting your unique Pokémon card...');
            break;
          case 'pending':
          default: // 3 minutes per card
            // Simulate queue position
            setLoadingPhase('queued');
            // Estimate queue position and wait time based on opens per hour
            const opensPerHour = drop?.opensLastHour || 10;
            const estimatedMinutesPerCard = 3;
            const estimatedQueuePosition = Math.max(
              1,
              Math.floor(Math.random() * 5) + 1,
            );
            const estimatedWait =
              estimatedQueuePosition * estimatedMinutesPerCard;

            setQueuePosition(estimatedQueuePosition);
            setEstimatedWaitTime(estimatedWait);
            setDynamicMessage(
              `Your request is in the generation queue... (Position: ~${estimatedQueuePosition})`,
            );
            break;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Polling error');
        setDrawing(false);
        clearIntervals();
      }
    },
    [clearIntervals],
  );

  const refreshDrop = useCallback(async () => {
    try {
      const qs = packSlug ? `?pack=${encodeURIComponent(packSlug)}` : '';
      const res = await fetch(`/api/booster-pack${qs}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load drop');
      const data = await res.json();
      setDrop({
        status: data.status,
        name: data.name,
        opensLastHour: data.opensLastHour,
        opensLast24h: data.opensLast24h,
        credits: data.credits,
        creditCost: data.creditCost,
        startsAt: null,
      });
    } catch {
      setDrop({ status: 'inactive' });
    }
  }, [packSlug]);

  const openSingle = useCallback(
    async (packSlug?: string) => {
      if (drop?.status === 'inactive') {
        setError('No active drop.');
        return;
      }
      if (!user?.id) {
        setError('Please sign in to open a pack.');
        return;
      }
      setDrawing(true);
      setError(null);
      setLastCard(null);
      setLoadingPhase('queued');
      setDynamicMessage('Submitting your request to the generation queue...');

      try {
        const res = await fetch('/api/booster-open', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packSlug }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({} as any));
          if (res.status === 402) {
            // Credit-specific error - use the enhanced message from API
            const message =
              data?.message ||
              data?.error ||
              'Insufficient credits for booster pack opening';
            const required = data?.required;
            const available = data?.available;

            // Create detailed error for better UX
            const error = new Error(message);
            (error as any).creditInfo = {
              required,
              available,
              suggestedAction: data?.suggestedAction,
            };
            throw error;
          }
          throw new Error(
            (data as any)?.error || `Failed to open card: ${res.status}`,
          );
        }
        const { jobId } = (await res.json()) as BoosterJobResponse;
        setJobId(jobId);

        // Start polling
        pollingRef.current = setInterval(() => {
          pollJobStatus(jobId);
        }, POLLING_INTERVAL);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setDrawing(false);
        try {
          await refreshDrop();
        } catch {}
      }
    },
    [user?.id, pollJobStatus, drop?.status, refreshDrop],
  );

  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, [clearIntervals]);

  useEffect(() => {
    refreshDrop();
    const t = setInterval(refreshDrop, 15000);
    return () => clearInterval(t);
  }, [refreshDrop]);

  return {
    drawing,
    error,
    loadingPhase,
    dynamicMessage,
    lastCard,
    openSingle,
    isBusy: drawing,
    queuePosition,
    estimatedWaitTime,
    drop,
    refreshDrop,
  };
}
