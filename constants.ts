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
  { id: 1, name: 'THCS Đức Phú', level: 'THCS', location: 'Tánh Linh, Bình Thuận' },
  { id: 2, name: 'Tiểu học Suối Kiết', level: 'Tiểu học', location: 'Tánh Linh, Bình Thuận' },
  { id: 3, name: 'THPT Tánh Linh', level: 'THPT', location: 'Tánh Linh, Bình Thuận' },
  { id: 4, name: 'THCS Nghị Đức', level: 'THCS', location: 'Tánh Linh, Bình Thuận' },
  { id: 5, name: 'Tiểu học Đức Bình', level: 'Tiểu học', location: 'Tánh Linh, Bình Thuận' },
];

export const INITIAL_USERS: User[] = [
    { id: 0, name: 'Quản trị viên', phone: 'N/A', username: 'admin', password: '123456', role: 'admin', assignedSchoolIds: [] },
    { id: 1, name: 'Nguyễn Văn An', phone: '0901234567', username: 'user1', password: 'password', role: 'user', assignedSchoolIds: [1] },
    { id: 2, name: 'Trần Thị Bình', phone: '0907654321', username: 'user2', password: 'password', role: 'user', assignedSchoolIds: [2] },
    { id: 3, name: 'Lê Văn Cường', phone: '0912345678', username: 'user3', password: 'password', role: 'user', assignedSchoolIds: [3] },
];

export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [
  // Year 2024-2025 Data
  { 
    schoolId: 1, schoolYearId: 3, 
    dynamicData: {
      student_count: 520,
      staff_name: 'Nguyễn Thị A',
      staff_phone: '0987654321',
      staff_qualification: 'Y sĩ',
      care_contract_status: 'Đã ký',
      care_contract_party: 'TYT Đức Phú',
      care_contract_signer: 'Trần Văn B',
      check_contract_status: 'Đã ký',
      check_contract_party: 'Bệnh viện Tánh Linh',
      check_contract_completed: true,
      check_contract_cost: 50000,
      checklist_steering_committee: true,
      checklist_activity_plan: true,
      checklist_inspected: true,
      checklist_collective_kitchen: false,
    }
  },
  { 
    schoolId: 2, schoolYearId: 3, 
    dynamicData: {
      student_count: 350,
      staff_name: 'Lê Văn C',
      staff_phone: '0912345678',
      staff_qualification: 'Điều dưỡng',
      care_contract_status: 'Chưa ký',
      check_contract_status: 'Chưa ký',
      check_contract_completed: false,
      checklist_steering_committee: true,
      checklist_activity_plan: false,
      checklist_inspected: false,
      checklist_collective_kitchen: true,
    }
  },
  { 
    schoolId: 3, schoolYearId: 3, 
    dynamicData: {
      student_count: 890,
      staff_name: 'Phạm Thị D',
      staff_phone: '0923456789',
      staff_qualification: 'Y sĩ',
      care_contract_status: 'Đã ký',
      care_contract_party: 'TYT Lạc Tánh',
      care_contract_signer: 'Nguyễn Hữu E',
      check_contract_status: 'Đã ký',
      check_contract_party: 'Bệnh viện Tánh Linh',
      check_contract_completed: false,
      check_contract_cost: 55000,
      checklist_steering_committee: true,
      checklist_activity_plan: true,
      checklist_inspected: false,
      checklist_collective_kitchen: true,
    }
  },
  // Year 2023-2024 Data
  { 
    schoolId: 1, schoolYearId: 2, 
    dynamicData: {
      student_count: 510,
      staff_name: 'Nguyễn Thị A',
      staff_phone: '0987654321',
      staff_qualification: 'Y sĩ',
      care_contract_status: 'Đã ký',
      care_contract_party: 'TYT Đức Phú',
      care_contract_signer: 'Trần Văn B',
      check_contract_status: 'Đã ký',
      check_contract_party: 'Bệnh viện Tánh Linh',
      check_contract_completed: true,
      check_contract_cost: 48000,
      checklist_steering_committee: true,
      checklist_activity_plan: true,
      checklist_inspected: true,
      checklist_collective_kitchen: false,
    }
  },
  { 
    schoolId: 2, schoolYearId: 2, 
    dynamicData: {
      student_count: 340,
      staff_name: 'Lê Văn C',
      staff_phone: '0912345678',
      staff_qualification: 'Điều dưỡng',
      care_contract_status: 'Đã ký',
      care_contract_party: 'TYT Suối Kiết',
      care_contract_signer: 'Võ Thị F',
      check_contract_status: 'Đã ký',
      check_contract_party: 'Phòng khám ABC',
      check_contract_completed: true,
      check_contract_cost: 45000,
      checklist_steering_committee: true,
      checklist_activity_plan: true,
      checklist_inspected: false,
      checklist_collective_kitchen: true,
    }
  },
];