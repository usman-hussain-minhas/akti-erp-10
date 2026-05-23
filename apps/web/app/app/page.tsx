type PortalShellState = 'empty' | 'loading' | 'error' | 'permission_denied' | 'degraded';

type ScreenStateCopy = {
  title: string;
  message: string;
};

const SCREEN_TITLE = 'My Work';
const SCREEN_PURPOSE = 'This shell gives you one place to open approved work areas as they become available.';
const SCREEN_CONTEXT = 'This Phase 1 screen is intentionally minimal and does not show live work widgets yet.';

const STATE_COPY: Record<PortalShellState, ScreenStateCopy> = {
  empty: {
    title: 'No work widgets yet',
    message: 'Work widgets are deferred until dedicated APIs and capabilities are approved.',
  },
  loading: {
    title: 'Loading',
    message: 'Please wait while this screen loads.',
  },
  error: {
    title: 'Something went wrong',
    message: 'Please try again. If this continues, contact support.',
  },
  permission_denied: {
    title: 'Access denied',
    message: 'You do not have permission to open this screen.',
  },
  degraded: {
    title: 'Limited mode',
    message: 'Some features are temporarily unavailable.',
  },
};

const DEFAULT_STATE: PortalShellState = 'empty';

export default function PortalShellPage() {
  const currentState = DEFAULT_STATE;
  const state = STATE_COPY[currentState];

  return (
    <main
      style={{
        margin: '0 auto',
        maxWidth: '56rem',
        padding: '1.25rem 1rem 2rem',
        display: 'grid',
        gap: '1rem',
      }}
    >
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', lineHeight: 1.2 }}>{SCREEN_TITLE}</h1>
        <p style={{ margin: 0 }}>{SCREEN_PURPOSE}</p>
        <p style={{ margin: 0 }}>{SCREEN_CONTEXT}</p>
      </header>

      <section
        aria-labelledby="portal-state-heading"
        style={{ border: '1px solid #d7dce5', borderRadius: '0.5rem', padding: '1rem', display: 'grid', gap: '0.5rem' }}
      >
        <h2 id="portal-state-heading" style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1.3 }}>
          {state.title}
        </h2>
        <p style={{ margin: 0 }}>{state.message}</p>
      </section>

      <section
        aria-labelledby="portal-nav-heading"
        style={{ border: '1px solid #d7dce5', borderRadius: '0.5rem', padding: '1rem', display: 'grid', gap: '0.5rem' }}
      >
        <h2 id="portal-nav-heading" style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1.3 }}>
          Navigation status
        </h2>
        <p style={{ margin: 0 }}>
          The navigation map and work summary sources are defined, but live API-backed portal widgets are deferred in
          this phase.
        </p>
        <p style={{ margin: 0 }}>
          Capability coverage is temporary in Phase 1 and must not be treated as the final portal permission design.
        </p>
      </section>

      <section
        aria-labelledby="portal-scope-heading"
        style={{ border: '1px solid #d7dce5', borderRadius: '0.5rem', padding: '1rem', display: 'grid', gap: '0.5rem' }}
      >
        <h2 id="portal-scope-heading" style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1.3 }}>
          Scope guardrails
        </h2>
        <p style={{ margin: 0 }}>
          This screen does not show fake data, placeholder actions, or cross-organization information.
        </p>
      </section>
    </main>
  );
}
