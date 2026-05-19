import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useMonitorDashboard from '../model/hooks/useMonitorDashboard';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivitySummaryModal from './components/Dashboard/ActivitySummaryModal';

// Shared Components
import DashboardHero from '../../student/ui/components/Dashboard/DashboardHero';
import UpcomingActivities from '../../student/ui/components/Dashboard/UpcomingActivities';
import RecentActivities from '../../student/ui/components/Dashboard/RecentActivities';
import MonitorClassStats from './components/Dashboard/MonitorClassStats';
import MonitorTopStudents from './components/Dashboard/MonitorTopStudents';
import MonitorChartsSection from './components/Dashboard/MonitorChartsSection';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';

// Page entry animation
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      staggerChildren: 0.12,
    }
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
} as const;

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const }
  }
} as const;

// Loading spinner animation
const spinnerVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 }
  }
} as const;

export default function MonitorDashboardPage() {
  const navigate = useNavigate();
  const {
    semester,
    setSemester,
    recentFilter,
    setRecentFilter,
    filteredRecent,
    selectedActivity,
    setSelectedActivity,
    selectedActivityId,
    setSelectedActivityId,
    showSummaryModal,
    setShowSummaryModal,
    showDetailModal,
    setShowDetailModal,
    handleActivityClick,
    handleCloseSummaryModal,
    handleCloseDetailModal,
    upcomingActivities,
    myActivities,
    summary,
    userProfile,
    topStudents,
    classSummary,
    loading,
    totalStudents,
    pendingApprovals,
    totalActivities,
    classification,
    formatNumber,
  } = useMonitorDashboard();

  return (
    <motion.div
      data-ref="monitor-dashboard-refactored"
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ===== SECTION 1: Monitor Hero (Điểm RL, Xếp loại, Thống kê cá nhân) ===== */}
      <motion.div variants={sectionVariants}>
        <DashboardHero
          summary={summary}
          userProfile={userProfile}
          studentInfo={{
            mssv: userProfile?.mssv || '',
            ten_lop: classSummary?.className || 'N/A'
          }}
          classification={classification}
          semester={semester}
          onSemesterChange={setSemester}
          loading={loading}
          formatNumber={formatNumber}
        />
      </motion.div>

      {/* Loading state */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            variants={spinnerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AppLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key="content"
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* ===== SECTION 2: Class Stats ===== */}
            <MonitorClassStats
              totalStudents={totalStudents}
              totalActivities={totalActivities}
              pendingApprovals={pendingApprovals}
              formatNumber={(n) => formatNumber(n).toString()}
            />

            {/* ===== SECTION 2.5: Charts ===== */}
            <MonitorChartsSection
              myActivities={{
                all: myActivities?.all || [],
                pending: myActivities?.pending || [],
                approved: myActivities?.approved || [],
                joined: myActivities?.joined || [],
                rejected: myActivities?.rejected || []
              }}
              topStudents={topStudents}
              totalStudents={totalStudents}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Cột trái (2/3): Hoạt động */}
              <div className="lg:col-span-2 space-y-5">
                {/* ===== SECTION 3: Hoạt động sắp tới ===== */}
                <UpcomingActivities
                  upcoming={upcomingActivities}
                  formatNumber={formatNumber}
                  onViewAll={() => navigate('/monitor/activities')}
                  onSelectActivity={handleActivityClick}
                />

                {/* ===== SECTION 4: Hoạt động gần đây ===== */}
                <RecentActivities
                  recentActivities={filteredRecent}
                  recentFilter={recentFilter}
                  onFilterChange={setRecentFilter}
                  myActivities={myActivities}
                  formatNumber={formatNumber}
                  onViewAll={() => navigate('/monitor/my-activities')}
                  onSelectActivity={handleActivityClick}
                />
              </div>

              {/* Cột phải (1/3): Top Sinh Viên */}
              <div className="lg:col-span-1">
                <MonitorTopStudents topStudents={topStudents} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ActivitySummaryModal
        isOpen={showSummaryModal}
        activity={selectedActivity}
        onClose={handleCloseSummaryModal}
        formatNumber={formatNumber}
      />

      <ActivityDetailModal 
        activityId={selectedActivityId} 
        isOpen={showDetailModal} 
        onClose={handleCloseDetailModal} 
      />
    </motion.div>
  );
}
