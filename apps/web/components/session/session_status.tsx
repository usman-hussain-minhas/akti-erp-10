import Link from 'next/link';

import type { OperatorSessionState } from '../../app/lead-desk/operator-context';
import { SESSION_STATE_COPY } from './session_state';

export function SessionStatusNotice({ state }: { state: OperatorSessionState }) {
  const copy = SESSION_STATE_COPY[state];
  const tone =
    state === 'active'
      ? 'border-[var(--success)] bg-[#e7f3ec] text-[var(--success)]'
      : state === 'missing'
        ? 'border-[var(--warning)] bg-[#f7edd1] text-[var(--warning)]'
        : 'border-[var(--danger)] bg-[#f5dddd] text-[var(--danger)]';

  return (
    <div className={`min-w-0 break-words rounded-md border px-3 py-2 text-sm ${tone}`}>
      <p className="m-0 font-medium">{copy.label}</p>
      <p className="m-0">{copy.message}</p>
      {state === 'active' ? null : (
        <Link className="mt-2 inline-flex font-medium underline underline-offset-4" href="/app/settings?section=advanced-diagnostics#advanced-diagnostics">
          Set up session
        </Link>
      )}
    </div>
  );
}
