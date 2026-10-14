import React from 'react';

const DAYS = 7;
const TICKS = 12;
const STATS = 6;

const Bone = ({ className = '' }: { className?: string }) => (
  <span
    className={
      'block rounded-md bg-white/7 in-[.is-animated]:animate-shine in-[.is-animated]:bg-shine ' +
      `motion-reduce:animate-none! motion-reduce:bg-none! ${className}`
    } />
);

type WeatherSkeletonProps = {
  animated?: boolean;
  /** Real content shown below the summary placeholder, where it sits once the forecast loads. */
  children?: React.ReactNode;
};

const WeatherSkeleton = ({ animated = true, children }: WeatherSkeletonProps) => (
  <div
    className={`weatherSkeleton flex flex-col items-center text-base ${animated ? 'is-animated' : ''}`}
    aria-busy={animated}
    aria-label="Loading forecast"
    role="status">
    <div className="mb-6 flex max-w-[48em] flex-wrap justify-center gap-x-5 gap-y-2 max-md:mb-4">
      {Array.from({ length: STATS }, (_, i) => <Bone key={i} className="h-[0.9rem] w-26 max-md:w-22" />)}
    </div>

    <div className="flex items-center gap-5">
      <Bone className="size-18 rounded-full! max-md:size-14" />
      <div className="flex flex-col gap-[0.6rem]">
        <Bone className="h-10 w-20" />
        <Bone className="h-[0.9rem] w-52 max-md:w-36" />
      </div>
    </div>
    <Bone className="mt-4 mb-5 h-7 w-44" />
    {children}

    <div className="forecast-col mb-8">
      <Bone className="h-6 w-full" />
      <div className="mt-3 flex justify-between">
        {Array.from({ length: TICKS }, (_, i) => (
          <Bone key={i} className={`size-7 ${i >= 8 ? 'max-md:hidden' : ''}`} />
        ))}
      </div>
    </div>

    <div className="forecast-col rounded-xl border border-white/8 bg-clear/45 p-1.5 max-md:p-1">
      {Array.from({ length: DAYS }, (_, i) => (
        <div
          className={
            'weatherSkeleton-day flex items-center gap-3 border-white/7 px-2.5 py-[0.8rem] not-first:border-t ' +
            'max-md:px-2 max-md:py-[0.7rem]'
          }
          key={i}>
          <Bone className="size-5 flex-none rounded-full!" />
          <Bone className="h-4 w-12 flex-none" />
          <Bone className="h-[0.65rem] flex-auto rounded-[1em]!" />
          <Bone className="size-4 flex-none rounded-full!" />
        </div>
      ))}
    </div>
  </div>
);

export default WeatherSkeleton;
