import React from 'react';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import './Icon.less';

type IconProps = {
  icon: IconDefinition;
  className?: string;
  /** Degrees clockwise, e.g. a wind bearing. */
  rotate?: number;
  /** Makes the icon meaningful to screen readers; otherwise it's hidden from them. */
  'aria-label'?: string;
};

/** Font Awesome icon drawn straight from its path data, without the Font Awesome runtime. */
const Icon = ({ icon, className, rotate, 'aria-label': label }: IconProps) => {
  const [width, height, , , path] = icon.icon;
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox={`0 0 ${width} ${height}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false">
      {(Array.isArray(path) ? path : [path]).map((d) => <path key={d} d={d} fill="currentColor" />)}
    </svg>
  );
};

export default Icon;
