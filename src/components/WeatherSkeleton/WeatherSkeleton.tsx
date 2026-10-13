import React from 'react';

import './WeatherSkeleton.less';

const DAYS = 7;
const TICKS = 12;
const STATS = 6;

const Bone = ({ className = '' }: { className?: string }) => <span className={`bone ${className}`} />;

type WeatherSkeletonProps = {
  animated?: boolean;
  /** Real content shown below the summary placeholder, where it sits once the forecast loads. */
  children?: React.ReactNode;
};

const WeatherSkeleton = ({ animated = true, children }: WeatherSkeletonProps) => (
  <div
    className={`weatherSkeleton${animated ? ' is-animated' : ''}`}
    aria-busy={animated}
    aria-label="Loading forecast"
    role="status">
    <div className="weatherSkeleton-stats">
      {Array.from({ length: STATS }, (_, i) => <Bone key={i} className="bone-stat" />)}
    </div>

    <div className="weatherSkeleton-hero">
      <Bone className="bone-icon" />
      <div className="weatherSkeleton-summary">
        <Bone className="bone-temp" />
        <Bone className="bone-meta" />
      </div>
    </div>
    <Bone className="bone-description" />
    {children}

    <div className="weatherSkeleton-overview forecast-col">
      <Bone className="bone-bar" />
      <div className="weatherSkeleton-ticks">
        {Array.from({ length: TICKS }, (_, i) => <Bone key={i} className="bone-tick" />)}
      </div>
    </div>

    <div className="weatherSkeleton-days forecast-col">
      {Array.from({ length: DAYS }, (_, i) => (
        <div className="weatherSkeleton-day" key={i}>
          <Bone className="bone-dayicon" />
          <Bone className="bone-dayname" />
          <Bone className="bone-range" />
          <Bone className="bone-toggle" />
        </div>
      ))}
    </div>
  </div>
);

export default WeatherSkeleton;
