import React from 'react';
import { Award, BarChart3, Target } from 'lucide-react';
import useStudentScores from '../model/hooks/useStudentScores';
import ScoresLoading from './components/Scores/ScoresLoading';
import ScoresError from './components/Scores/ScoresError';
import ScoresSummary from './components/Scores/ScoresSummary';
import ScoresActivities from './components/Scores/ScoresActivities';
import ScoresRankingTable from './components/Scores/ScoresRankingTable';

function StudentPageHero({ eyebrow, title, description, chips }: {
  eyebrow: string;
  title: string;
  description: string;
  chips: Array<{ icon: React.ElementType; label: string }>;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.14),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/45 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <div className="flex flex-col flex-1 space-y-6" data-ref="student-scores-refactored">
      <StudentPageHero
        eyebrow="Không gian sinh viên"
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

