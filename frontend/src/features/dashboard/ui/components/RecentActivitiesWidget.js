import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, MapPin, CheckCircle } from 'lucide-react';

const ActivityItem = ({ activity, onClick }) => {
    const activityData = activity.activity || activity.hoat_dong || activity;
    const status = (activity.trang_thai_dk || '').toLowerCase();
    
    let bgColor = 'bg-blue-50';
    if (status === 'cho_duyet') bgColor = 'bg-yellow-50';
    else if (status === 'da_duyet') bgColor = 'bg-green-50';
    else if (status === 'tu_choi') bgColor = 'bg-red-50';

    return (
        <div onClick={() => onClick(activity)} className={`cursor-pointer rounded-xl p-4 hover:shadow-md transition-all ${bgColor}`}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1">{activityData.ten_hd || 'Hoạt động'}</h3>
                {activityData.diem_rl > 0 && (
                    <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">+{activityData.diem_rl}đ</span>
                )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Clock size={14}/>{activityData.ngay_bd ? new Date(activityData.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}</span>
                <span className="flex items-center gap-1 truncate"><MapPin size={14}/>{activityData.dia_diem || 'N/A'}</span>
            </div>
        </div>
    );
};

const FilterButton = ({ label, count, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}`}>
        {label} ({count})
    </button>
);

export default function RecentActivitiesWidget({ myActivities }) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [filteredActivities, setFilteredActivities] = useState([]);

    useEffect(() => {
        let filtered = [];
        switch (activeFilter) {
            case 'pending': filtered = myActivities.pending; break;
            case 'approved': filtered = myActivities.approved; break;
            case 'joined': filtered = myActivities.joined; break;
            case 'rejected': filtered = myActivities.rejected; break;
            default: filtered = myActivities.all;
        }
        setFilteredActivities(filtered || []);
    }, [activeFilter, myActivities]);

    const handleItemClick = (activity) => {
        const activityId = activity.activity?.id || activity.hoat_dong?.id || activity.id;
        if (activityId) {
            navigate(`/activities/${activityId}`);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Activity className="text-purple-500"/> Hoạt động gần đây</h2>
                <button onClick={() => navigate('/student/my-activities')} className="text-sm font-semibold text-purple-600 hover:underline">Xem tất cả →</button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <FilterButton label="Tất cả" count={myActivities.all?.length || 0} isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <FilterButton label="Chờ duyệt" count={myActivities.pending?.length || 0} isActive={activeFilter === 'pending'} onClick={() => setActiveFilter('pending')} />
                <FilterButton label="Đã duyệt" count={myActivities.approved?.length || 0} isActive={activeFilter === 'approved'} onClick={() => setActiveFilter('approved')} />
                <FilterButton label="Đã tham gia" count={myActivities.joined?.length || 0} isActive={activeFilter === 'joined'} onClick={() => setActiveFilter('joined')} />
            </div>

            <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity, idx) => (
                        <ActivityItem key={activity.id || idx} activity={activity} onClick={handleItemClick} />
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Không có hoạt động nào trong mục này.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
