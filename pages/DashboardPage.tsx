// Fix: Moved the correct DashboardPage component here from components/SchoolHealthDetail.tsx.
import React from 'react';
import { SchoolYear, User } from '../types';
import { HEALTH_RECORDS, SCHOOLS } from '../constants';
import DashboardCard from '../components/DashboardCard';
import { SchoolIcon, ChartBarIcon, UsersIcon } from '../components/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardPageProps {
    selectedYear: SchoolYear;
    currentUser: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear, currentUser }) => {
    // Note: For a true user-specific view, this data would be filtered by currentUser.assignedSchoolId
    const recordsForYear = HEALTH_RECORDS.filter(r => r.schoolYearId === selectedYear.id);
    const totalSchools = SCHOOLS.length;
    const totalStudents = recordsForYear.reduce((sum, r) => sum + (Number(r.dynamicData?.['student_count']) || 0), 0);
    const contractsSigned = recordsForYear.filter(r => r.dynamicData?.['care_contract_status'] === 'Đã ký').length;
    const healthChecksDone = recordsForYear.filter(r => r.dynamicData?.['check_contract_completed'] === true).length;

    const chartData = SCHOOLS.map(school => {
        const record = recordsForYear.find(r => r.schoolId === school.id);
        return {
            name: school.name.replace('THCS ', '').replace('Tiểu học ', ''),
            students: record ? (Number(record.dynamicData?.['student_count']) || 0) : 0,
        };
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard: Năm học {selectedYear.year}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Tổng số trường" value={totalSchools} description="Tất cả các cấp">
                    <SchoolIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Tổng số học sinh" value={totalStudents.toLocaleString('vi-VN')} description={`Trong năm học ${selectedYear.year}`}>
                    <UsersIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="HĐ CSSK đã ký" value={`${contractsSigned} / ${totalSchools}`} description={`${((contractsSigned / totalSchools) * 100).toFixed(0)}%`}>
                   <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="KSK đã tổ chức" value={`${healthChecksDone} / ${totalSchools}`} description={`${((healthChecksDone / totalSchools) * 100).toFixed(0)}%`}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Số lượng học sinh theo trường</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="students" fill="#0ea5e9" name="Số học sinh" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-gray-800 mb-4">Cảnh báo nhanh</h3>
                     <div className="space-y-4">
                        <div className="flex items-start p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-800">5 trường chưa nộp KH hoạt động YTTH</p>
                                <p className="text-sm text-yellow-700 mt-1">Vui lòng đôn đốc các trường THCS Nghị Đức, Tiểu học Suối Kiết...</p>
                            </div>
                        </div>
                         <div className="flex items-start p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">2 trường chưa ký HĐ CSSK</p>
                                <p className="text-sm text-red-700 mt-1">Trường Tiểu học Suối Kiết và THPT Tánh Linh.</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;