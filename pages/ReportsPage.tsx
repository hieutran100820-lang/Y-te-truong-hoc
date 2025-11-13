// Fix: Moved the correct ReportsPage component here from pages/DashboardPage.tsx.
import React, { useState } from 'react';
import { School, HealthRecord, SchoolYear, DynamicField, User } from '../types';

type ReportType = 'staff' | 'careContract' | 'checkContract' | 'checklist';

interface ReportData {
    title: string;
    headers: string[];
    rows: (string | number | boolean)[][];
}

interface ComparisonMetrics {
    totalStudents: number;
    careContractsSigned: number;
    checkContractsCompleted: number;
    schoolCount: number;
}

interface ComparisonData {
    year1: { year: string; metrics: ComparisonMetrics };
    year2: { year: string; metrics: ComparisonMetrics };
}

interface ReportsPageProps {
    schoolYears: SchoolYear[];
    dynamicFields: DynamicField[];
    currentUser: User;
    schools: School[];
    healthRecords: HealthRecord[];
}


const ReportsPage: React.FC<ReportsPageProps> = ({ schoolYears, dynamicFields, currentUser, schools, healthRecords }) => {
    const [selectedYearId, setSelectedYearId] = useState<number>(schoolYears.find(sy => sy.isCurrent)?.id || schoolYears[0]?.id);
    const [reportType, setReportType] = useState<ReportType>('staff');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [showReport, setShowReport] = useState<boolean>(false);

    const [compareYear1Id, setCompareYear1Id] = useState<number>(schoolYears.find(sy => sy.isCurrent)?.id || schoolYears[0]?.id);
    const [compareYear2Id, setCompareYear2Id] = useState<number>(schoolYears.length > 1 ? schoolYears[1].id : schoolYears[0].id);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [showComparison, setShowComparison] = useState<boolean>(false);

    const getSchoolName = (schoolId: number): string => schools.find(s => s.id === schoolId)?.name || 'Không rõ';

    const generateReportData = (): ReportData | null => {
        const year = schoolYears.find(sy => sy.id === selectedYearId);
        if (!year) return null;

        const recordsForYear = healthRecords.filter(r => r.schoolYearId === selectedYearId);
        const data: ReportData = { title: '', headers: [], rows: [] };
        
        const schoolsToReportOn = currentUser.role === 'admin' 
            ? schools 
            : schools.filter(s => currentUser.assignedSchoolIds?.includes(s.id));

        // Fix: Explicitly type the Map to prevent `record` from being inferred as `unknown`.
        const recordsBySchoolId: Map<number, HealthRecord> = new Map(recordsForYear.map(r => [r.schoolId, r]));

        const fieldsForReport = dynamicFields.filter(df => df.tab === reportType);

        if (fieldsForReport.length === 0) return null;

        const reportTitles: Record<ReportType, string> = {
            staff: `Báo cáo Nhân sự Y tế Học đường - Năm học ${year.year}`,
            careContract: `Báo cáo Hợp đồng Chăm sóc Sức khỏe - Năm học ${year.year}`,
            checkContract: `Báo cáo Hợp đồng Khám Sức khỏe - Năm học ${year.year}`,
            checklist: `Báo cáo Tuân thủ Hoạt động - Năm học ${year.year}`,
        };

        data.title = reportTitles[reportType];
        data.headers = ['Tên trường', ...fieldsForReport.map(f => f.label)];
        
        schoolsToReportOn.forEach(school => {
            const record = recordsBySchoolId.get(school.id);
            const row: (string | number | boolean)[] = [school.name];

            fieldsForReport.forEach(field => {
                const value = record?.dynamicData?.[field.name];
                 if (value === undefined || value === null || value === '') {
                    row.push('Chưa có');
                } else if (field.type === 'checkbox') {
                    row.push(value ? 'Có' : 'Không');
                } else if (field.type === 'number' && typeof value === 'number') {
                    row.push(value.toLocaleString('vi-VN'));
                }
                else {
                    row.push(String(value));
                }
            });
            data.rows.push(row);
        });
        
        return data;
    };

    const handleGenerateReport = () => {
        const data = generateReportData();
        setReportData(data);
        setShowReport(true);
        setShowComparison(false);
    };

    const calculateMetricsForYear = (yearId: number): ComparisonMetrics => {
        const records = healthRecords.filter(r => r.schoolYearId === yearId);
        const schoolCount = new Set(records.map(r => r.schoolId)).size;
        return {
            totalStudents: records.reduce((sum, r) => sum + (Number(r.dynamicData?.['student_count']) || 0), 0),
            careContractsSigned: records.filter(r => r.dynamicData?.['care_contract_status'] === 'Đã ký').length,
            checkContractsCompleted: records.filter(r => r.dynamicData?.['check_contract_completed'] === true).length,
            schoolCount: schoolCount > 0 ? schoolCount : schools.length, // Avoid division by zero
        };
    };

    const handleGenerateComparison = () => {
        if (compareYear1Id === compareYear2Id) {
            alert("Vui lòng chọn hai năm học khác nhau để so sánh.");
            return;
        }
        const year1 = schoolYears.find(y => y.id === compareYear1Id);
        const year2 = schoolYears.find(y => y.id === compareYear2Id);

        if (!year1 || !year2) return;

        setComparisonData({
            year1: { year: year1.year, metrics: calculateMetricsForYear(compareYear1Id) },
            year2: { year: year2.year, metrics: calculateMetricsForYear(compareYear2Id) },
        });
        setShowComparison(true);
        setShowReport(false);
    }
    
    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Báo cáo & Thống kê</h2>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Tùy chọn Báo cáo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Năm học</label>
                        <select 
                            value={selectedYearId}
                            onChange={(e) => setSelectedYearId(Number(e.target.value))}
                            className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
                        >
                            {schoolYears.map(sy => <option key={sy.id} value={sy.id}>{sy.year}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại báo cáo</label>
                        <select 
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
                        >
                            <option value="staff">Tình trạng Nhân sự YTTH</option>
                            <option value="careContract">Tình trạng Hợp đồng CSSK</option>
                            <option value="checkContract">Tình trạng Khám Sức khỏe</option>
                            <option value="checklist">Tuân thủ Hoạt động (Checklist)</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateReport} className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded transition-colors duration-300">Xem báo cáo</button>
                </div>
            </div>

            {showReport && reportData && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{reportData.title}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    {reportData.headers.map(header => (
                                        <th key={header} className="px-5 py-3 border-b-2 border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-5 py-4 border-b border-slate-200 bg-white text-sm">
                                                <p className="text-slate-900 whitespace-no-wrap">{cell}</p>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {!showReport && !showComparison && (
                 <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-center text-slate-500 py-10">
                        <p>Vui lòng chọn các tùy chọn và nhấn "Xem báo cáo" hoặc "So sánh" để hiển thị dữ liệu.</p>
                    </div>
                </div>
            )}

            {currentUser.role === 'admin' && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Báo cáo So sánh (Nâng cao)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">So sánh năm</label>
                            <select 
                                value={compareYear1Id}
                                onChange={e => setCompareYear1Id(Number(e.target.value))}
                                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5">
                                {schoolYears.map(sy => <option key={sy.id} value={sy.id}>{sy.year}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">với năm</label>
                            <select 
                                value={compareYear2Id}
                                onChange={e => setCompareYear2Id(Number(e.target.value))}
                                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5">
                                {schoolYears.map(sy => <option key={sy.id} value={sy.id}>{sy.year}</option>)}
                            </select>
                        </div>
                        <button onClick={handleGenerateComparison} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded transition-colors duration-300">So sánh</button>
                    </div>
                </div>
            )}
            
            {showComparison && comparisonData && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Kết quả So sánh: {comparisonData.year1.year} và {comparisonData.year2.year}</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Chỉ số</th>
                                    <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">{comparisonData.year1.year}</th>
                                    <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">{comparisonData.year2.year}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm font-semibold text-slate-900">Tổng số học sinh</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year1.metrics.totalStudents.toLocaleString('vi-VN')}</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year2.metrics.totalStudents.toLocaleString('vi-VN')}</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm font-semibold text-slate-900">HĐ CSSK đã ký</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year1.metrics.careContractsSigned} ({ (comparisonData.year1.metrics.careContractsSigned / schools.length * 100).toFixed(1) }%)</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year2.metrics.careContractsSigned} ({ (comparisonData.year2.metrics.careContractsSigned / schools.length * 100).toFixed(1) }%)</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm font-semibold text-slate-900">KSK đã hoàn thành</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year1.metrics.checkContractsCompleted} ({ (comparisonData.year1.metrics.checkContractsCompleted / schools.length * 100).toFixed(1) }%)</td>
                                    <td className="px-5 py-4 border-b border-slate-200 bg-white text-sm text-center text-slate-900">{comparisonData.year2.metrics.checkContractsCompleted} ({ (comparisonData.year2.metrics.checkContractsCompleted / schools.length * 100).toFixed(1) }%)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;