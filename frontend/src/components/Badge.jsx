const STYLES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-primary-50 text-primary-700 ring-primary-200',
};

/**
 * Maps common status strings to a sensible visual tone automatically,
 * or accepts an explicit `tone` prop to override.
 */
const STATUS_TONE_MAP = {
  active: 'success',
  present: 'success',
  paid: 'success',
  published: 'success',
  inactive: 'neutral',
  late: 'warning',
  partial: 'warning',
  pending: 'warning',
  absent: 'danger',
  unpaid: 'danger',
  'at risk': 'danger',
};

export default function Badge({ children, tone }) {
  const resolvedTone = tone || STATUS_TONE_MAP[String(children).toLowerCase()] || 'neutral';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STYLES[resolvedTone]}`}
    >
      {children}
    </span>
  );
}
