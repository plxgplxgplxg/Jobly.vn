import { apiClient } from './apiClient'
import type { UserProfile } from '../../types/user.types'

class CandidateService {
    async searchCandidates(query: string): Promise<UserProfile[]> {
        const response = await apiClient.get<UserProfile[]>(`/users/candidates/search?q=${query}`)
        return response
    }

    async getCandidateProfile(id: string): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(`/users/candidates/${id}`)
        return response
    }
}

export const candidateService = new CandidateService()
export default candidateService
