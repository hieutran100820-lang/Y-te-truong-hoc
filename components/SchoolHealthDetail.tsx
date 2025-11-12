// Fix: Moved the correct SchoolHealthDetail component here from App.tsx.
import React, { useState, useEffect } from 'react';
import { School, SchoolYear, HealthRecord, DynamicField } from '../types';

interface SchoolHealthDetailProps {
  school: School;
  selectedYear: SchoolYear;
  dynamicFields: DynamicField[];
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
}

const DetailItem: React.FC<{
  label: string;
  value: string | number | boolean;
  isEditing: boolean;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'select' | 'checkbox' | 'droplist';
  options?: string[];
  name: string;
}> = ({ label, value, isEditing, onChange, type = 'text', options, name }) => {
  const renderValue = () => {
    if (type === 'checkbox') {
      return value ? <span className="text-green-600 font-semibold">Có</span> : <span className="text-red-600 font-semibold">Không</span>;
    }
    if (typeof value === 'number' && type !== 'text') {
        return value.toLocaleString('vi-VN');
    }
    if (value === undefined || value === null || value === '') return <span className="text-gray-400">N/A</span>
    return String(value);
  };

  const renderInput = () => {
    switch (type) {
      case 'checkbox':
        return <input type="checkbox" name={name} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 text-brand-blue rounded focus:ring-brand-blue" />;
      case 'number':
        return <input type="number" name={name} value={value as number} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />;
      case 'select':
      case 'droplist':
        return (
          <select name={name} value={value as string} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm">
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return <input type="text" name={name} value={value as string} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />;
    }
  };

  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium text-gray-500 flex items-center">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {isEditing ? renderInput() : renderValue()}
      </dd>
    </div>
  );
};


const SchoolHealthDetail: React.FC<SchoolHealthDetailProps> = ({ school, selectedYear, dynamicFields, healthRecords, setHealthRecords }) => {
    const [record, setRecord] = useState<HealthRecord | null>(null);
    const [originalRecord, setOriginalRecord] = useState<HealthRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const foundRecord = healthRecords.find(r => r.schoolId === school.id && r.schoolYearId === selectedYear.id);
        const newRecord: HealthRecord = foundRecord 
            ? JSON.parse(JSON.stringify(foundRecord))
            : {
                schoolId: school.id,
                schoolYearId: selectedYear.id,
                dynamicData: {}
            };
        if (!newRecord.dynamicData) {
          newRecord.dynamicData = {};
        }
        setRecord(newRecord);
        setOriginalRecord(JSON.parse(JSON.stringify(newRecord))); // Keep a backup for cancel
        setIsEditing(false);
        setActiveTab('overview');
    }, [school, selectedYear, healthRecords]);

    const handleInputChange = (fieldName: string, value: any) => {
        setRecord(prev => {
            if (!prev) return null;
            const newRecord = JSON.parse(JSON.stringify(prev)); // Deep copy to handle nested state
            if (!newRecord.dynamicData) {
                newRecord.dynamicData = {};
            }
            newRecord.dynamicData[fieldName] = value;
            return newRecord;
        });
    };

    const handleSave = () => {
        if (record) {
            const recordIndex = healthRecords.findIndex(r => r.schoolId === record.schoolId && r.schoolYearId === record.schoolYearId);
            let updatedRecords;
            if (recordIndex > -1) {
                updatedRecords = [...healthRecords];
                updatedRecords[recordIndex] = record;
            } else {
                updatedRecords = [...healthRecords, record];
            }
            setHealthRecords(updatedRecords);
            alert('Đã lưu thông tin thành công!');
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setRecord(originalRecord);
        setIsEditing(false);
    }
    
    if (!record) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const TABS: { [key: string]: string } = {
        overview: 'Tổng quan',
        staff: 'Nhân viên Y tế',
        careContract: 'Hợp đồng CSSK',
        checkContract: 'Hợp đồng KSK',
        checklist: 'Hoạt động (Checklist)'
    };
    
    const TabButton: React.FC<{tabKey: string, label: string}> = ({tabKey, label}) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none whitespace-nowrap ${
                activeTab === tabKey
                ? 'border-b-2 border-brand-blue text-brand-blue font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const renderDynamicFieldsForCurrentTab = () => {
      const fieldsForTab = dynamicFields.filter(f => f.tab === activeTab);
      if (fieldsForTab.length === 0) return (
        <div className="py-4 text-center text-gray-500">
            Không có trường thông tin nào được cấu hình cho tab này.
        </div>
      );

      const getDefaultValue = (type: DynamicField['type']) => {
        switch (type) {
            case 'checkbox': return false;
            case 'number': return 0;
            case 'select':
            case 'droplist':
                 return '';
            default: return '';
        }
      }

      return (
        <dl>
            {fieldsForTab.map(field => (
                <DetailItem
                    key={field.id}
                    label={field.label}
                    value={record.dynamicData?.[field.name] ?? getDefaultValue(field.type)}
                    isEditing={isEditing}
                    onChange={(val) => handleInputChange(field.name, val)}
                    type={field.type}
                    options={field.options}
                    name={field.name}
                />
            ))}
        </dl>
      );
    }

    return (
        <div className="bg-white rounded-lg shadow-md animate-fade-in">
            <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{school.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Năm học: {selectedYear.year}</p>
                    </div>
                     {!selectedYear.isLocked && (
                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                             {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Lưu</button>
                                    <button onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition-colors duration-300">Hủy</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300">Chỉnh sửa</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="flex space-x-1 sm:space-x-4 px-6 -mb-px overflow-x-auto">
                     {Object.entries(TABS).map(([key, label]) => (
                        <TabButton key={key} tabKey={key} label={label} />
                     ))}
                </nav>
            </div>

            <div className="p-6">
               {renderDynamicFieldsForCurrentTab()}
            </div>
        </div>
    );
};

export default SchoolHealthDetail;