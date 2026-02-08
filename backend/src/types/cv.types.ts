export interface CVTemplateDTO {
  id: string;
  name: string;
  description?: string;
  category: string;
  structureJSON: TemplateStructure;
  htmlTemplate: string;
  cssStyles: string;
  previewImageUrl?: string;
  createdAt: Date;
}

export interface TemplateStructure {
  sections: Section[];
}

export interface Section {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'custom';
  label: string;
  fields: Field[];
  required: boolean;
}

export interface Field {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'list' | 'rich-text';
  label: string;
  placeholder?: string;
  required: boolean;
}

export interface CVContentJSON {
  templateId: string;
  sections: { [sectionId: string]: { [fieldName: string]: any } };
}

export interface UserCVDTO {
  id: string;
  userId: string;
  templateId: string;
  contentJSON: CVContentJSON;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserCVDTO {
  templateId: string;
  contentJSON: CVContentJSON;
}

export interface UpdateUserCVDTO {
  contentJSON: CVContentJSON;
}
