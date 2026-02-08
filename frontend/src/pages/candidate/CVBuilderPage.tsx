import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { CVTemplateSelector } from '../../components/features/cv/CVTemplateSelector'
import { CVEditor } from '../../components/features/cv/CVEditor'
import { CVPreview } from '../../components/features/cv/CVPreview'
import { userService } from '../../services/api/user.service'
import { cvTemplateService, type CVTemplate, type CVData } from '../../services/api/cvTemplate.service'
import { useUIStore } from '../../store/uiStore'

type Step = 'select' | 'edit' | 'generate'

export function CVBuilderPage() {
  const navigate = useNavigate()
  const { addNotification } = useUIStore()

  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null)
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTemplateSelect = (template: CVTemplate) => {
    setSelectedTemplate(template)
    setCurrentStep('edit')
  }

  const handleDataChange = (data: CVData) => {
    setCvData(data)
  }

  const handleSave = async (data: CVData) => {
    if (!selectedTemplate) return

    try {
      setIsGenerating(true)

      const blob = await cvTemplateService.generateCV(selectedTemplate.id, data)

      // 1. Tạo download link (giữ nguyên để user tải về máy)
      const fileName = `CV_${data.personalInfo.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // 2. Upload lên server để lưu vào Quản lý CV
      try {
        const file = new File([blob], fileName, { type: 'application/pdf' })
        await userService.uploadCV(file)

        addNotification({
          type: 'success',
          message: 'Tạo CV thành công! File đã được tải xuống và lưu vào Quản lý CV.',
          duration: 5000
        })
      } catch (uploadError) {
        console.error('Lỗi khi upload CV:', uploadError)
        addNotification({
          type: 'warning',
          message: 'Tạo CV thành công và đã tải xuống, nhưng không thể lưu vào hệ thống. Vui lòng tải lên thủ công.',
          duration: 7000
        })
      }

      setCurrentStep('generate')
    } catch (error: any) {
      console.error('Error in handleSave:', error)
      addNotification({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Không thể tạo CV. Vui lòng thử lại.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'edit') {
      setCurrentStep('select')
      setSelectedTemplate(null)
      setCvData(null)
    } else if (currentStep === 'generate') {
      setCurrentStep('edit')
    }
  }

  const handleCreateAnother = () => {
    setCurrentStep('select')
    setSelectedTemplate(null)
    setCvData(null)
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Tạo CV từ Template
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Tạo CV chuyên nghiệp trong vài phút
              </p>
            </div>

            {currentStep !== 'select' && (
              <Button
                onClick={handleBack}
                variant="ghost"
                leftIcon={<span className="material-symbols-outlined">arrow_back</span>}
              >
                Quay lại
              </Button>
            )}
          </div>

          {/* Progress steps */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                  ${currentStep === 'select'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-green-500 text-white'
                  }
                `}>
                  {currentStep === 'select' ? '1' : <span className="material-symbols-outlined text-xl">check</span>}
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Chọn template
                </span>
              </div>

              <div className={`w-16 h-1 transition-colors ${currentStep !== 'select' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

              {/* Step 2 */}
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                  ${currentStep === 'select'
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    : currentStep === 'edit'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-green-500 text-white'
                  }
                `}>
                  {currentStep === 'generate' ? <span className="material-symbols-outlined text-xl">check</span> : '2'}
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nhập thông tin
                </span>
              </div>

              <div className={`w-16 h-1 transition-colors ${currentStep === 'generate' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

              {/* Step 3 */}
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                  ${currentStep === 'generate'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }
                `}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tải xuống
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'select' && (
          <CVTemplateSelector onSelect={handleTemplateSelect} />
        )}

        {currentStep === 'edit' && selectedTemplate && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="lg:col-span-1">
              <CVEditor
                template={selectedTemplate}
                initialData={cvData || undefined}
                onChange={handleDataChange}
                onSave={handleSave}
              />
            </div>

            {/* Preview */}
            <div className="lg:col-span-1 sticky top-8 self-start">
              {cvData && (
                <CVPreview
                  template={selectedTemplate}
                  data={cvData}
                />
              )}
            </div>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">check_circle</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                CV đã được tạo thành công!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                File CV của bạn đã được tải xuống. Bạn có thể sử dụng nó để ứng tuyển công việc.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleCreateAnother}
                  variant="primary"
                  size="lg"
                  leftIcon={<span className="material-symbols-outlined">add</span>}
                >
                  Tạo CV khác
                </Button>
                <Button
                  onClick={() => navigate('/candidate/cv-management')}
                  variant="secondary"
                  size="lg"
                  leftIcon={<span className="material-symbols-outlined">folder</span>}
                >
                  Quản lý CV
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm mx-4 shadow-2xl">
              <div className="mx-auto mb-4 w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-center text-slate-900 dark:text-slate-100 font-bold text-lg">
                Đang tạo CV...
              </p>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-2">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
