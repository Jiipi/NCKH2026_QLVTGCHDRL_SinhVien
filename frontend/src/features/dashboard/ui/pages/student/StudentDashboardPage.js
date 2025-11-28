import React, { useState, useEffect } from 'react';

// Model layer
import { useStudentDashboard } from '../../../model/hooks/useStudentDashboard';

// UI shared components
import StudentDashboardHeader from '../../shared/StudentDashboardHeader';
import DashboardStatsGrid from '../../shared/DashboardStatsGrid';
import UpcomingActivitiesWidget from '../../shared/UpcomingActivitiesWidget';
import RecentActivitiesWidget from '../../shared/RecentActivitiesWidget';

// App-wide shared components/hooks
import { useSemesterData } from '../../../../shared/hooks';
import { SemesterFilter, LoadingSpinner, ErrorMessage } from '../../../../shared/components/common';

export default function StudentDashboardPage() {
    const { currentSemester, options: semesterOptions = [], loading: semesterLoading } = useSemesterData();
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
        if (semesterLoading) return;

        const hasSemesterInOptions = semester && semesterOptions.some(opt => opt.value === semester);
        const fallbackSemester = (() => {
            if (currentSemester && semesterOptions.some(opt => opt.value === currentSemester)) {
                return currentSemester;
            }
            return semesterOptions[0]?.value || '';
        })();

        if (!semester && fallbackSemester) {
            console.log('[StudentDashboard] Initializing semester from fallback:', fallbackSemester);
            setSemester(fallbackSemester);
            return;
        }

        if (semester && !hasSemesterInOptions && fallbackSemester && fallbackSemester !== semester) {
            console.log('[StudentDashboard] Re-align semester with available options:', { semester, fallbackSemester });
            setSemester(fallbackSemester);
        }
    }, [semester, semesterOptions, currentSemester, semesterLoading]);

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
