import { apiClient } from './apiClient';
import type { UserProfile } from '../../types/user.types';

export interface SavedCandidate {
    id: string;
    employerId: string;
    candidateId: string;
    createdAt: string;
    candidate?: UserProfile;
}

class SavedCandidateService {
    async toggle(candidateId: string): Promise<{ saved: boolean }> {
        return await apiClient.post<{ saved: boolean }>('/saved/candidates/toggle', { candidateId });
    }

    async checkStatus(candidateId: string): Promise<{ saved: boolean }> {
        return await apiClient.get<{ saved: boolean }>(`/saved/candidates/status/${candidateId}`);
    }

    async list(params?: { page?: number; limit?: number }): Promise<{ items: SavedCandidate[]; total: number; page: number; limit: number; totalPages: number }> {
        return await apiClient.get<any>('/saved/candidates', { params });
    }
}

export const savedCandidateService = new SavedCandidateService();
export default savedCandidateService;
