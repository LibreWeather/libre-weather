import React from 'react';

const errorClass =
  'weatherError forecast-col mb-5 flex items-center justify-between gap-3 rounded-[0.625rem] border ' +
  'border-[rgb(255_120_120/0.25)] bg-[rgb(255_90_90/0.08)] px-3.5 py-2.5 text-base';

const ForecastError = ({ onRetry, label }: { onRetry: () => void; label: string }) => (
  <div className={errorClass} role="alert">
    <span>Couldn&apos;t load {label}.</span>
    <button
      type="button"
      className="rounded border border-[#f8f9fa] px-2 py-1 text-sm text-[#f8f9fa] hover:bg-[#f8f9fa] hover:text-black"
      onClick={onRetry}>
      Try again
    </button>
  </div>
);

export default ForecastError;
