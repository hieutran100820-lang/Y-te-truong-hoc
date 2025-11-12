
import React, { useState } from 'react';
import { UserIcon, LockClosedIcon } from '../components/icons';

interface LoginPageProps {
  onLogin: (user: string, pass: string) => void;
}

const HealthIllustration = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative w-60 h-60" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-25deg) rotateX(15deg)' }}>
            {/* Base */}
            <div className="absolute w-full h-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" style={{ transform: 'translateZ(-40px)' }}></div>

            {/* Cross */}
            <div className="absolute top-1/2 left-1/2 w-24 h-8 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/90 shadow-2xl shadow-white/20" style={{ transform: 'translateZ(0px) translateX(-50%) translateY(-50%)' }}></div>
            <div className="absolute top-1/2 left-1/2 w-8 h-24 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/90 shadow-2xl shadow-white/20" style={{ transform: 'translateZ(0px) translateX(-50%) translateY(-50%)' }}></div>
            
             {/* Floating elements */}
            <div className="absolute top-12 left-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/20" style={{ transform: 'translateZ(60px)' }}></div>
            <div className="absolute bottom-10 right-5 w-16 h-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10" style={{ transform: 'translateZ(30px)' }}></div>
        </div>
    </div>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      onLogin(username, password);
    } catch (err: any) {
       setError(err.message);
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Branding Column */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-cyan-600 to-blue-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="z-10">
            <h1 className="font-bold text-4xl tracking-tight">Hệ thống Quản lý Y tế Học đường</h1>
            <p className="mt-4 text-lg text-blue-100 opacity-80">
                Nền tảng toàn diện giúp theo dõi, quản lý, và báo cáo sức khỏe học sinh một cách hiệu quả và chính xác.
            </p>
        </div>
        <div className="z-10 w-full h-1/2 flex items-center justify-center">
           <HealthIllustration />
        </div>
        <div className="z-10 text-center text-blue-200 text-sm opacity-70">
            © 2025. All Rights Reserved.
        </div>
      </div>
      
      {/* Right Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl animate-fade-in space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                    Đăng nhập hệ thống
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Chào mừng bạn đã quay trở lại!
                </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4 rounded-md">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                           <UserIcon className="h-5 w-5" />
                        </span>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-100 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white sm:text-sm transition-all"
                            placeholder="Tài khoản"
                        />
                    </div>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                           <LockClosedIcon className="h-5 w-5" />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-100 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white sm:text-sm transition-all"
                            placeholder="Mật khẩu"
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800">Ghi nhớ đăng nhập</label>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-0.5 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                         {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : (
                           'Đăng nhập'
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
