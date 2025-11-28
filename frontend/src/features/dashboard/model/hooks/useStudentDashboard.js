import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '../../services/dashboardApi';
import http from '../../../../shared/services/api/client'; // Correct client for profile endpoints

const calculateGoal = (points) => {
    const p = Number(points || 0);
    if (p < 50) return { goalPoints: Math.max(0, 50 - p), goalText: `Cần ${Math.max(0, 50 - p)} điểm để đạt Trung bình` };
    if (p < 65) return { goalPoints: Math.max(0, 65 - p), goalText: `Cần ${Math.max(0, 65 - p)} điểm để đạt Khá` };
    if (p < 80) return { goalPoints: Math.max(0, 80 - p), goalText: `Cần ${Math.max(0, 80 - p)} điểm để đạt Tốt` };
    if (p < 90) return { goalPoints: Math.max(0, 90 - p), goalText: `Cần ${Math.max(0, 90 - p)} điểm để đạt Xuất sắc` };
    return { goalPoints: 0, goalText: 'Đã đạt Xuất sắc' };
};

export function useStudentDashboard(semester) {
    const [summary, setSummary] = useState({});
    const [upcomingActivities, setUpcomingActivities] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [studentInfo, setStudentInfo] = useState({ mssv: '', ten_lop: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        // Allow fetching even without semester (backend will use current semester)
        console.log('[useStudentDashboard] fetchData called with semester:', semester);
        setLoading(true);
        setError('');

        // Fetch dashboard and profile in parallel. Profile endpoint is in profile/auth module, not activities
        const [dashboardResult, profileResponse] = await Promise.all([
            dashboardApi.getStudentDashboard(semester || null),
            // Try V2 profile first then fallback to /auth/profile
            (async () => {
                try {
                    const res = await http.get('/core/profile');
                    return { success: true, data: res.data?.data || res.data };
                } catch (_) {
                    try {
                        const res = await http.get('/auth/profile');
                        return { success: true, data: res.data?.data || res.data };
                    } catch (error) {
                        const message = error.response?.data?.message || error.message || 'Không thể tải hồ sơ người dùng';
                        return { success: false, error: message };
                    }
                }
            })(),
        ]);

    console.log('[useStudentDashboard] dashboardResult:', dashboardResult);
    console.log('[useStudentDashboard] profileResult:', profileResponse);

        if (dashboardResult.success && profileResponse.success) {
            const dashboardData = dashboardResult.data;
            setUserProfile(profileResponse.data);

            const tongQuan = dashboardData.tong_quan || {};
            const totalPoints = Number(tongQuan.tong_diem || 0);
            const goal = calculateGoal(totalPoints);

            setSummary({
                totalPoints: totalPoints,
                activitiesJoined: tongQuan.tong_hoat_dong ?? 0,
                classRank: dashboardData.so_sanh_lop?.my_rank_in_class ?? null,
                totalStudents: dashboardData.so_sanh_lop?.total_students_in_class ?? null,
                progress: Math.min((totalPoints / 100) * 100, 100),
                goalText: goal.goalText,
                goalPoints: goal.goalPoints,
            });

            setUpcomingActivities(dashboardData.hoat_dong_sap_toi || []);
            // Assuming recent activities are also part of the dashboard payload
            // If not, a separate API call would be needed here.
            setRecentActivities(dashboardData.hoat_dong_gan_day || []); 

            // Extract student info safely
            const sv = dashboardData.sinh_vien || dashboardData.student || {};
            const lop = sv.lop || dashboardData.lop || {};
            setStudentInfo({
                mssv: sv.mssv || sv.maso || sv.studentCode || '',
                ten_lop: lop.ten_lop || lop.ten || sv.ten_lop || '',
            });

        } else {
            const errMsg = dashboardResult.error || profileResponse.error || 'Không thể tải dữ liệu dashboard.';
            console.error('[useStudentDashboard] Error:', errMsg);
            setError(errMsg);
        }

        setLoading(false);
    }, [semester]);

    useEffect(() => {
        console.log('[useStudentDashboard] useEffect triggered, calling fetchData...');
        fetchData();
    }, [fetchData]);

    return {
        summary,
        upcomingActivities,
        recentActivities,
        userProfile,
        studentInfo,
        loading,
        error,
        refresh: fetchData,
    };
}
