import React from 'react';

interface RatingCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const RatingCircle: React.FC<RatingCircleProps> = ({ percentage, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (p: number) => {
    if (p >= 70) return '#22c55e'; // green-500
    if (p >= 40) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  const color = getColor(percentage);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151" // gray-700
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="absolute text-white font-bold text-sm">
        {Math.round(percentage)}<span className="text-xs">%</span>
      </span>
    </div>
  );
};

export default RatingCircle;