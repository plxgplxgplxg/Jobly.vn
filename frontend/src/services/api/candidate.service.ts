import { apiClient } from './apiClient'
import type { UserProfile } from '../../types/user.types'

class CandidateService {
    async searchCandidates(query: string, params?: { page?: number; limit?: number }): Promise<{ items: UserProfile[]; total: number; page: number; limit: number; totalPages: number }> {
        const response = await apiClient.get<any>(`/users/candidates/search`, { params: { q: query, ...params } })
        return response
    }

    async getCandidateProfile(id: string): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(`/users/candidates/${id}`)
        return response
    }
}

export const candidateService = new CandidateService()
export default candidateService
