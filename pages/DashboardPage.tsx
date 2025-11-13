// Fix: Moved the correct DashboardPage component here from components/SchoolHealthDetail.tsx.
import React, { useState } from 'react';
import { SchoolYear, User, School, HealthRecord, DynamicField } from '../types';
import DashboardCard from '../components/DashboardCard';
import { SchoolIcon, ChartBarIcon, UsersIcon } from '../components/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
    selectedYear: SchoolYear;
    currentUser: User;
    schools: School[];
    healthRecords: HealthRecord[];
    dynamicFields: DynamicField[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear, currentUser, schools, healthRecords, dynamicFields }) => {
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

    const toggleAlert = (alertType: string) => {
        setExpandedAlert(prev => (prev === alertType ? null : alertType));
    };

    // Filter data based on the current user's assigned schools
    const schoolsForUser = currentUser.role === 'admin' 
        ? schools
        : schools.filter(s => currentUser.assignedSchoolIds?.includes(s.id));

    const recordsForYear = healthRecords.filter(r => r.schoolYearId === selectedYear.id);
    const recordsForUserAndYear = recordsForYear.filter(r => schoolsForUser.some(s => s.id === r.schoolId));

    // Calculate dashboard card metrics based on filtered data
    const totalSchools = schoolsForUser.length;
    const totalStudents = recordsForUserAndYear.reduce((sum, r) => sum + (Number(r.dynamicData?.['student_count']) || 0), 0);
    const contractsSigned = recordsForUserAndYear.filter(r => r.dynamicData?.['care_contract_status'] === 'Đã ký').length;
    const healthChecksDone = recordsForUserAndYear.filter(r => r.dynamicData?.['check_contract_completed'] === true).length;
    const collectiveKitchens = recordsForUserAndYear.filter(r => r.dynamicData?.['checklist_collective_kitchen'] === true).length;
    const inspectedSchools = recordsForUserAndYear.filter(r => r.dynamicData?.['checklist_inspected'] === true).length;
    const activityPlans = recordsForUserAndYear.filter(r => r.dynamicData?.['checklist_activity_plan'] === true).length;
    const steeringCommittees = recordsForUserAndYear.filter(r => r.dynamicData?.['checklist_steering_committee'] === true).length;

    // Prepare chart data based on filtered schools
    const barChartData = schoolsForUser.map(school => {
        const record = recordsForYear.find(r => r.schoolId === school.id);
        return {
            name: school.name.replace('THCS ', '').replace('Tiểu học ', '').replace('THPT ', ''),
            students: record ? (Number(record.dynamicData?.['student_count']) || 0) : 0,
        };
    });

    // --- Dynamic Quick Alerts Logic ---
    const recordsBySchoolId: Map<number, HealthRecord> = new Map(recordsForUserAndYear.map(r => [r.schoolId, r]));

    const schoolsWithoutActivityPlan: string[] = [];
    const schoolsWithoutCareContract: string[] = [];
    const schoolsWithoutHealthCheck: string[] = [];

    const careContractFieldNames = dynamicFields.filter(f => f.tab === 'careContract').map(f => f.name);
    const checkContractFieldNames = dynamicFields.filter(f => f.tab === 'checkContract').map(f => f.name);
    const isEmpty = (value: any) => value === undefined || value === null || value === '';

    schoolsForUser.forEach(school => {
        const record = recordsBySchoolId.get(school.id);

        // Check 1: Activity Plan
        const activityPlanCompliant = record &&
            record.dynamicData?.['checklist_activity_plan'] === true &&
            record.attachments?.some(a => a.fieldName === 'checklist_activity_plan');

        if (!activityPlanCompliant) {
            schoolsWithoutActivityPlan.push(school.name);
        }
        
        // Check 2: Care Contract
        const careContractCompliant = record &&
            careContractFieldNames.every(fieldName => !isEmpty(record.dynamicData?.[fieldName])) &&
            record.dynamicData?.['care_contract_status'] === 'Đã ký' &&
            record.attachments?.some(a => a.fieldName === 'careContract_contract_file');

        if (!careContractCompliant) {
            schoolsWithoutCareContract.push(school.name);
        }

        // Check 3: Health Check
        const healthCheckCompliant = record &&
            checkContractFieldNames.every(fieldName => !isEmpty(record.dynamicData?.[fieldName])) &&
            record.dynamicData?.['check_contract_completed'] === true &&
            record.attachments?.some(a => a.fieldName === 'checkContract_contract_file');
        
        if (!healthCheckCompliant) {
            schoolsWithoutHealthCheck.push(school.name);
        }
    });


    // --- School Level Statistics Logic ---
    const schoolLevelCounts: Record<School['level'], number> = {
        'Mầm non': 0, 'Tiểu học': 0, 'THCS': 0, 'THPT': 0, 'Liên cấp': 0,
    };
    schoolsForUser.forEach(school => {
        if (schoolLevelCounts.hasOwnProperty(school.level)) {
            schoolLevelCounts[school.level]++;
        }
    });
    
    const schoolLevels: School['level'][] = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Liên cấp'];
    
    // --- Pie Chart Data Logic ---
    const studentCountByLevelData = schoolLevels.map(level => {
        const schoolsInLevel = schoolsForUser.filter(s => s.level === level);
        const studentCount = schoolsInLevel.reduce((sum, school) => {
            const record = recordsForUserAndYear.find(r => r.schoolId === school.id);
            return sum + (record ? (Number(record.dynamicData?.['student_count']) || 0) : 0);
        }, 0);
        return { name: level, value: studentCount };
    }).filter(item => item.value > 0);

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent === 0) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800">Dashboard: Năm học {selectedYear.year}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Tổng số trường" value={totalSchools} description="Các trường được phân công">
                    <SchoolIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Tổng số học sinh" value={totalStudents.toLocaleString('vi-VN')} description={`Trong năm học ${selectedYear.year}`}>
                    <UsersIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="HĐ CSSK đã ký" value={`${contractsSigned} / ${totalSchools}`} description={totalSchools > 0 ? `${((contractsSigned / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                   <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="KSK đã tổ chức" value={`${healthChecksDone} / ${totalSchools}`} description={totalSchools > 0 ? `${((healthChecksDone / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Có bếp ăn tập thể" value={`${collectiveKitchens} / ${totalSchools}`} description={totalSchools > 0 ? `${((collectiveKitchens / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Đã được kiểm tra" value={`${inspectedSchools} / ${totalSchools}`} description={totalSchools > 0 ? `${((inspectedSchools / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Có KH hoạt động" value={`${activityPlans} / ${totalSchools}`} description={totalSchools > 0 ? `${((activityPlans / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>
                <DashboardCard title="Có Ban chỉ đạo" value={`${steeringCommittees} / ${totalSchools}`} description={totalSchools > 0 ? `${((steeringCommittees / totalSchools) * 100).toFixed(0)}%` : '0%'}>
                    <ChartBarIcon className="w-8 h-8"/>
                </DashboardCard>

                {/* School Level Statistics Cards */}
                {schoolLevels.map(level => {
                    const count = schoolLevelCounts[level];
                    if (count === 0) return null;
                    return (
                        <DashboardCard 
                            key={level}
                            title={level}
                            value={count} 
                            description="trường học"
                        >
                            <SchoolIcon className="w-8 h-8"/>
                        </DashboardCard>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Số lượng học sinh theo trường</h3>
                     <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            data={barChartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 0,
                                bottom: 150, // Increase bottom margin for rotated labels
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-90} // Rotate labels to be vertical
                                textAnchor="end"
                                interval={0}
                                tick={{ fontSize: 12 }} // Adjust font size for clarity
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                formatter={(value: number) => [value.toLocaleString('vi-VN'), 'Số học sinh']}
                                cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                            />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                            <Bar dataKey="students" fill="#0ea5e9" name="Số học sinh" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Số lượng học sinh theo phân cấp</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={studentCountByLevelData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {studentCountByLevelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('vi-VN')} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                     <h3 className="text-xl font-semibold text-slate-800 mb-4">Cảnh báo nhanh</h3>
                     <div className="space-y-4">
                        {schoolsWithoutActivityPlan.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleAlert('activity')}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                    aria-expanded={expandedAlert === 'activity'}
                                >
                                    <p className="text-sm font-medium text-yellow-800">{schoolsWithoutActivityPlan.length} trường chưa nộp KH hoạt động YTTH</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-yellow-700 transform transition-transform duration-300 ${expandedAlert === 'activity' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${expandedAlert === 'activity' ? 'max-h-[40rem]' : 'max-h-0'}`}>
                                    <div className="px-4 pb-4 text-sm text-yellow-700">
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                            {schoolsWithoutActivityPlan.map(schoolName => (
                                                <li key={`activity-${schoolName}`}>{schoolName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {schoolsWithoutCareContract.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleAlert('care')}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                    aria-expanded={expandedAlert === 'care'}
                                >
                                    <p className="text-sm font-medium text-red-800">{schoolsWithoutCareContract.length} trường chưa ký HĐ CSSK</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-red-700 transform transition-transform duration-300 ${expandedAlert === 'care' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${expandedAlert === 'care' ? 'max-h-[40rem]' : 'max-h-0'}`}>
                                    <div className="px-4 pb-4 text-sm text-red-700">
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                            {schoolsWithoutCareContract.map(schoolName => (
                                                <li key={`care-${schoolName}`}>{schoolName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                         {schoolsWithoutHealthCheck.length > 0 && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleAlert('check')}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                    aria-expanded={expandedAlert === 'check'}
                                >
                                    <p className="text-sm font-medium text-blue-800">{schoolsWithoutHealthCheck.length} trường chưa KSK học sinh</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-700 transform transition-transform duration-300 ${expandedAlert === 'check' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${expandedAlert === 'check' ? 'max-h-[40rem]' : 'max-h-0'}`}>
                                    <div className="px-4 pb-4 text-sm text-blue-700">
                                         <ul className="list-disc list-inside space-y-1 mt-1">
                                            {schoolsWithoutHealthCheck.map(schoolName => (
                                                <li key={`check-${schoolName}`}>{schoolName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        {schoolsWithoutActivityPlan.length === 0 && schoolsWithoutCareContract.length === 0 && schoolsWithoutHealthCheck.length === 0 && (
                            <div className="text-center text-slate-500 py-4">
                                <p>Tuyệt vời! Không có cảnh báo nào.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;