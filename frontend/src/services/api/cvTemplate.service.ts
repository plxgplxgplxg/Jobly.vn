import { apiClient } from './apiClient'

export interface CVField {
  name: string
  type: 'text' | 'textarea' | 'date' | 'array'
  label: string
  required: boolean
  placeholder?: string
}

export interface CVTemplate {
  id: string
  name: string
  description: string
  previewImageUrl: string
  thumbnail?: string
  htmlTemplate: string
  cssStyles: string
  cssTemplate?: string
  fields: CVField[]
  createdAt: string
  updatedAt: string
}

export interface CVData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address?: string
    dateOfBirth: string
    gender: string
    title?: string
    customFields?: Array<{
      label: string
      value: string
    }>
  }
  summary?: string
  experience?: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
    isCurrent: boolean
  }>
  education?: Array<{
    school: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    description?: string
  }>
  skills: Array<{
    name: string
    description: string
  }>
  projects?: Array<{
    name: string
    role: string
    description: string
    link?: string
  }>
  certificates?: string[]
  activities?: string[]
  hobbies?: string[]
  references?: string[]
  [key: string]: any
}

class CVTemplateService {
  async getTemplates(): Promise<CVTemplate[]> {
    const response = await apiClient.get<CVTemplate[]>('/cv-templates')
    return response
  }

  async getTemplateById(id: string): Promise<CVTemplate> {
    const response = await apiClient.get<CVTemplate>(`/cv-templates/${id}`)
    return response
  }

  async generateCV(templateId: string, data: CVData): Promise<Blob> {
    const response = await apiClient.post(
      `/cv-templates/${templateId}/generate`,
      data,
      {
        responseType: 'blob'
      }
    )
    return response as unknown as Blob
  }

  async previewCV(templateId: string, data: CVData): Promise<string> {
    const response = await apiClient.post<{ html: string }>(
      `/cv-templates/${templateId}/preview`,
      data
    )
    return response.html
  }
}

export const cvTemplateService = new CVTemplateService()
export default cvTemplateService
