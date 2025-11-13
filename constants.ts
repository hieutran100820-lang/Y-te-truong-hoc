// Fix: Moved constant data here from types.ts and removed React component code.
import { School, SchoolYear, HealthRecord, User, DynamicField } from './types';

export const INITIAL_DYNAMIC_FIELDS: DynamicField[] = [
    // Tab: overview
    { id: 'df_01', tab: 'overview', label: 'Tổng số học sinh', name: 'student_count', type: 'number' },
    
    // Tab: staff
    { id: 'df_02', tab: 'staff', label: 'Họ tên', name: 'staff_name', type: 'text' },
    { id: 'df_03', tab: 'staff', label: 'Số điện thoại', name: 'staff_phone', type: 'text' },
    { id: 'df_04', tab: 'staff', label: 'Trình độ chuyên môn', name: 'staff_qualification', type: 'text' },

    // Tab: careContract
    { id: 'df_05', tab: 'careContract', label: 'Tình trạng', name: 'care_contract_status', type: 'select', options: ['Đã ký', 'Chưa ký'] },
    { id: 'df_06', tab: 'careContract', label: 'Đơn vị ký kết', name: 'care_contract_party', type: 'text' },
    { id: 'df_07', tab: 'careContract', label: 'Người đại diện ký', name: 'care_contract_signer', type: 'text' },

    // Tab: checkContract
    { id: 'df_08', tab: 'checkContract', label: 'Tình trạng', name: 'check_contract_status', type: 'select', options: ['Đã ký', 'Chưa ký'] },
    { id: 'df_09', tab: 'checkContract', label: 'Đơn vị ký kết', name: 'check_contract_party', type: 'text' },
    { id: 'df_10', tab: 'checkContract', label: 'Đã hoàn thành khám', name: 'check_contract_completed', type: 'checkbox' },
    { id: 'df_11', tab: 'checkContract', label: 'Chi phí/học sinh (VND)', name: 'check_contract_cost', type: 'number' },

    // Tab: checklist
    { id: 'df_12', tab: 'checklist', label: 'Có Ban chỉ đạo', name: 'checklist_steering_committee', type: 'checkbox' },
    { id: 'df_13', tab: 'checklist', label: 'Có Kế hoạch hoạt động', name: 'checklist_activity_plan', type: 'checkbox' },
    { id: 'df_14', tab: 'checklist', label: 'Đã được kiểm tra', name: 'checklist_inspected', type: 'checkbox' },
    { id: 'df_15', tab: 'checklist', label: 'Có bếp ăn tập thể', name: 'checklist_collective_kitchen', type: 'checkbox' },
];


export const INITIAL_SCHOOL_YEARS: SchoolYear[] = [
  { id: 1, year: '2022-2023', isCurrent: false, isLocked: true },
  { id: 2, year: '2023-2024', isCurrent: false, isLocked: true },
  { id: 3, year: '2024-2025', isCurrent: true, isLocked: false },
  { id: 4, year: '2025-2026', isCurrent: false, isLocked: false },
];

export const INITIAL_SCHOOLS: School[] = [
  { id: 1, name: 'THCS Đức Phú', level: 'THCS', location: 'Nghị Đức, Lâm Đồng' },
  { id: 2, name: 'THCS Nghị Đức', level: 'THCS', location: 'Nghị Đức, Lâm Đồng' },
  { id: 3, name: 'THCS Đức Tân', level: 'THCS', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 4, name: 'THCS Bắc Ruộng', level: 'THCS', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 5, name: 'THCS Huy Khiêm', level: 'THCS', location: 'Đồng Kho, Lâm Đồng' },
  { id: 6, name: 'THCS Đức Bình', level: 'THCS', location: 'Đồng Kho, Lâm Đồng' },
  { id: 7, name: 'THCS Đức Thuận', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 8, name: 'THCS Lạc Tánh', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 9, name: 'THCS Gia An', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 10, name: 'THCS Gia Huynh', level: 'THCS', location: 'Suối Kiết, Lâm Đồng' },
  { id: 11, name: 'THCS Suối Kiết', level: 'THCS', location: 'Suối Kiết, Lâm Đồng' },
  { id: 12, name: 'THCS Đồng Kho', level: 'THCS', location: 'Đồng Kho, Lâm Đồng' },
  { id: 13, name: 'THCS Tân Thành', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 14, name: 'THCS Măng Tố', level: 'THCS', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 15, name: 'THCS Duy Cần', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 16, name: 'PTDT Nội trú Tánh Linh', level: 'THCS', location: 'Tánh Linh, Lâm Đồng' },
  { id: 17, name: 'TH & THCS Tà Pứa', level: 'Liên cấp', location: 'Nghị Đức, Lâm Đồng' },
  { id: 18, name: 'TH & THCS La Ngâu', level: 'Liên cấp', location: 'Đồng Kho, Lâm Đồng' },
  { id: 19, name: 'Tiểu học Đức Phú 1', level: 'Tiểu học', location: 'Nghị Đức, Lâm Đồng' },
  { id: 20, name: 'Tiểu học Đức Phú 2', level: 'Tiểu học', location: 'Nghị Đức, Lâm Đồng' },
  { id: 21, name: 'Tiểu học Nghị Đức 1', level: 'Tiểu học', location: 'Nghị Đức, Lâm Đồng' },
  { id: 22, name: 'Tiểu học Nghị Đức 2', level: 'Tiểu học', location: 'Nghị Đức, Lâm Đồng' },
  { id: 23, name: 'Tiểu học Đức Tân 1', level: 'Tiểu học', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 24, name: 'Tiểu học Đức Tân 2', level: 'Tiểu học', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 25, name: 'Tiểu học Măng Tố', level: 'Tiểu học', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 26, name: 'Tiểu học Bắc Ruộng 1', level: 'Tiểu học', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 27, name: 'Tiểu học Bắc Ruộng 2', level: 'Tiểu học', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 28, name: 'Tiểu học Huy Khiêm 1', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 29, name: 'Tiểu học Huy Khiêm 2', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 30, name: 'Tiểu học Đồng Kho 1', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 31, name: 'Tiểu học Đồng Kho 2', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 32, name: 'Tiểu học Đức Bình 1', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 33, name: 'Tiểu học Đức Bình 2', level: 'Tiểu học', location: 'Đồng Kho, Lâm Đồng' },
  { id: 34, name: 'Tiểu học Đức Thuận', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 35, name: 'Tiểu học Đồng Me', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 36, name: 'Tiểu học Lạc Tánh 1', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 37, name: 'Tiểu học Lạc Tánh 2', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 38, name: 'Tiểu học Tân Thành', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 39, name: 'Tiểu học Gia An 1', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 40, name: 'Tiểu học Gia An 2', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 41, name: 'Tiểu học Gia An 3', level: 'Tiểu học', location: 'Tánh Linh, Lâm Đồng' },
  { id: 42, name: 'Tiểu học Suối Kiết', level: 'Tiểu học', location: 'Suối Kiết, Lâm Đồng' },
  { id: 43, name: 'Tiểu học Gia Huynh', level: 'Tiểu học', location: 'Suối Kiết, Lâm Đồng' },
  { id: 44, name: 'Tiểu học Bà Tá 1', level: 'Tiểu học', location: 'Suối Kiết, Lâm Đồng' },
  { id: 45, name: 'Tiểu học Sông Dinh', level: 'Tiểu học', location: 'Suối Kiết, Lâm Đồng' },
  { id: 46, name: 'Mẫu giáo Tuổi Ngọc', level: 'Mầm non', location: 'Nghị Đức, Lâm Đồng' },
  { id: 47, name: 'Mẫu giáo Bình Minh', level: 'Mầm non', location: 'Nghị Đức, Lâm Đồng' },
  { id: 48, name: 'Mẫu Giáo Sơn Ca', level: 'Mầm non', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 49, name: 'Mẫu giáo Họa My', level: 'Mầm non', location: 'Bắc Ruộng, Lâm Đồng' },
  { id: 50, name: 'Mẫu giáo Sao Mai', level: 'Mầm non', location: 'Đồng Kho, Lâm Đồng' },
  { id: 51, name: 'Mẫu giáo Măng Non', level: 'Mầm non', location: 'Đồng Kho, Lâm Đồng' },
  { id: 52, name: 'Mẫu giáo Hoa Mai', level: 'Mầm non', location: 'Đồng Kho, Lâm Đồng' },
  { id: 53, name: 'Mẫu giáo Tuổi Thơ', level: 'Mầm non', location: 'Đồng Kho, Lâm Đồng' },
  { id: 54, name: 'Mẫu giáo Hoa Hồng', level: 'Mầm non', location: 'Tánh Linh, Lâm Đồng' },
  { id: 55, name: 'Mẫu giáo Bé Thơ', level: 'Mầm non', location: 'Tánh Linh, Lâm Đồng' },
  { id: 56, name: 'Mẫu giáo Hoa Phượng', level: 'Mầm non', location: 'Tánh Linh, Lâm Đồng' },
  { id: 57, name: 'Mẫu giáo Búp Măng', level: 'Mầm non', location: 'Tánh Linh, Lâm Đồng' },
  { id: 58, name: 'Mẫu giáo Gia Huynh', level: 'Mầm non', location: 'Suối Kiết, Lâm Đồng' },
  { id: 59, name: 'Mẫu giáo Suối Kiết', level: 'Mầm non', location: 'Suối Kiết, Lâm Đồng' },
  { id: 60, name: 'Mẫu giáo Bà Tá', level: 'Mầm non', location: 'Suối Kiết, Lâm Đồng' },
  { id: 61, name: 'Mẫu giáo Lạc Hồng', level: 'Mầm non', location: 'Tánh Linh, Lâm Đồng' },
];

export const INITIAL_USERS: User[] = [
    { id: 0, name: 'Quản trị viên', phone: 'N/A', username: 'admin', password: '123456', role: 'admin', assignedSchoolIds: [] },
    { id: 1, name: 'Nguyễn Văn An', phone: '0901234567', username: 'user1', password: 'password', role: 'user', assignedSchoolIds: [1] }, // THCS Đức Phú
    { id: 2, name: 'Trần Thị Bình', phone: '0907654321', username: 'user2', password: 'password', role: 'user', assignedSchoolIds: [42] }, // Tiểu học Suối Kiết
    { id: 3, name: 'Lê Văn Cường', phone: '0912345678', username: 'user3', password: 'password', role: 'user', assignedSchoolIds: [3] }, // THCS Đức Tân
];

export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [];
