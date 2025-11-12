// Fix: Moved the correct SchoolHealthDetail component here from App.tsx.
import React, { useState, useEffect, useRef } from 'react';
import { School, SchoolYear, HealthRecord, DynamicField, FileAttachment } from '../types';
import { PaperclipIcon, TrashIcon } from './icons';

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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fieldToAttach, setFieldToAttach] = useState<string | null>(null);

    useEffect(() => {
        const foundRecord = healthRecords.find(r => r.schoolId === school.id && r.schoolYearId === selectedYear.id);
        const newRecord: HealthRecord = foundRecord 
            ? JSON.parse(JSON.stringify(foundRecord))
            : {
                schoolId: school.id,
                schoolYearId: selectedYear.id,
                dynamicData: {},
                attachments: []
            };
        if (!newRecord.dynamicData) newRecord.dynamicData = {};
        if (!newRecord.attachments) newRecord.attachments = [];
        setRecord(newRecord);
        setOriginalRecord(JSON.parse(JSON.stringify(newRecord)));
        setIsEditing(false);
        setActiveTab('overview');
    }, [school, selectedYear, healthRecords]);

    const handleInputChange = (fieldName: string, value: any) => {
        setRecord(prev => {
            if (!prev) return null;
            const newRecord = JSON.parse(JSON.stringify(prev));
            if (!newRecord.dynamicData) newRecord.dynamicData = {};
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

    const handleAttachClick = (fieldName: string) => {
        setFieldToAttach(fieldName);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && fieldToAttach) {
            // In a real app, you would upload the file to a storage service
            // and get a URL. Here we read it as a data URL for client-side download.
            const reader = new FileReader();
            const fieldNameForAttachment = fieldToAttach;

            reader.onload = (e) => {
                const fileData = e.target?.result as string;
                const newAttachment: FileAttachment = {
                    id: Date.now().toString(),
                    fileName: file.name,
                    fileData: fileData,
                    fieldName: fieldNameForAttachment,
                };

                setRecord(prev => {
                    if (!prev) return null;
                    const updatedAttachments = [...(prev.attachments || []), newAttachment];
                    return { ...prev, attachments: updatedAttachments };
                });
            };

            reader.readAsDataURL(file);
        }
        // Reset the input value to allow selecting the same file again
        if (event.target) event.target.value = '';
        setFieldToAttach(null);
    };

    const handleRemoveAttachment = (attachmentId: string) => {
        setRecord(prev => {
            if (!prev) return null;
            const updatedAttachments = (prev.attachments || []).filter(att => att.id !== attachmentId);
            return { ...prev, attachments: updatedAttachments };
        });
    };
    
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
      if (fieldsForTab.length === 0 && !['careContract', 'checkContract'].includes(activeTab)) {
        return (
            <div className="py-4 text-center text-gray-500">
                Không có trường thông tin nào được cấu hình cho tab này.
            </div>
        );
      }

      const getDefaultValue = (type: DynamicField['type']) => {
        switch (type) {
            case 'checkbox': return false;
            case 'number': return 0;
            case 'select':
            case 'droplist': return '';
            default: return '';
        }
      }

      const contractFieldName = `${activeTab}_contract_file`;
      const contractAttachment = record.attachments?.find(att => att.fieldName === contractFieldName);

      return (
        <>
            <dl>
                {fieldsForTab.map(field => {
                    const attachment = record.attachments?.find(att => att.fieldName === field.name);
                    return (
                        <div key={field.id} className="border-b last:border-b-0">
                            <DetailItem
                                label={field.label}
                                value={record.dynamicData?.[field.name] ?? getDefaultValue(field.type)}
                                isEditing={isEditing}
                                onChange={(val) => handleInputChange(field.name, val)}
                                type={field.type}
                                options={field.options}
                                name={field.name}
                            />
                            {activeTab === 'checklist' && (
                                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt className="text-sm font-medium text-gray-400">Tệp đính kèm</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {attachment ? (
                                            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                                <a href={attachment.fileData} download={attachment.fileName} className="flex items-center text-blue-600 hover:underline truncate">
                                                    <PaperclipIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span className="truncate">{attachment.fileName}</span>
                                                </a>
                                                {isEditing && (
                                                    <button onClick={() => handleRemoveAttachment(attachment.id)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            isEditing ? (
                                                <button onClick={() => handleAttachClick(field.name)} className="flex items-center text-sm text-brand-blue hover:text-brand-blue-dark font-medium py-1 px-2 rounded-md border-2 border-dashed border-gray-300 hover:border-brand-blue transition-colors">
                                                    <PaperclipIcon className="w-4 h-4 mr-2"/>
                                                    Đính kèm tệp
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">Chưa có</span>
                                            )
                                        )}
                                    </dd>
                                </div>
                            )}
                        </div>
                    )
                })}
            </dl>
            
            {(activeTab === 'careContract' || activeTab === 'checkContract') && (
                <div className="mt-4 pt-4 border-t">
                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-500">Đính kèm Hợp đồng</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {contractAttachment ? (
                                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                    <a href={contractAttachment.fileData} download={contractAttachment.fileName} className="flex items-center text-blue-600 hover:underline truncate">
                                        <PaperclipIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{contractAttachment.fileName}</span>
                                    </a>
                                    {isEditing && (
                                        <button onClick={() => handleRemoveAttachment(contractAttachment.id)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                isEditing ? (
                                    <button onClick={() => handleAttachClick(contractFieldName)} className="flex items-center text-sm text-brand-blue hover:text-brand-blue-dark font-medium py-1 px-2 rounded-md border-2 border-dashed border-gray-300 hover:border-brand-blue transition-colors">
                                        <PaperclipIcon className="w-4 h-4 mr-2"/>
                                        Đính kèm tệp
                                    </button>
                                ) : (
                                    <span className="text-gray-400">Chưa có</span>
                                )
                            )}
                        </dd>
                    </div>
                </div>
            )}
        </>
      );
    }

    return (
        <div className="bg-white rounded-lg shadow-md animate-fade-in">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
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