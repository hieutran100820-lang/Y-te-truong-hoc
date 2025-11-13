// Fix: Moved the correct App component here from constants.ts.
import React, { useState, useEffect } from 'react';
import { SchoolYear, DynamicField, User, School, HealthRecord } from './types';
import { 
    INITIAL_SCHOOL_YEARS, 
    INITIAL_DYNAMIC_FIELDS, 
    INITIAL_USERS,
    INITIAL_SCHOOLS,
    INITIAL_HEALTH_RECORDS
} from './constants';
import { HomeIcon, SchoolIcon, ChartBarIcon, UsersIcon, CogIcon, LogoutIcon } from './components/icons';
import DashboardPage from './pages/DashboardPage';
import SchoolsPage from './pages/SchoolsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { database } from './firebaseConfig';
import { ref, onValue, set, get } from "firebase/database";


type Page = 'dashboard' | 'schools' | 'reports' | 'users' | 'settings';

const Notification: React.FC<{ message: string; onClose: () => void; }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg animate-slide-in-down flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-green-100 font-bold text-xl leading-none">&times;</button>
       <style>{`
        @keyframes slide-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-down {
          animation: slide-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <li 
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
            isActive 
            ? 'bg-slate-700 text-white' 
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
    <header className="bg-slate-100/80 backdrop-blur-sm border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Y tế Học đường</h1>
        <div className="flex items-center">
            <label htmlFor="school-year" className="mr-2 font-semibold text-slate-600">Năm học:</label>
            <select
                id="school-year"
                value={selectedYear?.id}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
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
    const [selectedYear, setSelectedYear] = useState<SchoolYear | undefined>();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Centralized state management
    const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => {
            setNotification(null);
        }, 3000); // Hide after 3 seconds
    };

    // Function to seed initial data if database is empty
    const seedDatabase = () => {
        const initialData = {
            schoolYears: INITIAL_SCHOOL_YEARS,
            dynamicFields: INITIAL_DYNAMIC_FIELDS,
            schools: INITIAL_SCHOOLS,
            users: INITIAL_USERS,
            healthRecords: INITIAL_HEALTH_RECORDS,
        };
        set(ref(database), initialData)
            .then(() => showNotification("Dữ liệu đã được reset thành công!"))
            .catch((error) => showNotification(`Lỗi khi reset dữ liệu: ${error.message}`));
    };

    // Effect to load all data from Firebase and listen for real-time updates
    useEffect(() => {
        const dbRef = ref(database);
        
        const unsubscribe = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setSchoolYears(data.schoolYears || []);
                setDynamicFields(data.dynamicFields || []);
                setSchools(data.schools || []);
                setUsers(data.users || []);
                setHealthRecords(data.healthRecords || []);
            } else {
                console.log("No data available in Firebase. Seeding with initial data.");
                seedDatabase();
            }
            setIsDataLoaded(true);
        }, (error) => {
            console.error("Firebase read failed:", error);
            // Fallback for initial load if DB is empty and offline
            if (!isDataLoaded) {
                 seedDatabase();
            }
        });
        
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);
    
    // Effect to set the selected year
    useEffect(() => {
        if(schoolYears.length > 0) {
            const currentYear = schoolYears.find(sy => sy.isCurrent) || schoolYears[0];
            setSelectedYear(currentYear);
        }
    }, [schoolYears]);

    const handleLogin = (user: string, pass: string) => {
        // Find user from the state, not the constant
        const foundUser = users.find(u => u.username === user && u.password === pass);
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

    const handleYearChange = (yearId: number) => {
        const year = schoolYears.find(sy => sy.id === yearId);
        setSelectedYear(year);
    };

    // --- Data Update Functions ---
    // These functions now write to Firebase instead of just updating local state.
    // The onValue listener will then update the local state for all connected clients.
    const updateSchools = (updatedSchools: School[]) => {
        set(ref(database, 'schools'), updatedSchools);
    };
    const updateUsers = (updatedUsers: User[]) => {
        set(ref(database, 'users'), updatedUsers);
    };
    const updateHealthRecords = (updatedRecords: HealthRecord[]) => {
        set(ref(database, 'healthRecords'), updatedRecords);
    };
    const updateSchoolYears = (updatedYears: SchoolYear[]) => {
        set(ref(database, 'schoolYears'), updatedYears);
    };
    const updateDynamicFields = (updatedFields: DynamicField[]) => {
        set(ref(database, 'dynamicFields'), updatedFields);
    };


    const renderPage = () => {
        if (!selectedYear || !currentUser || !isDataLoaded) return <div className="p-8">Đang tải dữ liệu từ cloud...</div>;

        switch (currentPage) {
            case 'dashboard': return <DashboardPage selectedYear={selectedYear} currentUser={currentUser} schools={schools} healthRecords={healthRecords} dynamicFields={dynamicFields} />;
            case 'schools': return <SchoolsPage selectedYear={selectedYear} dynamicFields={dynamicFields} currentUser={currentUser} schools={schools} setSchools={updateSchools} healthRecords={healthRecords} setHealthRecords={updateHealthRecords} showNotification={showNotification} />;
            case 'reports': return <ReportsPage schoolYears={schoolYears} dynamicFields={dynamicFields} currentUser={currentUser} schools={schools} healthRecords={healthRecords} />;
            case 'users': return currentUser.role === 'admin' ? <UsersPage users={users} setUsers={updateUsers} schools={schools} showNotification={showNotification} /> : <DashboardPage selectedYear={selectedYear} currentUser={currentUser} schools={schools} healthRecords={healthRecords} dynamicFields={dynamicFields} />;
            case 'settings': return currentUser.role === 'admin' ? <SettingsPage schoolYears={schoolYears} setSchoolYears={updateSchoolYears} dynamicFields={dynamicFields} setDynamicFields={updateDynamicFields} healthRecords={healthRecords} setHealthRecords={updateHealthRecords} seedDatabase={seedDatabase} showNotification={showNotification} /> : <DashboardPage selectedYear={selectedYear} currentUser={currentUser} schools={schools} healthRecords={healthRecords} dynamicFields={dynamicFields} />;
            default: return <DashboardPage selectedYear={selectedYear} currentUser={currentUser} schools={schools} healthRecords={healthRecords} dynamicFields={dynamicFields} />;
        }
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <>
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
            <div className="flex h-screen bg-slate-100">
                <aside className="w-64 bg-slate-800 flex flex-col">
                    <div className="p-6 text-center border-b border-slate-700">
                         <h2 className="text-xl font-bold text-white">Admin Portal</h2>
                         <p className="text-sm text-slate-400 mt-1">Xin chào, {currentUser.name}</p>
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
                            <hr className="my-2 border-slate-700" />
                            <NavItem label="Đăng xuất" icon={<LogoutIcon className="w-6 h-6" />} isActive={false} onClick={handleLogout} />
                        </div>
                    </nav>
                </aside>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header selectedYear={selectedYear} onYearChange={handleYearChange} schoolYears={schoolYears} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        {renderPage()}
                    </main>
                </div>
            </div>
        </>
    );
}

export default App;