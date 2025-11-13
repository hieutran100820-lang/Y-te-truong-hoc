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
  showNotification: (message: string) => void;
}

const DetailItem: React.FC<{
  label: string;
  value: string | number | boolean;
  isEditing: boolean;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'select' | 'checkbox' | 'droplist';
  options?: string[];
  name: string;
  isIncomplete: boolean;
}> = ({ label, value, isEditing, onChange, type = 'text', options, name, isIncomplete }) => {
  const renderValue = () => {
    if (type === 'checkbox') {
      return value ? <span className="text-green-600 font-semibold">Có</span> : <span className="text-red-600 font-semibold">Không</span>;
    }
    if (typeof value === 'number' && type !== 'text') {
        return value.toLocaleString('vi-VN');
    }
    if (value === undefined || value === null || value === '') return <span className="text-slate-400 italic">Chưa có</span>
    return String(value);
  };

  const renderInput = () => {
    const commonClasses = "mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm text-slate-900 focus:outline-none sm:text-sm";
    const incompleteClasses = isIncomplete ? "border-red-400 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-brand focus:border-brand";

    switch (type) {
      case 'checkbox':
        return <input type="checkbox" name={name} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 text-brand rounded focus:ring-brand" />;
      case 'number':
        return <input type="number" name={name} value={value as number} onChange={(e) => onChange(Number(e.target.value))} className={`${commonClasses} ${incompleteClasses}`} />;
      case 'select':
      case 'droplist':
        return (
          <select name={name} value={value as string} onChange={(e) => onChange(e.target.value)} className={`mt-1 block w-full pl-3 pr-10 py-2 bg-white border rounded-md shadow-sm text-slate-900 focus:outline-none sm:text-sm ${incompleteClasses}`}>
            <option value="">-- Chọn --</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return <input type="text" name={name} value={value as string} onChange={(e) => onChange(e.target.value)} className={`${commonClasses} ${incompleteClasses}`} />;
    }
  };

  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className={`text-sm font-medium flex items-center transition-colors ${isEditing && isIncomplete ? 'text-red-600' : 'text-slate-500'}`}>{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
        {isEditing ? renderInput() : renderValue()}
      </dd>
    </div>
  );
};


const SchoolHealthDetail: React.FC<SchoolHealthDetailProps> = ({ school, selectedYear, dynamicFields, healthRecords, setHealthRecords, showNotification }) => {
    const [record, setRecord] = useState<HealthRecord | null>(null);
    const [originalRecord, setOriginalRecord] = useState<HealthRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [completionStatus, setCompletionStatus] = useState<{ incompleteFieldNames: string[], incompleteTabs: string[] }>({ incompleteFieldNames: [], incompleteTabs: [] });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fieldToAttach, setFieldToAttach] = useState<string | null>(null);

    const calculateCompletionStatus = (record: HealthRecord | null, dynamicFields: DynamicField[]) => {
        if (!record) return { incompleteFieldNames: [], incompleteTabs: [] };
        
        const incompleteFieldNames: string[] = [];
        const incompleteTabs = new Set<string>();
        const isEmpty = (value: any) => value === undefined || value === null || value === '';

        dynamicFields.forEach(field => {
            const value = record.dynamicData?.[field.name];
            let isComplete = true;

            if (field.tab === 'checklist') {
                const hasAttachment = record.attachments?.some(a => a.fieldName === field.name);
                if (value !== true || !hasAttachment) {
                    isComplete = false;
                }
            } else {
                 if (field.name === 'student_count') {
                    // For student_count, 0 is also considered incomplete.
                    if (isEmpty(value) || value === 0) {
                        isComplete = false;
                    }
                } else {
                    if (isEmpty(value)) {
                        isComplete = false;
                    }
                }
            }
            
            if (!isComplete) {
                incompleteFieldNames.push(field.name);
                incompleteTabs.add(field.tab);
            }
        });

        const careContractAttachment = record.attachments?.find(att => att.fieldName === 'careContract_contract_file');
        if (!careContractAttachment) {
            incompleteFieldNames.push('careContract_contract_file');
            incompleteTabs.add('careContract');
        }

        const checkContractAttachment = record.attachments?.find(att => att.fieldName === 'checkContract_contract_file');
        if (!checkContractAttachment) {
            incompleteFieldNames.push('checkContract_contract_file');
            incompleteTabs.add('checkContract');
        }

        return {
            incompleteFieldNames,
            incompleteTabs: Array.from(incompleteTabs),
        };
    };

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
        
        const status = calculateCompletionStatus(newRecord, dynamicFields);
        setCompletionStatus(status);

        setIsEditing(false);
        setActiveTab('overview');
    }, [school, selectedYear, healthRecords, dynamicFields]);

    const updateRecordAndStatus = (updatedRecord: HealthRecord) => {
        setRecord(updatedRecord);
        const status = calculateCompletionStatus(updatedRecord, dynamicFields);
        setCompletionStatus(status);
    };

    const handleInputChange = (fieldName: string, value: any) => {
        if (!record) return;
        const newRecord = JSON.parse(JSON.stringify(record));
        if (!newRecord.dynamicData) newRecord.dynamicData = {};
        newRecord.dynamicData[fieldName] = value;
        updateRecordAndStatus(newRecord);
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
            showNotification('Đã lưu thông tin thành công!');
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setRecord(originalRecord);
        const status = calculateCompletionStatus(originalRecord, dynamicFields);
        setCompletionStatus(status);
        setIsEditing(false);
    }

    const handleAttachClick = (fieldName: string) => {
        setFieldToAttach(fieldName);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && fieldToAttach && record) {
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
                const updatedAttachments = [...(record.attachments || []), newAttachment];
                updateRecordAndStatus({ ...record, attachments: updatedAttachments });
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
        setFieldToAttach(null);
    };

    const handleRemoveAttachment = (attachmentId: string) => {
        if (!record) return;
        const updatedAttachments = (record.attachments || []).filter(att => att.id !== attachmentId);
        updateRecordAndStatus({ ...record, attachments: updatedAttachments });
    };
    
    if (!record) {
        return (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500">Đang tải dữ liệu...</p>
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
    
    const TabButton: React.FC<{tabKey: string, label: string, isIncomplete: boolean}> = ({tabKey, label, isIncomplete}) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`relative px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none whitespace-nowrap ${
                activeTab === tabKey
                ? 'border-b-2 border-brand text-brand font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            {label}
            {isIncomplete && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400" title="Tab này có thông tin chưa hoàn thiện"></span>}
        </button>
    );

    const renderDynamicFieldsForCurrentTab = () => {
      const fieldsForTab = dynamicFields.filter(f => f.tab === activeTab);
      if (fieldsForTab.length === 0 && !['careContract', 'checkContract'].includes(activeTab)) {
        return (
            <div className="py-4 text-center text-slate-500">
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
      const isContractFileIncomplete = completionStatus.incompleteFieldNames.includes(contractFieldName);

      return (
        <>
            <dl>
                {fieldsForTab.map(field => {
                    const attachment = record.attachments?.find(att => att.fieldName === field.name);
                    const isFieldIncomplete = completionStatus.incompleteFieldNames.includes(field.name);
                    return (
                        <div key={field.id} className="border-b border-slate-200 last:border-b-0">
                            <DetailItem
                                label={field.label}
                                value={record.dynamicData?.[field.name] ?? getDefaultValue(field.type)}
                                isEditing={isEditing}
                                onChange={(val) => handleInputChange(field.name, val)}
                                type={field.type}
                                options={field.options}
                                name={field.name}
                                isIncomplete={isFieldIncomplete}
                            />
                            {activeTab === 'checklist' && (
                                <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt className={`text-sm font-medium transition-colors ${isEditing && isFieldIncomplete ? 'text-red-600' : 'text-slate-400'}`}>Tệp đính kèm (bắt buộc)</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                                        {attachment ? (
                                            <div className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
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
                                                <button onClick={() => handleAttachClick(field.name)} className={`flex items-center text-sm font-medium py-1 px-2 rounded-md border-2 border-dashed transition-colors ${isFieldIncomplete ? 'border-red-400 text-red-600 hover:border-red-500' : 'border-slate-300 text-brand hover:text-brand-dark hover:border-brand'}`}>
                                                    <PaperclipIcon className="w-4 h-4 mr-2"/>
                                                    Đính kèm tệp
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 italic">Chưa có</span>
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
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className={`text-sm font-medium transition-colors ${isEditing && isContractFileIncomplete ? 'text-red-600' : 'text-slate-500'}`}>Đính kèm Hợp đồng</dt>
                        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                            {contractAttachment ? (
                                <div className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
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
                                     <button onClick={() => handleAttachClick(contractFieldName)} className={`flex items-center text-sm font-medium py-1 px-2 rounded-md border-2 border-dashed transition-colors ${isContractFileIncomplete ? 'border-red-400 text-red-600 hover:border-red-500' : 'border-slate-300 text-brand hover:text-brand-dark hover:border-brand'}`}>
                                        <PaperclipIcon className="w-4 h-4 mr-2"/>
                                        Đính kèm tệp
                                    </button>
                                ) : (
                                    <span className="text-slate-400 italic">Chưa có</span>
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 animate-fade-in">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{school.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">Năm học: {selectedYear.year}</p>
                    </div>
                     {!selectedYear.isLocked && (
                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                             {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Lưu</button>
                                    <button onClick={handleCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded transition-colors duration-300">Hủy</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-4 rounded transition-colors duration-300">Chỉnh sửa</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {!isEditing && completionStatus.incompleteFieldNames.length > 0 && (
                <div className="p-4 m-6 mb-0 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-bold">Cảnh báo:</span> Còn {completionStatus.incompleteFieldNames.length} trường thông tin chưa hoàn thiện. Vui lòng nhấn "Chỉnh sửa" để cập nhật.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-b border-slate-200">
                <nav className="flex space-x-1 sm:space-x-4 px-6 -mb-px overflow-x-auto">
                     {Object.entries(TABS).map(([key, label]) => (
                        <TabButton key={key} tabKey={key} label={label} isIncomplete={!isEditing && completionStatus.incompleteTabs.includes(key)} />
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