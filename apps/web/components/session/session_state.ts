import type { OperatorSessionState } from '../../app/lead-desk/operator-context';

export const SESSION_STATE_COPY: Record<OperatorSessionState, { label: string; message: string }> = {
  active: {
    label: 'Session active',
    message: 'You can open approved work areas for this demo session.',
  },
  missing: {
    label: 'Session missing',
    message: 'Set up session in Advanced Diagnostics before loading protected work.',
  },
  expired_invalid: {
    label: 'Session expired/invalid',
    message: 'Open Advanced Diagnostics and replace the session token.',
  },
  limited_diagnostics: {
    label: 'Limited diagnostics mode',
    message: 'Session details cannot be fully checked in this browser context.',
  },
};
