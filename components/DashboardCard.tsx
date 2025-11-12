
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
        <div className="bg-brand-blue-light text-brand-blue p-3 rounded-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
