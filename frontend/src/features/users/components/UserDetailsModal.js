import React, { useState, useEffect } from 'react';
import { User, Settings, Award, Edit, Save, X } from 'lucide-react';
import usersApi from '../services/usersApi';

const TabButton = ({ label, icon, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm rounded-t-lg border-b-2 transition ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}>
        {icon}
        {label}
    </button>
);

const FormField = ({ label, value, name, onChange, disabled, type = 'text', options = [] }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'select' ? (
            <select name={name} value={value || ''} onChange={onChange} disabled={disabled} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        ) : (
            <input type={type} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
        )}
    </div>
);

export default function UserDetailsModal({ userId, isOpen, onClose, onSaveSuccess }) {
    const [user, setUser] = useState(null);
    const [userPoints, setUserPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (isOpen && userId) {
            const fetchData = async () => {
                setLoading(true);
                const [detailsResult, pointsResult, rolesResult] = await Promise.all([
                    usersApi.getUserDetails(userId),
                    usersApi.getUserPoints(userId), // Assuming this is safe for non-students
                    usersApi.getRoles(),
                ]);

                if (detailsResult.success) setUser(detailsResult.data);
                if (pointsResult.success) setUserPoints(pointsResult.data);
                if (rolesResult.success) setRoles(rolesResult.data);
                
                setLoading(false);
                setEditMode(false); // Reset to view mode
                setActiveTab('account'); // Reset to first tab
            };
            fetchData();
        }
    }, [isOpen, userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, sinh_vien: { ...prev.sinh_vien, [name]: value } }));
    };

    const handleSave = async () => {
        const payload = {
            hoten: user.ho_ten,
            email: user.email,
            vai_tro_id: user.vai_tro_id,
            trang_thai: user.trang_thai,
        };
        const result = await usersApi.updateUser(userId, payload);
        if (result.success) {
            onSaveSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">{editMode ? 'Chỉnh sửa' : 'Chi tiết'} người dùng</h2>
                    <div className="flex items-center gap-2">
                        {!editMode ? (
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Edit size={16}/>Chỉnh sửa</button>
                        ) : (
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={16}/>Lưu</button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                    </div>
                </div>

                {loading ? <div className="p-8 text-center">Đang tải...</div> :
                 !user ? <div className="p-8 text-center text-red-500">Không thể tải dữ liệu người dùng.</div> :
                 (
                    <>
                        <div className="border-b px-4 flex items-center">
                            <TabButton label="Tài khoản" icon={<User size={16}/>} isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
                            {user.sinh_vien && <TabButton label="Thông tin cá nhân" icon={<Settings size={16}/>} isActive={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />}
                            {user.sinh_vien && <TabButton label="Điểm rèn luyện" icon={<Award size={16}/>} isActive={activeTab === 'points'} onClick={() => setActiveTab('points')} />}
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {activeTab === 'account' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Tên đăng nhập" name="ten_dn" value={user.ten_dn} onChange={handleInputChange} disabled={true} />
                                    <FormField label="Email" name="email" value={user.email} onChange={handleInputChange} disabled={!editMode} />
                                    <FormField label="Họ tên" name="ho_ten" value={user.ho_ten} onChange={handleInputChange} disabled={!editMode} />
                                    <FormField label="Vai trò" name="vai_tro_id" value={user.vai_tro_id} onChange={handleInputChange} disabled={!editMode} type="select" options={roles.map(r => ({ value: r.id, label: r.ten_vt }))} />
                                    <FormField label="Trạng thái" name="trang_thai" value={user.trang_thai} onChange={handleInputChange} disabled={!editMode} type="select" options={[{value: 'hoat_dong', label: 'Hoạt động'}, {value: 'khoa', label: 'Bị khóa'}]} />
                                </div>
                            )}
                            {activeTab === 'personal' && user.sinh_vien && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="MSSV" name="mssv" value={user.sinh_vien.mssv} onChange={handleStudentInputChange} disabled={!editMode} />
                                    <FormField label="Ngày sinh" name="ngay_sinh" value={user.sinh_vien.ngay_sinh ? new Date(user.sinh_vien.ngay_sinh).toISOString().split('T')[0] : ''} onChange={handleStudentInputChange} disabled={!editMode} type="date" />
                                    <FormField label="Giới tính" name="gt" value={user.sinh_vien.gt} onChange={handleStudentInputChange} disabled={!editMode} type="select" options={[{value: 'nam', label: 'Nam'}, {value: 'nu', label: 'Nữ'}, {value: 'khac', label: 'Khác'}]} />
                                    <FormField label="Số điện thoại" name="sdt" value={user.sinh_vien.sdt} onChange={handleStudentInputChange} disabled={!editMode} />
                                </div>
                            )}
                            {activeTab === 'points' && (
                                <div>
                                    {userPoints.length > 0 ? (
                                        <ul className="space-y-2">
                                            {userPoints.map((p, i) => <li key={i} className="p-3 border rounded-md flex justify-between"><span>{p.activity_name}</span><span className="font-bold">{p.points} điểm</span></li>)}
                                        </ul>
                                    ) : <p>Chưa có điểm rèn luyện.</p>}
                                </div>
                            )}
                        </div>
                    </>
                 )
                }
            </div>
        </div>
    );
}

