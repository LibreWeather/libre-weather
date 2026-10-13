import React from 'react';
import { navigate } from '@/hooks/useLocation';

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

/** In-app link: navigates without a reload, but leaves modified clicks (new tab, etc.) to the browser. */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ to, onClick, target, ...rest }, ref) => (
  <a
    {...rest}
    ref={ref}
    href={to}
    target={target}
    onClick={(event) => {
      onClick?.(event);
      const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
      if (event.defaultPrevented || modified || (target && target !== '_self')) return;
      event.preventDefault();
      navigate(to);
    }} />
));

Link.displayName = 'Link';

export default Link;
