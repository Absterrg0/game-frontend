import React from "react";

interface ProgressBarProps {
  total: number;
  joined: number;
  minMember: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  total,
  joined,
  minMember,
}) => {
  const progressPercentage = Math.min((joined / total) * 100, 100); // Ensure it doesn't exceed 100%
  const barOpacity = joined < minMember ? 0.5 : 1.0;

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-primary text-brand-black font-light">
          {joined} of {total} spots filled
        </span>
        <span className="text-sm font-primary text-brand-black/60">
          {progressPercentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div
          className="bg-brand-tertiary h-3 rounded-full transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            opacity: barOpacity,
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
