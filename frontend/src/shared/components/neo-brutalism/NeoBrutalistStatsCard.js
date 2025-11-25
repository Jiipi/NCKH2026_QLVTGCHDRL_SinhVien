import React from 'react';

/**
 * NeoBrutalistStatsCard - Reusable Neo-brutalism Stats Card
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string|number} props.value - Main value to display
 * @param {string} props.label - Label text below value
 * @param {string} props.bgColor - Background color class (default: bg-blue-400)
 * @param {string} props.textColor - Text color class (default: text-white)
 * @param {string} props.badgeText - Optional badge text
 * @param {string} props.badgeColor - Badge background color (default: bg-black)
 * @param {React.ReactNode} props.badge - Custom badge component
 * @param {string} props.goalPoints - Goal points (for goal cards)
 * @param {string} props.goalText - Goal description text
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
export default function NeoBrutalistStatsCard({
  icon: Icon,
  value,
  label,
  bgColor = 'bg-blue-400',
  textColor = 'text-white',
  badgeText,
  badgeColor = 'bg-black',
  badge,
  goalPoints,
  goalText,
  className = '',
  onClick
}) {
  const isGoalCard = goalPoints !== undefined || goalText !== undefined;
  const isClickable = typeof onClick === 'function';
  
  const CardWrapper = isClickable ? 'button' : 'div';
  
  return (
    <CardWrapper
      className={`group relative ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Shadow layer */}
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
      
      {/* Main card */}
      <div className={`relative ${bgColor} border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
        {/* Icon and Badge row */}
        <div className="flex items-center justify-between mb-2">
          {Icon && <Icon className={`h-6 w-6 ${textColor === 'text-white' ? 'text-white' : 'text-black'}`} />}
          
          {/* Badge */}
          {badge ? (
            badge
          ) : badgeText ? (
            <span className={`${badgeColor} text-white text-[8px] font-black px-2 py-0.5 rounded`}>
              {badgeText}
            </span>
          ) : null}
        </div>
        
        {/* Value */}
        {isGoalCard ? (
          <>
            <p className={`text-xl font-black ${textColor === 'text-white' ? 'text-white' : 'text-black'} mb-1 leading-none`}>
              {goalPoints > 0 ? `+${goalPoints}` : goalText?.includes('ĐÃ') ? '✓' : '0'}
            </p>
            <p className={`text-[9px] font-bold ${textColor === 'text-white' ? 'text-white/80' : 'text-black/70'} uppercase leading-tight line-clamp-2`}>
              {goalText || 'Mục tiêu'}
            </p>
          </>
        ) : (
          <>
            <p className={`text-3xl font-black ${textColor === 'text-white' ? 'text-white' : 'text-black'} mb-0.5`}>
              {value}
            </p>
            <p className={`text-[10px] font-black ${textColor === 'text-white' ? 'text-white/80' : 'text-black/70'} uppercase tracking-wider`}>
              {label}
            </p>
          </>
        )}
      </div>
    </CardWrapper>
  );
}

/**
 * NeoBrutalistStatsCardSmall - Smaller variant for compact layouts
 */
export function NeoBrutalistStatsCardSmall({
  icon: Icon,
  value,
  label,
  bgColor = 'bg-blue-400',
  textColor = 'text-white',
  className = ''
}) {
  return (
    <div className={`group relative ${className}`}>
      <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
      <div className={`relative ${bgColor} border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          {Icon && <Icon className={`w-5 h-5 ${textColor === 'text-white' ? 'text-white' : 'text-black'}`} />}
        </div>
        <p className={`text-3xl font-black ${textColor === 'text-white' ? 'text-white' : 'text-black'} mb-0.5`}>{value}</p>
        <p className={`text-[10px] font-black ${textColor === 'text-white' ? 'text-white/80' : 'text-black/70'} uppercase tracking-wider`}>{label}</p>
      </div>
    </div>
  );
}
