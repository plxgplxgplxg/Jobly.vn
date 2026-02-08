import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CVTemplate, CVData } from '../../../services/api/cvTemplate.service'

const cvDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    address: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'),
    gender: z.string().min(1, 'Giới tính là bắt buộc'),
    title: z.string().optional(),
    customFields: z.array(z.object({
      label: z.string().min(1, 'Tên trường là bắt buộc'),
      value: z.string().min(1, 'Giá trị là bắt buộc'),
    })).optional(),
  }),
  summary: z.string().optional(),
  skills: z.array(z.object({
    name: z.string().min(1, 'Tên kỹ năng là bắt buộc'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
  })),
  experience: z.array(z.object({
    company: z.string().min(1, 'Tên công ty là bắt buộc'),
    position: z.string().min(1, 'Vị trí là bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().optional(),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
    isCurrent: z.boolean(),
  })).optional(),
  education: z.array(z.object({
    school: z.string().min(1, 'Tên trường là bắt buộc'),
    degree: z.string().min(1, 'Bằng cấp là bắt buộc'),
    field: z.string().min(1, 'Chuyên ngành là bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().min(1, 'Tên dự án là bắt buộc'),
    role: z.string().min(1, 'Vai trò là bắt buộc'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
    link: z.string().optional(),
  })).optional(),
  certificates: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
})

interface CVEditorProps {
  template: CVTemplate
  initialData?: CVData
  onChange: (data: CVData) => void
  onSave: (data: CVData) => void
}

export function CVEditor({ initialData, onChange, onSave }: CVEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CVData>({
    resolver: zodResolver(cvDataSchema),
    defaultValues: initialData || {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        title: '',
        customFields: [],
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certificates: [],
      activities: [],
      hobbies: [],
      references: [],
    }
  })

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  })

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  })

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control,
    name: 'certificates' as any
  })

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control,
    name: 'activities' as any
  })

  const { fields: hobbyFields, append: appendHobby, remove: removeHobby } = useFieldArray({
    control,
    name: 'hobbies' as any
  })

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'references' as any
  })

  const { fields: customInfoFields, append: appendCustomInfo, remove: removeCustomInfo } = useFieldArray({
    control,
    name: 'personalInfo.customFields' as any
  })

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  })

  const formData = watch()

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  const onSubmit = (data: CVData) => {
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Thông tin cá nhân */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Thông tin cá nhân
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              {...register('personalInfo.fullName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nguyễn Văn A"
            />
            {errors.personalInfo?.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.personalInfo.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vị trí ứng tuyển
            </label>
            <input
              {...register('personalInfo.title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ví dụ: Senior Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('personalInfo.email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="email@example.com"
            />
            {errors.personalInfo?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.personalInfo.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              {...register('personalInfo.phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0123456789"
            />
            {errors.personalInfo?.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.personalInfo.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Địa chỉ
            </label>
            <input
              {...register('personalInfo.address')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Hà Nội, Việt Nam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              {...register('personalInfo.dateOfBirth')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.personalInfo?.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.personalInfo.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <select
              {...register('personalInfo.gender')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.personalInfo?.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.personalInfo.gender.message}</p>
            )}
          </div>
        </div>

        {/* Thông tin phụ tùy chỉnh */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">Thông tin liên hệ bổ sung</h4>
            <button type="button" onClick={() => appendCustomInfo({ label: '', value: '' })} className="text-blue-600 text-xs font-bold px-2 py-1 border border-blue-600 rounded hover:bg-blue-50">+ Thêm trường</button>
          </div>
          <div className="space-y-2">
            {customInfoFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input {...register(`personalInfo.customFields.${index}.label` as any)} placeholder="Tên (VD: LinkedIn)" className="w-1/3 px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                <span className="text-gray-400">:</span>
                <input {...register(`personalInfo.customFields.${index}.value` as any)} placeholder="Giá trị/Link" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm" />
                <button type="button" onClick={() => removeCustomInfo(index)} className="text-red-500 hover:text-red-700 p-1">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giới thiệu bản thân */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Giới thiệu bản thân
        </h3>
        <textarea
          {...register('summary')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Mô tả ngắn gọn về bản thân, mục tiêu nghề nghiệp..."
        />
      </div>

      {/* Kinh nghiệm làm việc */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kinh nghiệm làm việc
          </h3>
          <button
            type="button"
            onClick={() => appendExperience({
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              description: '',
              isCurrent: false
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Thêm kinh nghiệm
          </button>
        </div>

        <div className="space-y-4">
          {experienceFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Kinh nghiệm #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`experience.${index}.company`)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`experience.${index}.position`)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Từ ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`experience.${index}.startDate`)}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đến ngày
                  </label>
                  <input
                    {...register(`experience.${index}.endDate`)}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={watch(`experience.${index}.isCurrent`)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      {...register(`experience.${index}.isCurrent`)}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Đang làm việc tại đây
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả công việc <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register(`experience.${index}.description`)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          {experienceFields.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Chưa có kinh nghiệm nào. Click "Thêm kinh nghiệm" để bắt đầu.
            </p>
          )}
        </div>
      </div>

      {/* Dự án */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dự án tiêu biểu</h3>
          <button type="button" onClick={() => appendProject({ name: '', role: '', description: '', link: '' })} className="text-blue-600 text-sm font-bold">+ Thêm dự án</button>
        </div>
        <div className="space-y-4">
          {projectFields.map((field, index) => (
            <div key={field.id} className="border border-gray-100 dark:border-gray-700 p-4 rounded-lg relative">
              <button type="button" onClick={() => removeProject(index)} className="absolute top-2 right-2 text-red-500 text-xs">Xóa</button>
              <div className="grid grid-cols-2 gap-4">
                <input {...register(`projects.${index}.name`)} placeholder="Tên dự án" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
                <input {...register(`projects.${index}.role`)} placeholder="Vai trò" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
                <div className="col-span-2">
                  <textarea {...register(`projects.${index}.description`)} placeholder="Mô tả dự án" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" rows={2} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kỹ năng động */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kỹ năng chuyên môn</h3>
          <button type="button" onClick={() => appendSkill({ name: '', description: '' })} className="text-blue-600 text-sm font-bold">+ Thêm kỹ năng</button>
        </div>
        <div className="space-y-4">
          {skillFields.map((field, index) => (
            <div key={field.id} className="border border-gray-100 dark:border-gray-700 p-4 rounded-lg relative">
              <button type="button" onClick={() => removeSkill(index)} className="absolute top-2 right-2 text-red-500 text-xs">Xóa</button>
              <div className="grid grid-cols-1 gap-4">
                <input {...register(`skills.${index}.name`)} placeholder="Tên kỹ năng (VD: ReactJS, Backend Development)" className="w-full px-3 py-2 border rounded-lg font-bold dark:bg-gray-700" />
                <textarea {...register(`skills.${index}.description`)} placeholder="Mô tả chi tiết kỹ năng" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" rows={2} />
              </div>
            </div>
          ))}
          {skillFields.length === 0 && (
            <p className="text-center text-gray-500 py-2">Chưa có kỹ năng nào. Nhấn "Thêm kỹ năng" để bắt đầu.</p>
          )}
        </div>
      </div>

      {/* Các mục bổ sung dạng list */}
      {
        [
          { label: 'Chứng chỉ', name: 'certificates', fields: certificateFields, append: appendCertificate, remove: removeCertificate },
          { label: 'Hoạt động', name: 'activities', fields: activityFields, append: appendActivity, remove: removeActivity },
          { label: 'Sở thích', name: 'hobbies', fields: hobbyFields, append: appendHobby, remove: removeHobby },
          { label: 'Người tham chiếu', name: 'references', fields: referenceFields, append: appendReference, remove: removeReference },
        ].map((item: any) => (
          <div key={item.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h3>
              <button type="button" onClick={() => item.append('')} className="text-blue-600 text-sm font-bold">+ Thêm</button>
            </div>
            <div className="space-y-2">
              {item.fields.map((field: any, index: number) => (
                <div key={field.id} className="flex gap-2">
                  <input {...register(`${item.name}.${index}` as any)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700" placeholder={`Nhập ${item.label.toLowerCase()}`} />
                  <button type="button" onClick={() => item.remove(index)} className="text-red-500">Xóa</button>
                </div>
              ))}
            </div>
          </div>
        ))
      }

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Học vấn
          </h3>
          <button
            type="button"
            onClick={() => appendEducation({
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              description: ''
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Thêm học vấn
          </button>
        </div>

        <div className="space-y-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Học vấn #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trường <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`education.${index}.school`)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bằng cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`education.${index}.degree`)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Cử nhân, Thạc sĩ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chuyên ngành <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`education.${index}.field`)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Từ năm <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`education.${index}.startDate`)}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đến năm
                  </label>
                  <input
                    {...register(`education.${index}.endDate`)}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    {...register(`education.${index}.description`)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="GPA, thành tích..."
                  />
                </div>
              </div>
            </div>
          ))}

          {educationFields.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              Chưa có học vấn nào. Click "Thêm học vấn" để bắt đầu.
            </p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Lưu và tạo CV
        </button>
      </div>
    </form >
  )
}
