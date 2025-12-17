import React from 'react';
import useStudentScores from '../model/hooks/useStudentScores';
import ScoresHero from './components/Scores/ScoresHero';
import ScoresLoading from './components/Scores/ScoresLoading';
import ScoresError from './components/Scores/ScoresError';
import ScoresSummary from './components/Scores/ScoresSummary';
import ScoresActivities from './components/Scores/ScoresActivities';
import ScoresRankingTable from './components/Scores/ScoresRankingTable';

export default function StudentScoresPage() {
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

  return (
    <div className="space-y-6" data-ref="student-scores-refactored">
      <ScoresHero
        semester={semester}
        onSemesterChange={handleSemesterChange}
        currentScore={currentScore}
        stats={stats}
        data={data}
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

