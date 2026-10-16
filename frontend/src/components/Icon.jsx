// Small inline icon set (lucide-style, stroke based). Usage: <Icon name="cart" size={20} />
const P = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  x: <><path d="M18 6 6 18M6 6l12 12" /></>,
  check: <><path d="m5 12 5 5 9-10" /></>,
  chevDown: <><path d="m6 9 6 6 6-6" /></>,
  chevLeft: <><path d="m15 6-6 6 6 6" /></>,
  chevRight: <><path d="m9 6 6 6-6 6" /></>,
  arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  filter: <><path d="M3 5h18l-7 8v6l-4-2v-4z" /></>,
  truck: <><path d="M2 6h11v10H2zM13 10h5l3 3v3h-8" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.5-3M4 5v4h4M4 13a8 8 0 0 0 14.5 3M20 19v-4h-4" /></>,
  box: <><path d="m3 7 9-4 9 4v10l-9 4-9-4z" /><path d="m3 7 9 4 9-4M12 11v10" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 6 10 6a9.7 9.7 0 0 0 4.4-1" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a7 7 0 0 1 4 6" /></>,
  dollar: <><path d="M12 2v20M17 6.5C16 5 14.2 4.5 12 4.5c-2.8 0-4.5 1.3-4.5 3.3 0 5 9.5 2.4 9.5 7.4 0 2-1.8 3.3-5 3.3-2.3 0-4.3-.7-5.3-2.3" /></>,
  logout: <><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" /></>,
  store: <><path d="M3 9 5 4h14l2 5M3 9v11h18V9M3 9c0 2 4 2 4.5 0 .5 2 4 2 4.5 0 .5 2 4 2 4.5 0 .5 2 4.5 2 4.5 0" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  alert: <><path d="M12 3 2 21h20z" /><path d="M12 10v5M12 18v.5" /></>,
  heart: <><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  pin: <><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  ruler: <><path d="m3 17 14-14 4 4L7 21H3z" /><path d="m13 7 4 4M9 11l2 2M5 15l2 2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></>,
};

export default function Icon({ name, size = 20, stroke = 2, className = "", ...rest }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true" {...rest}
    >
      {P[name] || null}
    </svg>
  );
}
