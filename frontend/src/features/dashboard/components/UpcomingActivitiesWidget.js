import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ActivityItem = ({ activity, onClick }) => {
    const activityData = activity.activity || activity;
    const daysUntil = activity.ngay_bd ? Math.ceil((new Date(activity.ngay_bd) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div
            onClick={() => onClick(activity)}
            className="cursor-pointer bg-blue-50 rounded-xl p-4 hover:bg-blue-100 hover:shadow-md transition-all"
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1">{activityData.ten_hd || 'Hoạt động'}</h3>
                {daysUntil !== null && (
                    <span className="ml-2 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                        {daysUntil > 0 ? `+${daysUntil}d` : 'Hôm nay'}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                <span className="flex items-center gap-1"><Clock size={14} />{activity.ngay_bd ? new Date(activity.ngay_bd).toLocaleDateString('vi-VN') : 'N/A'}</span>
                {activityData.dia_diem && <span className="flex items-center gap-1 truncate"><MapPin size={14} />{activityData.dia_diem}</span>}
            </div>
        </div>
    );
};

export default function UpcomingActivitiesWidget({ activities }) {
    const navigate = useNavigate();

    // In a real refactor, the modal logic would be handled by the parent page
    const handleItemClick = (activity) => {
        // For now, let's just navigate to the activity detail page
        const activityId = activity.activity?.id || activity.id;
        if (activityId) {
            navigate(`/activities/${activityId}`);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Calendar className="text-blue-500"/> Hoạt động sắp tới</h2>
                <button onClick={() => navigate('/student/activities')} className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả →</button>
            </div>
            <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
                {activities.length > 0 ? (
                    activities.map((activity, idx) => (
                        <ActivityItem key={activity.id || idx} activity={activity} onClick={handleItemClick} />
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Không có hoạt động nào sắp diễn ra.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
