import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStudentDashboard from '../model/hooks/useStudentDashboard';
import { Loader2 } from 'lucide-react';
import DashboardHero from './components/Dashboard/DashboardHero';
import UpcomingActivities from './components/Dashboard/UpcomingActivities';
import RecentActivities from './components/Dashboard/RecentActivities';
import DashboardActivitySummaryModal from './components/Dashboard/DashboardActivitySummaryModal';
import StudentChartsSection from './components/Dashboard/StudentChartsSection';

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

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const {
    semester,
    setSemester,
    recentFilter,
    setRecentFilter,
    recentActivities,
    selectedActivityState,
    showSummaryModalState,
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    loading,
    classification,
    formatNumber
  } = useStudentDashboard();

  const [selectedActivity, setSelectedActivity] = selectedActivityState;
  const [showSummaryModal, setShowSummaryModal] = showSummaryModalState;
  const handleSelectActivity = (activity: unknown) => {
    setSelectedActivity(activity);
    setShowSummaryModal(true);
  };
  const handleCloseModal = () => {
    setShowSummaryModal(false);
    setSelectedActivity(null);
  };

  return (
    <motion.div
      data-ref="student-dashboard-refactored"
      className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ===== SECTION 1: Thông tin sinh viên + Điểm + Thống kê ===== */}
      <motion.div variants={sectionVariants}>
        <DashboardHero
          summary={summary}
          userProfile={userProfile}
          studentInfo={studentInfo}
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
            className="flex flex-col items-center justify-center py-16"
            variants={spinnerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
            </motion.div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key="content"
            className="space-y-5 mt-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* ===== SECTION 2: Biểu đồ thống kê ===== */}
            <StudentChartsSection
              activities={myActivities?.all || []}
              summary={summary}
            />

            {/* ===== SECTION 3: Hoạt động sắp tới ===== */}
            <UpcomingActivities
              upcoming={upcoming}
              formatNumber={formatNumber}
              onViewAll={() => navigate('/student/activities')}
              onSelectActivity={handleSelectActivity}
            />

            {/* ===== SECTION 3: Hoạt động đã tham gia gần đây ===== */}
            <RecentActivities
              recentActivities={recentActivities}
              recentFilter={recentFilter}
              onFilterChange={setRecentFilter}
              myActivities={myActivities}
              formatNumber={formatNumber}
              onViewAll={() => navigate('/student/my-activities')}
              onSelectActivity={handleSelectActivity}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <DashboardActivitySummaryModal
        visible={showSummaryModal}
        activity={selectedActivity}
        onClose={handleCloseModal}
        formatNumber={formatNumber}
      />
    </motion.div>
  );
}
