// Fix: Moved the correct App component here from constants.ts.
import React, { useState, useEffect } from 'react';
import { SchoolYear, DynamicField, User } from './types';
import { SCHOOL_YEARS as initialSchoolYears, DEFAULT_DYNAMIC_FIELDS, USERS } from './constants';
import { HomeIcon, SchoolIcon, ChartBarIcon, UsersIcon, CogIcon, LogoutIcon } from './components/icons';
import DashboardPage from './pages/DashboardPage';
import SchoolsPage from './pages/SchoolsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

type Page = 'dashboard' | 'schools' | 'reports' | 'users' | 'settings';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <li 
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
            isActive 
            ? 'bg-brand-blue text-white shadow-md' 
            : 'text-gray-600 hover:bg-brand-blue-light hover:text-brand-blue-dark'
        }`}
    >
        {icon}
        <span className="ml-4 font-medium">{label}</span>
    </li>
);

const Header: React.FC<{
    selectedYear: SchoolYear | undefined;
    onYearChange: (id: number) => void;
    schoolYears: SchoolYear[];
}> = ({ selectedYear, onYearChange, schoolYears }) => (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-brand-blue-dark">Quản lý Y tế Học đường</h1>
        <div className="flex items-center">
            <label htmlFor="school-year" className="mr-2 font-semibold text-gray-600">Năm học:</label>
            <select
                id="school-year"
                value={selectedYear?.id}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block w-full p-2.5"
            >
                {schoolYears.map((sy) => (
                    <option key={sy.id} value={sy.id}>{sy.year} {sy.isCurrent && '(Hiện tại)'}</option>
                ))}
            </select>
        </div>
    </header>
);

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [schoolYears, setSchoolYears] = useState<SchoolYear[]>(initialSchoolYears);
    const [selectedYear, setSelectedYear] = useState<SchoolYear | undefined>();
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(DEFAULT_DYNAMIC_FIELDS);

    const handleLogin = (user: string, pass: string) => {
        const foundUser = USERS.find(u => u.username === user && u.password === pass);
        if (foundUser) {
            setCurrentUser(foundUser);
        } else {
            throw new Error('Tài khoản hoặc mật khẩu không đúng.');
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentPage('dashboard');
    };

    useEffect(() => {
        const currentYear = schoolYears.find(sy => sy.isCurrent);
        setSelectedYear(currentYear);
    }, [schoolYears]);

    const handleYearChange = (yearId: number) => {
        const year = schoolYears.find(sy => sy.id === yearId);
        setSelectedYear(year);
    };

    const renderPage = () => {
        if (!selectedYear || !currentUser) return <div className="p-8">Đang tải...</div>;

        switch (currentPage) {
            case 'dashboard': return <DashboardPage selectedYear={selectedYear} currentUser={currentUser} />;
            case 'schools': return <SchoolsPage selectedYear={selectedYear} dynamicFields={dynamicFields} currentUser={currentUser} />;
            case 'reports': return <ReportsPage schoolYears={schoolYears} dynamicFields={dynamicFields} currentUser={currentUser} />;
            case 'users': return currentUser.role === 'admin' ? <UsersPage /> : <DashboardPage selectedYear={selectedYear} currentUser={currentUser} />;
            case 'settings': return currentUser.role === 'admin' ? <SettingsPage schoolYears={schoolYears} setSchoolYears={setSchoolYears} dynamicFields={dynamicFields} setDynamicFields={setDynamicFields} /> : <DashboardPage selectedYear={selectedYear} currentUser={currentUser} />;
            default: return <DashboardPage selectedYear={selectedYear} currentUser={currentUser} />;
        }
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-brand-gray-light">
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 text-center border-b">
                     <h2 className="text-xl font-bold text-brand-blue-dark">Admin Portal</h2>
                     <p className="text-sm text-gray-500 mt-1">Xin chào, {currentUser.name}</p>
                </div>
                <nav className="flex-grow p-4 flex flex-col justify-between">
                    <ul>
                        <NavItem label="Dashboard" icon={<HomeIcon className="w-6 h-6" />} isActive={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
                        <NavItem label="Quản lý Trường học" icon={<SchoolIcon className="w-6 h-6" />} isActive={currentPage === 'schools'} onClick={() => setCurrentPage('schools')} />
                        <NavItem label="Báo cáo & Thống kê" icon={<ChartBarIcon className="w-6 h-6" />} isActive={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
                        {currentUser.role === 'admin' && (
                            <>
                                <NavItem label="Quản lý Người dùng" icon={<UsersIcon className="w-6 h-6" />} isActive={currentPage === 'users'} onClick={() => setCurrentPage('users')} />
                                <NavItem label="Cấu hình Hệ thống" icon={<CogIcon className="w-6 h-6" />} isActive={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
                            </>
                        )}
                    </ul>
                     <div>
                        <hr className="my-2 border-gray-200" />
                        <NavItem label="Đăng xuất" icon={<LogoutIcon className="w-6 h-6" />} isActive={false} onClick={handleLogout} />
                    </div>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header selectedYear={selectedYear} onYearChange={handleYearChange} schoolYears={schoolYears} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;