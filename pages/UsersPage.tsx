

import React, { useState } from 'react';
import { School, User } from '../types';
import Modal from '../components/Modal';

interface UsersPageProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    schools: School[];
}

const initialFormState: Omit<User, 'id'> & { id?: number; password?: string } = {
    name: '',
    phone: '',
    username: '', 
    password: '',
    role: 'user',
    assignedSchoolIds: [],
};

const UsersPage: React.FC<UsersPageProps> = ({ users, setUsers, schools }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    const openModal = (user: User | null = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({ ...user, password: '', assignedSchoolIds: user.assignedSchoolIds || [] });
        } else {
            setCurrentUser(null);
            setFormData({
                ...initialFormState,
                id: Math.max(0, ...users.map(u => u.id)) + 1,
            });
        }
        setIsModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setCurrentUser(null);
        setFormData(initialFormState);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSchoolCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const schoolId = Number(e.target.value);
        setFormData(prev => {
            const currentIds = prev.assignedSchoolIds || [];
            if (e.target.checked) {
                return { ...prev, assignedSchoolIds: [...currentIds, schoolId] };
            } else {
                return { ...prev, assignedSchoolIds: currentIds.filter(id => id !== schoolId) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.username || (formData.role === 'user' && (!formData.assignedSchoolIds || formData.assignedSchoolIds.length === 0))) {
            alert('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
            return;
        }

        if (currentUser) { // Editing
            const updatedUser: User = {
                ...currentUser,
                name: formData.name,
                phone: formData.phone,
                role: formData.role,
                assignedSchoolIds: formData.role === 'user' ? (formData.assignedSchoolIds || []) : [],
            };
            if (formData.password) {
                updatedUser.password = formData.password;
            }

            const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
            setUsers(updatedUsers);

        } else { // Adding
            if (!formData.password) {
                alert('Vui lòng nhập mật khẩu cho người dùng mới.');
                return;
            }
            const newUser: User = {
                id: formData.id || 0,
                name: formData.name,
                phone: formData.phone,
                username: formData.username,
                password: formData.password,
                role: formData.role,
                assignedSchoolIds: formData.role === 'user' ? (formData.assignedSchoolIds || []) : [],
            };
            setUsers([...users, newUser]);
        }
        closeModal();
    };

    const handleDelete = () => {
        if (!currentUser) return;
        
        const updatedUsers = users.filter(u => u.id !== currentUser.id);
        setUsers(updatedUsers);
        
        closeModal();
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h2>
                <button 
                    onClick={() => openModal()}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                    Tạo tài khoản mới
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Họ & Tên
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Số điện thoại
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tên tài khoản
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Trường được gán
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const assignedSchools = user.assignedSchoolIds?.map(id => schools.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{user.phone}</p>
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{user.username}</p>
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{assignedSchools || (user.role === 'admin' ? 'N/A' : 'Chưa gán')}</p>
                                        </td>
                                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex space-x-3">
                                                <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 font-medium">Chỉnh sửa</button>
                                                {user.role !== 'admin' && <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900 font-medium">Xóa</button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black">Họ & Tên</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black">Số điện thoại</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black">Vai trò</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>
                    {formData.role === 'user' && (
                        <div>
                            <label className="block text-sm font-medium text-black">Gán cho trường</label>
                            <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 bg-white">
                                {schools.map(school => (
                                    <div key={school.id} className="flex items-center">
                                        <input
                                            id={`school-${school.id}`}
                                            type="checkbox"
                                            value={school.id}
                                            checked={formData.assignedSchoolIds?.includes(school.id)}
                                            onChange={handleSchoolCheckboxChange}
                                            className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                                        />
                                        <label htmlFor={`school-${school.id}`} className="ml-3 block text-sm text-black">
                                            {school.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <hr className="my-2" />
                    <div>
                        <label className="block text-sm font-medium text-black">Tên tài khoản</label>
                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={!!currentUser} className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-black disabled:text-gray-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black">Mật khẩu</label>
                        <input type="password" name="password" value={formData.password || ''} onChange={handleInputChange} placeholder={currentUser ? 'Để trống nếu không đổi' : ''} required={!currentUser} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
                    </div>

                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">
                            Hủy
                        </button>
                        <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                            Lưu
                        </button>
                    </div>
                </form>
            </Modal>
            
             <Modal isOpen={isDeleteModalOpen} onClose={closeModal} title="Xác nhận xóa người dùng">
                <div className="py-2">
                    <p className="text-gray-700">Bạn có chắc chắn muốn xóa người dùng <span className="font-bold">{currentUser?.name}</span> không?</p>
                    <p className="text-sm text-red-600 mt-2">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors duration-300">
                        Hủy
                    </button>
                    <button type="button" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                        Xóa
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default UsersPage;