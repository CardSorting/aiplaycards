// Stub service for admin packs
// This is a placeholder implementation

export interface PackSuggestion {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export class CommunityPackService {
    static async getSuggestions(): Promise<PackSuggestion[]> {
        return [];
    }

    static async createSuggestion(_data: unknown): Promise<PackSuggestion> {
        return {
            id: 'stub',
            name: 'Stub Pack',
            status: 'pending',
        };
    }
}
