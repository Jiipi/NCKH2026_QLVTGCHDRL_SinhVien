import React from 'react';
import { Download, FileText, Users, Activity, Award, TrendingUp } from 'lucide-react';

/**
 * ReportsHeader Component - Header section với neo-brutalism design
 */
export default function ReportsHeader({ overview, avgScore, onExportExcel, onExportPDF }) {
  return (
    <div className="relative min-h-[280px]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

      {/* Main Content Container with Glassmorphism */}
      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          
          {/* Top Bar with Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black text-pink-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-pink-400">
                  📊 BÁO CÁO
                </div>
              </div>
              <div className="h-8 w-1 bg-white/40"></div>
              <div className="text-white/90 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {overview?.totalStudents || 0} SINH VIÊN
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={onExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 text-purple-600 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
              >
                <FileText className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="mb-8">
            <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">B</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
              <span className="inline-block mx-2">•</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">C</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Á</span>
              <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-pink-400 drop-shadow-[0_0_30px_rgba(244,114,182,0.5)]">
                  THỐNG KÊ
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-pink-400/30 blur-sm"></div>
              </span>
            </h1>
            
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Phân tích chi tiết hoạt động và thành tích rèn luyện của lớp
            </p>
          </div>

          {/* Stats Bar with Brutalist Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 - Total Students */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Users className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{overview?.totalStudents || 0}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">SINH VIÊN</p>
              </div>
            </div>

            {/* Card 2 - Total Activities */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Activity className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{overview?.totalActivities || 0}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p>
              </div>
            </div>

            {/* Card 3 - Average Points */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <Award className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{avgScore}</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐIỂM TB</p>
              </div>
            </div>

            {/* Card 4 - Participation Rate */}
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
              <div className="relative bg-pink-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <TrendingUp className="h-6 w-6 text-black mb-2" />
                <p className="text-3xl font-black text-black">{overview?.participationRate || 0}%</p>
                <p className="text-xs font-black text-black/70 uppercase tracking-wider">THAM GIA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
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
      `}} />
    </div>
  );
}

