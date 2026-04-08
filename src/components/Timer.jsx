import React, { useState, useEffect } from 'react';

/**
 * A circular countdown timer component.
 * 
 * @param {Object} props
 * @param {number} props.seconds - Initial duration in seconds.
 * @param {function} props.onComplete - Callback when timer reaches zero.
 */
const Timer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onComplete]);

  // Calculate color based on time left
  const getColorClass = () => {
    if (timeLeft >= 10) return 'text-green-500';
    if (timeLeft >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStrokeColor = () => {
    if (timeLeft >= 10) return '#22c55e'; // green-500
    if (timeLeft >= 5) return '#eab308';  // yellow-500
    return '#ef4444';                     // red-500
  };

  const offset = circumference - (timeLeft / seconds) * circumference;

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-800"
        />
        {/* Progress Circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
          }}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-2xl font-bold font-mono ${getColorClass()}`}>
        {timeLeft}
      </span>
    </div>
  );
};

export default Timer;
