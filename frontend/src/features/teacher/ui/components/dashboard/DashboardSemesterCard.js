import React from 'react';
import { Calendar } from 'lucide-react';
import SemesterFilter from '../../../../../widgets/semester/ui/SemesterSwitcher';
import SemesterClosureWidget from '../../../../../shared/components/semester/SemesterClosureWidget';

export default function DashboardSemesterCard({ semester, onSemesterChange }) {
  return (
    <div className="group relative" data-ref="dashboard-semester-card">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl" />
      <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-black font-bold" />
          <h3 className="text-base font-black text-black uppercase tracking-wider">Bộ lọc học kỳ</h3>
        </div>
        <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg mb-3">
          <SemesterFilter value={semester} onChange={onSemesterChange} />
        </div>
        <div className="bg-white/90 rounded-xl p-3 border-2 border-black">
          <SemesterClosureWidget compact enableSoftLock={false} enableHardLock={false} className="!p-0 !bg-transparent !border-0" />
        </div>
      </div>
    </div>
  );
}


