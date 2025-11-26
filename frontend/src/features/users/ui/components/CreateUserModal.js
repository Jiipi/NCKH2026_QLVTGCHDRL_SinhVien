import React, { useState, useEffect } from 'react';
import { UserPlus, Save, X } from 'lucide-react';
import usersApi from '../services/usersApi';

const FormField = ({ label, value, name, onChange, placeholder, type = 'text', options = [] }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'select' ? (
            <select name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        ) : (
            <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md" />
        )}
    </div>
);

export default function CreateUserModal({ isOpen, onClose, onSaveSuccess }) {
    const [newUser, setNewUser] = useState({});
    const [activeRoleTab, setActiveRoleTab] = useState('Admin');
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setNewUser({ role: 'Admin' });
            setActiveRoleTab('Admin');
            setError('');

            // Fetch classes needed for student/monitor roles
            const fetchClasses = async () => {
                const result = await usersApi.getClasses();
                if (result.success) setClasses(result.data);
            };
            fetchClasses();
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleTabChange = (role) => {
        setActiveRoleTab(role);
        setNewUser(prev => ({ ...prev, role }));
    };

    const handleSave = async () => {
        setError('');
        // Basic Validation
        if (!newUser.ten_dn || !newUser.ho_ten || !newUser.email || !newUser.mat_khau) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
            return;
        }
        const result = await usersApi.createUser(newUser);
        if (result.success) {
            onSaveSuccess();
            onClose();
        } else {
            setError(result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus size={24}/> Tạo người dùng mới</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                        {['Admin', 'Giảng viên', 'Lớp trưởng', 'Sinh viên'].map(role => (
                            <button key={role} onClick={() => handleRoleTabChange(role)} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeRoleTab === role ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                {role}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Tên đăng nhập *" name="ten_dn" value={newUser.ten_dn} onChange={handleInputChange} />
                        <FormField label="Họ tên *" name="ho_ten" value={newUser.ho_ten} onChange={handleInputChange} />
                        <FormField label="Email *" name="email" value={newUser.email} onChange={handleInputChange} type="email" />
                        <FormField label="Mật khẩu *" name="mat_khau" value={newUser.mat_khau} onChange={handleInputChange} type="password" />
                        
                        {(activeRoleTab === 'Sinh viên' || activeRoleTab === 'Lớp trưởng') && (
                            <>
                                <FormField label="MSSV *" name="mssv" value={newUser.mssv} onChange={handleInputChange} />
                                <FormField label="Lớp *" name="lop_id" value={newUser.lop_id} onChange={handleInputChange} type="select" options={[{value: '', label: 'Chọn lớp'}, ...classes.map(c => ({ value: c.id, label: `${c.ten_lop} - ${c.khoa}` }))]} />
                                <FormField label="Ngày sinh" name="ngay_sinh" value={newUser.ngay_sinh} onChange={handleInputChange} type="date" />
                                <FormField label="Giới tính" name="gt" value={newUser.gt} onChange={handleInputChange} type="select" options={[{value: '', label: 'Chọn giới tính'}, {value: 'nam', label: 'Nam'}, {value: 'nu', label: 'Nữ'}]} />
                            </>
                        )}
                    </div>
                    {error && <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}
                </div>

                <div className="flex justify-end gap-3 p-4 border-t mt-auto">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"><Save size={16}/>Lưu</button>
                </div>
            </div>
        </div>
    );
}

