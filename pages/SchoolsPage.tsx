import React, { useState, useEffect, useMemo } from 'react';
import { School, SchoolYear, DynamicField, User, HealthRecord } from '../types';
import SchoolHealthDetail from '../components/SchoolHealthDetail';
import Modal from '../components/Modal';
import { TrashIcon } from '../components/icons';

interface SchoolsPageProps {
  selectedYear: SchoolYear;
  dynamicFields: DynamicField[];
  currentUser: User;
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  showNotification: (message: string) => void;
}

const SchoolsPage: React.FC<SchoolsPageProps> = ({ selectedYear, dynamicFields, currentUser, schools, setSchools, healthRecords, setHealthRecords, showNotification }) => {
    const schoolsForUser = currentUser.role === 'admin' 
        ? schools
        : schools.filter(s => currentUser.assignedSchoolIds?.includes(s.id));

    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newSchool, setNewSchool] = useState({
        name: '',
        level: 'THCS' as School['level'],
        location: ''
    });

    const filteredSchools = useMemo(() =>
        schoolsForUser.filter(school =>
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.location.toLowerCase().includes(searchQuery.toLowerCase())
        ), [schoolsForUser, searchQuery]);


    useEffect(() => {
        // When the filtered list changes, update the selection.
        if (filteredSchools.length > 0) {
            // If the currently selected school is not in the new filtered list, select the first one.
            if (!filteredSchools.find(s => s.id === selectedSchool?.id)) {
                setSelectedSchool(filteredSchools[0]);
            }
        } else {
            // If the filtered list is empty, deselect.
            setSelectedSchool(null);
        }
    }, [filteredSchools, selectedSchool]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSchool(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSchool = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchool.name || !newSchool.location) {
            alert('Vui lòng điền đầy đủ Tên trường và Địa điểm.');
            return;
        }

        const newSchoolWithId: School = {
            id: Math.max(...schools.map(s => s.id), 0) + 1,
            ...newSchool
        };

        const updatedSchools = [...schools, newSchoolWithId];
        setSchools(updatedSchools);
        setSelectedSchool(newSchoolWithId);
        showNotification(`Trường "${newSchoolWithId.name}" đã được thêm thành công.`);
        
        setNewSchool({ name: '', level: 'THCS', location: '' });
        setAddModalOpen(false);
    };

    const handleDeleteClick = (school: School) => {
        setSchoolToDelete(school);
    };

    const handleConfirmDelete = () => {
        if (!schoolToDelete) return;

        const updatedSchools = schools.filter(s => s.id !== schoolToDelete.id);
        setSchools(updatedSchools);
        showNotification(`Trường "${schoolToDelete.name}" đã được xóa.`);

        setSchoolToDelete(null);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Trường học</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Danh sách trường</h3>
                         {currentUser.role === 'admin' && (
                            <button 
                                onClick={() => setAddModalOpen(true)}
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-3 rounded text-sm transition-colors duration-300"
                             >
                               Thêm mới
                            </button>
                         )}
                    </div>
                     <div className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <ul className="space-y-2 max-h-[55vh] overflow-y-auto">
                        {filteredSchools.map(school => (
                            <li 
                                key={school.id}
                                onClick={() => setSelectedSchool(school)}
                                className={`group p-3 rounded-md cursor-pointer transition-all duration-200 border-l-4 flex justify-between items-center ${selectedSchool?.id === school.id 
                                    ? 'bg-brand-blue-light border-brand-blue shadow' 
                                    : 'hover:bg-gray-100 hover:border-brand-gray-dark border-transparent'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800">{school.name}</p>
                                    <p className="text-sm text-gray-500">{school.level} - {school.location}</p>
                                </div>
                                {currentUser.role === 'admin' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(school);
                                        }}
                                        className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Xóa trường ${school.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </li>
                        ))}
                        {filteredSchools.length === 0 && (
                            <li className="text-center text-gray-500 py-4">Không tìm thấy trường nào.</li>
                        )}
                    </ul>
                </div>
                <div className="lg:col-span-2">
                    {selectedSchool ? (
                        <SchoolHealthDetail school={selectedSchool} selectedYear={selectedYear} dynamicFields={dynamicFields} healthRecords={healthRecords} setHealthRecords={setHealthRecords} showNotification={showNotification} />
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {currentUser.role === 'admin' ? 'Chọn hoặc tạo trường mới' : 'Thông tin trường học'}
                            </h3>
                             <p className="text-gray-500 mt-2">
                                {searchQuery 
                                    ? 'Không có trường nào khớp với tìm kiếm của bạn.'
                                    : currentUser.role === 'admin' 
                                        ? 'Vui lòng chọn một trường từ danh sách hoặc thêm một trường mới để bắt đầu.'
                                        : 'Không có trường nào được gán cho tài khoản của bạn.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Thêm trường học mới">
                <form onSubmit={handleAddSchool} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black">Tên trường</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newSchool.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="level" className="block text-sm font-medium text-black">Phân cấp</label>
                        <select
                            id="level"
                            name="level"
                            value={newSchool.level}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                        >
                            <option value="Mầm non">Mầm non</option>
                            <option value="Tiểu học">Tiểu học</option>
                            <option value="THCS">THCS</option>
                            <option value="THPT">THPT</option>
                            <option value="Liên cấp">Liên cấp</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-black">Địa điểm</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={newSchool.location}
                            onChange={handleInputChange}
                            required
                             className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={() => setAddModalOpen(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded mr-2 hover:bg-gray-300 transition-colors duration-300">
                            Hủy
                        </button>
                        <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                            Thêm trường
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={!!schoolToDelete} onClose={() => setSchoolToDelete(null)} title="Xác nhận xóa trường">
                <div className="py-2">
                    <p className="text-gray-700">Bạn có chắc chắn muốn xóa trường <span className="font-bold">{schoolToDelete?.name}</span> không?</p>
                    <p className="text-sm text-red-600 mt-2">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button 
                        type="button" 
                        onClick={() => setSchoolToDelete(null)} 
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300"
                    >
                        Hủy
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirmDelete} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                    >
                        Xóa
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SchoolsPage;