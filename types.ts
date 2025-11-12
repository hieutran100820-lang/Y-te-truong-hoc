// Fix: Define and export interfaces instead of importing from self.
export interface School {
  id: number;
  name: string;
  level: 'Mầm non' | 'Tiểu học' | 'THCS' | 'THPT' | 'Liên cấp';
  location: string;
}

export interface SchoolYear {
  id: number;
  year: string;
  isCurrent: boolean;
  isLocked: boolean;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  assignedSchoolIds?: number[]; // Optional for admin user
}

export interface DynamicField {
  id: string;
  tab: 'overview' | 'staff' | 'careContract' | 'checkContract' | 'checklist';
  label: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'droplist';
  options?: string[];
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileData: string; // Data URL for the file content
  fieldName: string; // The dynamic field name this is attached to
}

export interface HealthRecord {
  schoolId: number;
  schoolYearId: number;
  dynamicData?: {
    [key:string]: any;
  };
  attachments?: FileAttachment[];
}