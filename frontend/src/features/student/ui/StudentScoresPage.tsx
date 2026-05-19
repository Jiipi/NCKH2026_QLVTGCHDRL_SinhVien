import React from 'react';
import { useLocation } from 'react-router-dom';
import { Award, BarChart3, Target } from 'lucide-react';
import { StudentPageHero } from '../../../shared/components/student';
import useStudentScores from '../model/hooks/useStudentScores';
import ScoresLoading from './components/Scores/ScoresLoading';
import ScoresError from './components/Scores/ScoresError';
import ScoresSummary from './components/Scores/ScoresSummary';
import ScoresActivities from './components/Scores/ScoresActivities';
import ScoresRankingTable from './components/Scores/ScoresRankingTable';

export default function StudentScoresPage() {
  const location = useLocation();
  const {
    semester,
    handleSemesterChange,
    data,
    loading,
    error,
    stats,
    targetScore,
    currentScore,
    progressPercentage
  } = useStudentScores();

  if (loading) {
    return <ScoresLoading semester={semester} onSemesterChange={handleSemesterChange} />;
  }
  const isMonitorRoute = location.pathname.startsWith('/monitor');

  return (
    <div className="flex flex-col flex-1 space-y-6" data-ref="student-scores-refactored">
      <StudentPageHero
        eyebrow={isMonitorRoute ? 'Không gian lớp trưởng' : 'Không gian sinh viên'}
        title="Điểm rèn luyện"
        description="Theo dõi tổng điểm, mục tiêu học kỳ, hoạt động đã ghi nhận và thứ hạng trong lớp."
        chips={[
          { icon: Award, label: `${currentScore}/100 điểm` },
          { icon: Target, label: `Mục tiêu ${targetScore}` },
          { icon: BarChart3, label: `${Math.round(progressPercentage || 0)}% tiến độ` }
        ]}
      />

      <ScoresError message={error} />

      {data && (
        <>
          <ScoresSummary
            currentScore={currentScore}
            targetScore={targetScore}
            progressPercentage={progressPercentage}
            stats={stats}
            data={data}
          />

          <ScoresActivities activities={data.activities || []} />

          <ScoresRankingTable rankings={Array.isArray(data.class_rankings) ? data.class_rankings : []} />
        </>
      )}
    </div>
  );
}

