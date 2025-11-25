import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, Activity, AlertCircle, Trophy, MapPin, Filter, Zap, Target, Star
} from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureWidget from '../../../components/SemesterClosureWidget';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import useMonitorDashboard from '../model/hooks/useMonitorDashboard';
import DashboardProfileHeader from './components/Dashboard/DashboardProfileHeader';
import DashboardPointsCard from './components/Dashboard/DashboardPointsCard';
import DashboardStatsCard from './components/Dashboard/DashboardStatsCard';
import ActivityListItem from './components/Dashboard/ActivityListItem';
import TopStudentItem from './components/Dashboard/TopStudentItem';
import ActivitySummaryModal from './components/Dashboard/ActivitySummaryModal';

export default function MonitorDashboardPage() {
  const navigate = useNavigate();
  const {
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    recentFilter,
    setRecentFilter,
    recentCounts,
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
    approvals,
    loading,
    monitorName,
    monitorMssv,
    monitorPoints,
    activitiesJoined,
    classRank,
    goalPoints,
    goalText,
    totalPointsProgress,
    totalStudents,
    pendingApprovals,
    totalActivities,
    classification,
    formatNumber,
  } = useMonitorDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" data-ref="monitor-dashboard-refactored">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50" data-ref="monitor-dashboard-refactored">
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <DashboardProfileHeader
              userProfile={userProfile}
              monitorName={monitorName}
              monitorMssv={monitorMssv}
              summary={summary}
              classSummary={classSummary}
              classification={classification}
            />

            {!loading && (
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-5 w-5 text-black font-bold" />
                    <h3 className="text-base font-black text-black uppercase tracking-wider">BỘ LỌC HỌC KỲ</h3>
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg mb-3">
                    <SemesterFilter value={semester} onChange={setSemester} label="" />
                  </div>
                  <div className="bg-white/90 rounded-xl p-3 border-2 border-black">
                    <SemesterClosureWidget compact enableSoftLock={false} enableHardLock={false} className="!p-0 !bg-transparent !border-0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div className="grid grid-cols-3 gap-3">
              <DashboardPointsCard
                monitorPoints={monitorPoints}
                totalPointsProgress={totalPointsProgress}
                formatNumber={formatNumber}
              />

              <DashboardStatsCard
                icon={Users}
                value={totalStudents}
                subLabel="SINH VIÊN"
                bgColor="bg-blue-400"
                textColor="text-white"
                badgeText="LỚP HỌC"
                badgeColor="bg-black"
              />

              <DashboardStatsCard
                icon={Calendar}
                value={activitiesJoined}
                subLabel="HOẠT ĐỘNG"
                bgColor="bg-yellow-400"
                textColor="text-black"
                badgeText="THAM GIA"
                badgeColor="bg-black"
              />

              <DashboardStatsCard
                icon={AlertCircle}
                value={pendingApprovals}
                subLabel="CHỜ DUYỆT"
                bgColor="bg-orange-400"
                textColor="text-black"
                badge={pendingApprovals > 0 && <div className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md"><span className="text-red-600 font-black text-xs animate-pulse">!</span></div>}
              />

              <DashboardStatsCard
                icon={Activity}
                value={totalActivities}
                subLabel="HOẠT ĐỘNG LỚP"
                bgColor="bg-purple-400"
                textColor="text-white"
                badgeText="ĐÃ DUYỆT"
                badgeColor="bg-black"
              />

              <DashboardStatsCard
                icon={Clock}
                value={upcomingActivities?.length || 0}
                subLabel="HOẠT ĐỘNG"
                bgColor="bg-pink-400"
                textColor="text-black"
                badgeText="SẮP TỚI"
                badgeColor="bg-black"
              />

              <DashboardStatsCard
                icon={Trophy}
                value={`${classRank}/${totalStudents}`}
                subLabel="HẠNG CỦA TÔI"
                bgColor="bg-blue-500"
                textColor="text-white"
                badge={<Star className="w-4 h-4 text-white" />}
              />

              <DashboardStatsCard
                icon={Target}
                goalPoints={goalPoints}
                goalText={goalText}
                bgColor="bg-green-400"
                textColor="text-black"
                badgeText="MỤC TIÊU"
                badgeColor="bg-black"
              />
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
            <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Calendar className="w-5 h-5" />
                    Hoạt động sắp diễn ra
                  </button>
                  <button onClick={() => setActiveTab('recent')} className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm transition-all ${activeTab === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Clock className="w-5 h-5" />
                    Hoạt động gần đây
                  </button>
                </div>
                <button onClick={() => navigate('/class/activities')} className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Xem tất cả →</button>
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {activeTab === 'upcoming' ? (
                  <>
                    {upcomingActivities?.length ? (
                      <>
                        {upcomingActivities.map(activity => (
                          <ActivityListItem
                            key={activity.id}
                            activity={activity}
                            onClick={() => handleActivityClick(activity)}
                            formatNumber={formatNumber}
                            variant="upcoming"
                          />
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">Chưa có hoạt động sắp diễn ra</p>
                        <button onClick={() => navigate('/class/activities/create')} className="mt-2 text-purple-600 hover:text-purple-700 font-medium text-sm">Tạo hoạt động đầu tiên →</button>
                      </div>
                    )}
                  </>
                ) : activeTab === 'recent' ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {[
                        { label: 'Tất cả', value: 'all', count: recentCounts.all },
                        { label: 'Chờ duyệt', value: 'cho_duyet', count: recentCounts.cho_duyet },
                        { label: 'Đã duyệt', value: 'da_duyet', count: recentCounts.da_duyet },
                        { label: 'Đã tham gia', value: 'da_tham_gia', count: recentCounts.da_tham_gia },
                        { label: 'Bị từ chối', value: 'tu_choi', count: recentCounts.tu_choi },
                      ].map(f => (
                        <button key={f.value} onClick={() => setRecentFilter(f.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${recentFilter === f.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                          {f.label}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${recentFilter === f.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>{f.count}</span>
                        </button>
                      ))}
                    </div>
                    {filteredRecent?.length ? (
                      <>
                        {filteredRecent.map((activity, idx) => {
                          const activityId = (activity.activity || activity.hoat_dong || activity)?.id || activity.id;
                          return (
                            <ActivityListItem
                              key={activity.id || idx}
                              activity={activity}
                              onClick={() => activityId && handleActivityClick(activity)}
                              formatNumber={formatNumber}
                              variant="recent"
                            />
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">Không có hoạt động nào khớp với bộ lọc</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <Trophy className="w-5 h-5" />
                  Danh Sách Sinh Viên
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">{topStudents?.length || 0} SV</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
                {topStudents && topStudents.length > 0 ? (
                  topStudents.map((student, index) => (
                    <TopStudentItem key={student.id} student={student} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Chưa có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ActivitySummaryModal
        isOpen={showSummaryModal}
        activity={selectedActivity}
        onClose={handleCloseSummaryModal}
        formatNumber={formatNumber}
      />

      <ActivityDetailModal activityId={selectedActivityId} isOpen={showDetailModal} onClose={handleCloseDetailModal} />
    </div>
  );
}
