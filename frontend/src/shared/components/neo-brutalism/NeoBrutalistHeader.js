import React from 'react';

/**
 * NeoBrutalistHeader - Reusable Neo-brutalism + Glassmorphism Header
 * 
 * @param {Object} props
 * @param {string} props.title - Main title (can be split with • separator)
 * @param {string} props.subtitle - Subtitle text
 * @param {string} props.highlightText - Highlighted text below title
 * @param {string} props.badgeText - Badge text (top-left)
 * @param {string} props.badgeIcon - Badge icon (emoji or component)
 * @param {number} props.count - Count to show next to badge
 * @param {string} props.countLabel - Label for count
 * @param {string} props.gradientFrom - Gradient start color (default: teal-600)
 * @param {string} props.gradientVia - Gradient middle color (default: emerald-600)
 * @param {string} props.gradientTo - Gradient end color (default: cyan-600)
 * @param {string} props.highlightColor - Color for highlight text (default: indigo-300)
 * @param {React.ReactNode} props.statsCards - Stats cards to render
 * @param {React.ReactNode} props.rightContent - Content for right side (optional)
 * @param {React.ReactNode} props.children - Additional content
 */
export default function NeoBrutalistHeader({
  title = '',
  subtitle = '',
  highlightText = '',
  badgeText = '',
  badgeIcon = '✓',
  count = 0,
  countLabel = '',
  gradientFrom = 'teal-600',
  gradientVia = 'emerald-600',
  gradientTo = 'cyan-600',
  highlightColor = 'indigo-300',
  statsCards = null,
  rightContent = null,
  children
}) {
  // Split title by • to create animated letters
  const renderTitle = (titleText) => {
    const parts = titleText.split('•');
    return parts.map((part, partIndex) => (
      <React.Fragment key={partIndex}>
        {partIndex > 0 && <span className="inline-block mx-2">•</span>}
        {part.trim().split('').map((char, charIndex) => (
          <span
            key={`${partIndex}-${charIndex}`}
            className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <div className="relative min-h-[280px]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom} via-${gradientVia} to-${gradientTo}`}></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'neo-grid-move 20s linear infinite'
          }}
        ></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-neo-bounce-slow"></div>
      <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-neo-spin-slow"></div>

      {/* Main Content Container with Glassmorphism */}
      <div className="relative z-10 p-8">
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Top Bar with Badge */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {badgeText && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                      {badgeIcon} {badgeText}
                    </div>
                  </div>
                  <div className="h-8 w-1 bg-white/40"></div>
                </>
              )}
              {(count > 0 || countLabel) && (
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    {count} {countLabel}
                  </div>
                </div>
              )}
            </div>
            {rightContent}
          </div>

          {/* Main Title Section */}
          <div className="mb-8">
            <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
              {renderTitle(title)}
              {highlightText && (
                <>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className={`relative z-10 text-${highlightColor} drop-shadow-[0_0_30px_rgba(165,180,252,0.5)]`}>
                      {highlightText}
                    </span>
                    <div className={`absolute -bottom-2 left-0 right-0 h-4 bg-${highlightColor}/30 blur-sm`}></div>
                  </span>
                </>
              )}
            </h1>

            {subtitle && (
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Stats Cards */}
          {statsCards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsCards}
            </div>
          )}

          {/* Additional Content */}
          {children}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes neo-grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes neo-bounce-slow {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes neo-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-neo-bounce-slow {
          animation: neo-bounce-slow 3s ease-in-out infinite;
        }
        .animate-neo-spin-slow {
          animation: neo-spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
