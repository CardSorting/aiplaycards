// Stub worker for special animation
// This is a placeholder implementation

export interface AnimationJob {
    id: string;
    cardId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: string;
}

export class SpecialAnimationWorker {
    static async canAnimate(_cardId: string): Promise<{ canAnimate: boolean; reason?: string }> {
        return { canAnimate: true };
    }

    static async queueAnimation(_cardId: string, _userId: string, _options?: unknown): Promise<AnimationJob> {
        return {
            id: 'stub-job',
            cardId: _cardId,
            status: 'pending',
        };
    }

    static async getJobStatus(_jobId: string): Promise<AnimationJob | null> {
        return {
            id: _jobId,
            cardId: 'stub-card',
            status: 'completed',
            result: 'stub-result',
        };
    }
}
