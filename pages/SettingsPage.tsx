

import React, { useState } from 'react';
import { SchoolYear, DynamicField, HealthRecord } from '../types';
import Modal from '../components/Modal';

interface SettingsPageProps {
  schoolYears: SchoolYear[];
  setSchoolYears: React.Dispatch<React.SetStateAction<SchoolYear[]>>;
  dynamicFields: DynamicField[];
  setDynamicFields: React.Dispatch<React.SetStateAction<DynamicField[]>>;
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  seedDatabase: () => void;
}

const TABS: { [key: string]: string } = {
    overview: 'Tab 1: Tổng quan',
    staff: 'Tab 2: Nhân viên Y tế',
    careContract: 'Tab 3: Hợp đồng CSSK',
    checkContract: 'Tab 4: Hợp đồng KSK',
    checklist: 'Tab 5: Hoạt động (Checklist)',
};

const initialFieldState = {
    id: '',
    tab: 'staff' as DynamicField['tab'],
    label: '',
    type: 'text' as DynamicField['type'],
    options: ''
};

const SettingsPage: React.FC<SettingsPageProps> = ({ schoolYears, setSchoolYears, dynamicFields, setDynamicFields, healthRecords, setHealthRecords, seedDatabase }) => {
    const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
    const [yearToEdit, setYearToEdit] = useState<SchoolYear | null>(null);
    const [yearToLock, setYearToLock] = useState<SchoolYear | null>(null);
    const [yearToUnlock, setYearToUnlock] = useState<SchoolYear | null>(null);
    const [yearToDelete, setYearToDelete] = useState<SchoolYear | null>(null);
    
    const [newYearName, setNewYearName] = useState('');
    const [editedYearName, setEditedYearName] = useState('');

    const [selectedConfigTab, setSelectedConfigTab] = useState<DynamicField['tab']>('staff');
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [fieldData, setFieldData] = useState(initialFieldState);
    const [fieldToDelete, setFieldToDelete] = useState<DynamicField | null>(null);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);


    const handleOpenAddYearModal = () => {
        setNewYearName('');
        setIsAddYearModalOpen(true);
    };

    const handleAddYear = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newYearName.match(/^\d{4}-\d{4}$/)) {
            alert('Vui lòng nhập năm học đúng định dạng (VD: 2025-2026).');
            return;
        }
        if (schoolYears.some(sy => sy.year === newYearName)) {
            alert('Năm học này đã tồn tại.');
            return;
        }
        
        const newYear: SchoolYear = {
            id: Math.max(0, ...schoolYears.map(sy => sy.id)) + 1,
            year: newYearName,
            isCurrent: false,
            isLocked: false,
        };
        setSchoolYears([...schoolYears, newYear]);
        setIsAddYearModalOpen(false);
    };
    
    const handleOpenEditYearModal = (year: SchoolYear) => {
        setYearToEdit(year);
        setEditedYearName(year.year);
    };

    const handleEditYear = (e: React.FormEvent) => {
        e.preventDefault();
        if (!yearToEdit) return;
        if (!editedYearName.match(/^\d{4}-\d{4}$/)) {
             alert('Vui lòng nhập năm học đúng định dạng (VD: 2025-2026).');
            return;
        }
        if (schoolYears.some(sy => sy.year === editedYearName && sy.id !== yearToEdit.id)) {
            alert('Năm học này đã tồn tại.');
            return;
        }
        
        setSchoolYears(schoolYears.map(sy => 
            sy.id === yearToEdit.id ? { ...sy, year: editedYearName } : sy
        ));
        setYearToEdit(null);
    };

    const handleSetCurrent = (yearId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn đặt năm học này làm năm học hiện tại?')) {
            setSchoolYears(schoolYears.map(sy => ({
                ...sy,
                isCurrent: sy.id === yearId,
            })));
        }
    };
    
    const handleConfirmLock = () => {
        if (!yearToLock) return;
        setSchoolYears(schoolYears.map(sy => 
            sy.id === yearToLock.id ? { ...sy, isLocked: true } : sy
        ));
        setYearToLock(null);
    };

    const handleConfirmUnlock = () => {
        if (!yearToUnlock) return;
        setSchoolYears(schoolYears.map(sy =>
            sy.id === yearToUnlock.id ? { ...sy, isLocked: false } : sy
        ));
        setYearToUnlock(null);
    };

    const handleConfirmDeleteYear = () => {
        if (!yearToDelete) return;
        
        setSchoolYears(schoolYears.filter(sy => sy.id !== yearToDelete.id));

        const updatedHealthRecords = healthRecords.filter(hr => hr.schoolYearId !== yearToDelete.id);
        setHealthRecords(updatedHealthRecords);

        setYearToDelete(null);
    };

    const handleOpenFieldModal = (field: DynamicField | null = null) => {
        if (field) {
            setFieldData({ ...field, options: field.options?.join(', ') || '' });
        } else {
            setFieldData({ ...initialFieldState, tab: selectedConfigTab });
        }
        setIsFieldModalOpen(true);
    };

    const handleFieldInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFieldData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveField = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fieldData.label) {
            alert('Vui lòng nhập nhãn cho trường thông tin.');
            return;
        }
        
        const fieldName = fieldData.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        if (fieldData.id) { // Editing existing field
            setDynamicFields(dynamicFields.map(f => {
                if (f.id !== fieldData.id) return f;

                // Create a new object for the updated field, excluding old options
                const { options, ...baseField } = f;
                const updatedField: DynamicField = {
                    ...baseField,
                    label: fieldData.label,
                    type: fieldData.type,
                };
                
                // Conditionally add the options property back if needed
                if (fieldData.type === 'select' || fieldData.type === 'droplist') {
                    updatedField.options = fieldData.options.split(',').map(s => s.trim());
                }

                return updatedField;
            }));
        } else { // Adding new field
             if (dynamicFields.some(f => f.tab === selectedConfigTab && f.name === fieldName)) {
                alert('Một trường với tên tương tự đã tồn tại trong tab này.');
                return;
            }
            
            // Create the new field object
            const newField: DynamicField = {
                id: Date.now().toString(),
                tab: selectedConfigTab,
                label: fieldData.label,
                name: fieldName,
                type: fieldData.type,
            };

            // Conditionally add the options property
            if (fieldData.type === 'select' || fieldData.type === 'droplist') {
                newField.options = fieldData.options.split(',').map(s => s.trim());
            }

            setDynamicFields([...dynamicFields, newField]);
        }
        setIsFieldModalOpen(false);
    };

    const handleConfirmDeleteField = () => {
        if (!fieldToDelete) return;
        setDynamicFields(dynamicFields.filter(f => f.id !== fieldToDelete.id));
        setFieldToDelete(null);
    };

    const handleConfirmReset = () => {
        seedDatabase();
        setIsResetModalOpen(false);
    };

    const filteredFields = dynamicFields.filter(f => f.tab === selectedConfigTab);

    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Cấu hình Hệ thống</h2>

            {/* School Year Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Quản lý Năm học</h3>
                    <button onClick={handleOpenAddYearModal} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-3 rounded text-sm transition-colors duration-300">
                        Tạo năm học mới
                    </button>
                </div>
                <div className="space-y-3">
                    {[...schoolYears].sort((a,b) => a.year.localeCompare(b.year)).map(sy => (
                        <div key={sy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                            <div>
                                <span className="font-semibold text-gray-800">{sy.year}</span>
                                {sy.isCurrent && <span className="ml-2 text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full">Hiện tại</span>}
                                {sy.isLocked && <span className="ml-2 text-xs font-bold text-white bg-gray-500 px-2 py-1 rounded-full">Đã khóa</span>}
                            </div>
                            <div className="space-x-3">
                                {sy.isLocked ? (
                                    <button onClick={() => setYearToUnlock(sy)} className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">Mở khóa</button>
                                ) : (
                                    <>
                                        <button onClick={() => handleOpenEditYearModal(sy)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Sửa</button>
                                        {!sy.isCurrent && (
                                            <button onClick={() => handleSetCurrent(sy.id)} className="text-sm text-green-600 hover:text-green-900 font-medium">Đặt làm hiện tại</button>
                                        )}
                                        <button onClick={() => setYearToLock(sy)} className="text-sm text-orange-600 hover:text-orange-800 font-medium">Khóa</button>
                                        {!sy.isCurrent && (
                                            <button onClick={() => setYearToDelete(sy)} className="text-sm text-red-600 hover:text-red-900 font-medium">Xóa</button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Configuration */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Quản lý Cấu hình Động (Nâng cao)</h3>
                    <button onClick={() => handleOpenFieldModal()} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-3 rounded text-sm transition-colors duration-300">
                        Thêm trường thông tin mới
                    </button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Tab để sửa</label>
                        <select 
                            value={selectedConfigTab} 
                            onChange={(e) => setSelectedConfigTab(e.target.value as DynamicField['tab'])}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block w-full p-2.5"
                        >
                            {Object.entries(TABS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {filteredFields.length > 0 ? (
                    <div className="space-y-3 mt-4 border-t pt-4">
                        {filteredFields.map(field => (
                            <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div>
                                    <span className="font-semibold text-gray-800">{field.label}</span>
                                    <span className="ml-3 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{field.type}</span>
                                </div>
                                <div className="space-x-3">
                                    <button onClick={() => handleOpenFieldModal(field)} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Sửa</button>
                                    <button onClick={() => setFieldToDelete(field)} className="text-sm text-red-600 hover:text-red-900 font-medium">Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 text-center text-gray-500 py-10 border-t">
                        <p>Chưa có trường thông tin động nào cho tab này. Nhấn "Thêm trường thông tin mới" để bắt đầu.</p>
                    </div>
                )}
            </div>
             {/* Data Management Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
                <h3 className="text-xl font-semibold text-red-700">Quản lý Dữ liệu (Nguy hiểm)</h3>
                <p className="text-gray-600 mt-2 mb-4">
                    Thao tác này sẽ xóa toàn bộ dữ liệu hiện tại và khôi phục lại dữ liệu ban đầu của hệ thống (bao gồm danh sách 61 trường học mới nhất). 
                    Chỉ thực hiện khi bạn muốn làm mới toàn bộ hệ thống.
                </p>
                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                    Reset toàn bộ dữ liệu
                </button>
            </div>
            
            {/* --- Modals --- */}
            
            {/* School Year Modals */}
            <Modal isOpen={isAddYearModalOpen} onClose={() => setIsAddYearModalOpen(false)} title="Tạo năm học mới">
                <form onSubmit={handleAddYear} className="space-y-4">
                    <div>
                        <label htmlFor="newYearName" className="block text-sm font-medium text-black">Tên năm học (VD: 2025-2026)</label>
                        <input type="text" id="newYearName" value={newYearName} onChange={(e) => setNewYearName(e.target.value)} required pattern="\d{4}-\d{4}" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={() => setIsAddYearModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button>
                        <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300">Tạo</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={!!yearToEdit} onClose={() => setYearToEdit(null)} title={`Chỉnh sửa năm học: ${yearToEdit?.year}`}>
                <form onSubmit={handleEditYear} className="space-y-4">
                     <div>
                        <label htmlFor="editedYearName" className="block text-sm font-medium text-black">Tên năm học (VD: 2025-2026)</label>
                        <input type="text" id="editedYearName" value={editedYearName} onChange={(e) => setEditedYearName(e.target.value)} required pattern="\d{4}-\d{4}" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={() => setYearToEdit(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Lưu thay đổi</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={!!yearToLock} onClose={() => setYearToLock(null)} title="Xác nhận khóa năm học">
                <div className="py-2"><p className="text-gray-700">Bạn có chắc chắn muốn khóa năm học <span className="font-bold">{yearToLock?.year}</span> không?</p><p className="text-sm text-orange-600 mt-2">Sau khi khóa, bạn sẽ không thể chỉnh sửa dữ liệu của năm học này nữa.</p></div>
                <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={() => setYearToLock(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button><button type="button" onClick={handleConfirmLock} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Xác nhận Khóa</button></div>
            </Modal>
            <Modal isOpen={!!yearToUnlock} onClose={() => setYearToUnlock(null)} title="Xác nhận mở khóa năm học">
                <div className="py-2"><p className="text-gray-700">Bạn có chắc chắn muốn mở khóa năm học <span className="font-bold">{yearToUnlock?.year}</span>?</p><p className="text-sm text-yellow-600 mt-2">Mở khóa sẽ cho phép chỉnh sửa lại toàn bộ dữ liệu của năm học này.</p></div>
                <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={() => setYearToUnlock(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button><button type="button" onClick={handleConfirmUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Xác nhận Mở khóa</button></div>
            </Modal>
            <Modal isOpen={!!yearToDelete} onClose={() => setYearToDelete(null)} title="Xác nhận xóa năm học">
                <div className="py-2"><p className="text-gray-700">Bạn có chắc chắn muốn xóa vĩnh viễn năm học <span className="font-bold">{yearToDelete?.year}</span>?</p><p className="text-sm text-red-600 mt-2">Toàn bộ dữ liệu liên quan đến năm học này sẽ bị xóa. Hành động này không thể hoàn tác.</p></div>
                <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={() => setYearToDelete(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button><button type="button" onClick={handleConfirmDeleteYear} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Xác nhận Xóa</button></div>
            </Modal>

            {/* Dynamic Field Modals */}
            <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={fieldData.id ? 'Chỉnh sửa trường thông tin' : 'Thêm trường thông tin mới'}>
                <form onSubmit={handleSaveField} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black">Nhãn hiển thị</label>
                        <input type="text" name="label" value={fieldData.label} onChange={handleFieldInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black">Kiểu dữ liệu</label>
                        <select name="type" value={fieldData.type} onChange={handleFieldInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm">
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="select">Select</option>
                            <option value="droplist">Droplist</option>
                        </select>
                    </div>
                    {(fieldData.type === 'select' || fieldData.type === 'droplist') && (
                        <div>
                            <label className="block text-sm font-medium text-black">Tùy chọn (phân cách bằng dấu phẩy)</label>
                            <input type="text" name="options" value={fieldData.options} onChange={handleFieldInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                        </div>
                    )}
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={() => setIsFieldModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Lưu</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={!!fieldToDelete} onClose={() => setFieldToDelete(null)} title="Xác nhận xóa trường thông tin">
                 <div className="py-2"><p className="text-gray-700">Bạn có chắc chắn muốn xóa trường <span className="font-bold">{fieldToDelete?.label}</span>?</p><p className="text-sm text-red-600 mt-2">Dữ liệu đã nhập cho trường này sẽ không còn hiển thị. Hành động này không thể hoàn tác.</p></div>
                 <div className="flex justify-end pt-4 space-x-2"><button type="button" onClick={() => setFieldToDelete(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">Hủy</button><button type="button" onClick={handleConfirmDeleteField} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Xác nhận Xóa</button></div>
            </Modal>
            
            {/* Reset Data Modal */}
            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Xác nhận Reset Dữ liệu">
                <div className="py-2">
                    <p className="text-gray-700 text-lg">Bạn có thực sự chắc chắn muốn reset toàn bộ dữ liệu không?</p>
                    <p className="text-sm text-red-600 mt-2 font-semibold">
                        CẢNH BÁO: Hành động này sẽ <span className="font-bold">XÓA SẠCH</span> toàn bộ dữ liệu hiện tại (bao gồm tất cả các trường học, người dùng, hồ sơ y tế đã nhập) và thay thế bằng dữ liệu mặc định.
                    </p>
                    <p className="text-sm text-red-600 mt-1 font-semibold">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button 
                        type="button" 
                        onClick={() => setIsResetModalOpen(false)} 
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300"
                    >
                        Hủy
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirmReset} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                    >
                        Tôi hiểu, Xác nhận Reset
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SettingsPage;