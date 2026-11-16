import React from 'react';

import './PromptSheet.scss';

const sheet =
  'promptSheet relative flex w-full items-center gap-3 rounded-[0.875rem] border border-white/10 bg-clear/94 ' +
  'py-[0.65rem] pr-[0.65rem] pl-3 text-left text-[0.9rem] text-white ' +
  'shadow-[0_0.75rem_2.5rem_rgb(0_0_0/0.45)] backdrop-blur-[10px] reduce-transparency:bg-clear';

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const PromptSheet = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <aside className={className ? `${sheet} ${className}` : sheet} aria-label={label}>
    {children}
  </aside>
);
