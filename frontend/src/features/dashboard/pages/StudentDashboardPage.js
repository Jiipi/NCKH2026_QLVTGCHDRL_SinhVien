import React, { useState, useEffect, useMemo } from 'react';

// Refactored imports
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import StudentDashboardHeader from '../components/StudentDashboardHeader';
import DashboardStatsGrid from '../components/DashboardStatsGrid';
import UpcomingActivitiesWidget from '../components/UpcomingActivitiesWidget';
import RecentActivitiesWidget from '../components/RecentActivitiesWidget';

// Shared components
import useSemesterData from '../../../hooks/useSemesterData';
import SemesterFilter from '../../../shared/components/common/SemesterFilter';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';

export default function StudentDashboardPage() {
    const { currentSemester, loading: semesterLoading } = useSemesterData();
    const [semester, setSemester] = useState(() => {
        // Load from sessionStorage or use currentSemester
        const saved = sessionStorage.getItem('current_semester');
        console.log('[StudentDashboard] Initial semester:', { saved, currentSemester });
        return saved || currentSemester || '';
    });

    console.log('[StudentDashboard] Render with:', { semester, currentSemester, semesterLoading });

    const {
        summary,
        upcomingActivities,
        recentActivities,
        userProfile,
        studentInfo,
        loading,
        error,
    } = useStudentDashboard(semester);

    console.log('[StudentDashboard] Hook state:', { loading, error, hasSummary: !!summary, hasProfile: !!userProfile });

    // Sync semester with global/current semester when it becomes available
    useEffect(() => {
        if (currentSemester && !semester) {
            console.log('[StudentDashboard] Setting initial semester:', currentSemester);
            setSemester(currentSemester);
        }
    }, [currentSemester, semester]);

    // Persist semester choice
    useEffect(() => {
        if (semester) {
            sessionStorage.setItem('current_semester', semester);
        }
    }, [semester]);

    if (loading) {
        return <LoadingSpinner text="Đang tải dữ liệu dashboard..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <StudentDashboardHeader 
                        userProfile={userProfile} 
                        studentInfo={studentInfo} 
                        summary={summary} 
                    />
                    <div className="p-4 bg-white rounded-xl shadow-md">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn học kỳ để xem</label>
                        <SemesterFilter value={semester} onChange={setSemester} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <DashboardStatsGrid summary={summary} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingActivitiesWidget activities={upcomingActivities} />
                <RecentActivitiesWidget myActivities={recentActivities} />
            </div>
        </div>
    );
}
