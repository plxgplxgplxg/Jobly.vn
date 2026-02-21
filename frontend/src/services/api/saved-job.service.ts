import { apiClient } from './apiClient';

export interface SavedJob {
    id: string;
    userId: string;
    jobId: string;
    createdAt: string;
    job?: any; // Add job details type if needed
}

class SavedJobService {
    async toggle(jobId: string): Promise<{ saved: boolean }> {
        return await apiClient.post<{ saved: boolean }>('/saved/jobs/toggle', { jobId });
    }

    async checkStatus(jobId: string): Promise<{ saved: boolean }> {
        return await apiClient.get<{ saved: boolean }>(`/saved/jobs/${jobId}/status`);
    }

    async list(params?: { page?: number; limit?: number }): Promise<{ items: SavedJob[]; total: number; page: number; limit: number; totalPages: number }> {
        return await apiClient.get<any>('/saved/jobs', { params });
    }
}

export const savedJobService = new SavedJobService();
