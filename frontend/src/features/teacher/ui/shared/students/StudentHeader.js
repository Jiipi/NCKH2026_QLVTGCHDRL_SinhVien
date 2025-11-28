/**
 * StudentHeader Component
 * =======================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Neo-brutalism + Glassmorphism header for Student Management page
 * 
 * @module features/teacher/ui/components/students/StudentHeader
 */

import React from 'react';
import { Users, GraduationCap } from 'lucide-react';

/**
 * StudentHeader - Hero section with animated background
 * @param {Object} props
 * @param {number} props.totalStudents - Total number of students
 * @param {number} props.totalClasses - Total number of classes
 */
export function StudentHeader({ totalStudents = 0, totalClasses = 0 }) {
  return (
    <div className="relative min-h-[220px]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 right-20 w-16 h-16 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-12 h-12 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-10 h-10 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

      {/* Main Content Container with Glassmorphism */}
      <div className="relative z-10 p-6 sm:p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* Top Bar with Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-purple-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-purple-400">
                  ✓ QUẢN LÝ
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  {totalStudents} SINH VIÊN
                </div>
              </div>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ả</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">L</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ý</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-purple-300 drop-shadow-[0_0_30px_rgba(216,180,254,0.5)]">
                  SINH VIÊN & LỚP
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-purple-300/30 blur-sm"></div>
              </span>
            </h1>
            
            <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
              Xem và quản lý danh sách sinh viên, lớp phụ trách
            </p>
          </div>

          {/* Stats Bar with Brutalist Cards */}
          <div className="flex gap-4">
            {/* Card - Total Classes */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <GraduationCap className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{totalClasses}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">LỚP PHỤ TRÁCH</p>
              </div>
            </div>

            {/* Card - Total Students */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-indigo-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Users className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{totalStudents}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">SINH VIÊN</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default StudentHeader;
