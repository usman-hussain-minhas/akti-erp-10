'use client';

import { type FormEvent, useMemo, useState } from 'react';

type ScreenState = 'empty' | 'loading' | 'success' | 'error' | 'permission_denied' | 'degraded';

type SetupPayload = {
  slug: string;
  display_name: string;
  status: string;
  domain: string;
  is_primary: true;
};

type SetupResponse = {
  organization: {
    id: string;
    slug: string;
    display_name: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  domain: {
    id: string;
    organization_id: string;
    domain: string;
    is_primary: boolean;
    verified_at: string | null;
  };
  setup_state: string;
};

type FieldErrors = {
  slug?: string;
  display_name?: string;
  status?: string;
  domain?: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_PATTERN = /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

const STATE_COPY: Record<ScreenState, { title: string; message: string }> = {
  empty: {
    title: 'Ready to begin',
    message: 'Fill in the setup form to create your organization.',
  },
  loading: {
    title: 'Loading',
    message: 'Please wait while this screen loads.',
  },
  success: {
    title: 'Setup completed',
    message: 'Your organization setup has completed successfully.',
  },
  error: {
    title: 'Something went wrong',
    message: 'Please try again. If this continues, contact support.',
  },
  permission_denied: {
    title: 'Setup unavailable',
    message: 'Setup is not available after initialization is completed.',
  },
  degraded: {
    title: 'Limited mode',
    message: 'Some features are temporarily unavailable.',
  },
};

function validatePayload(payload: SetupPayload): FieldErrors {
  const errors: FieldErrors = {};

  if (payload.slug.length === 0) {
    errors.slug = 'Slug is required.';
  } else if (payload.slug.length > 64) {
    errors.slug = 'Slug must be 64 characters or fewer.';
  } else if (!SLUG_PATTERN.test(payload.slug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens only.';
  }

  if (payload.display_name.length === 0) {
    errors.display_name = 'Organization name is required.';
  } else if (payload.display_name.length > 160) {
    errors.display_name = 'Organization name must be 160 characters or fewer.';
  }

  if (payload.status.length === 0) {
    errors.status = 'Organization status is required.';
  } else if (payload.status.length > 64) {
    errors.status = 'Organization status must be 64 characters or fewer.';
  }

  if (payload.domain.length === 0) {
    errors.domain = 'Primary domain is required.';
  } else if (payload.domain.length > 253) {
    errors.domain = 'Primary domain must be 253 characters or fewer.';
  } else if (!DOMAIN_PATTERN.test(payload.domain)) {
    errors.domain = 'Enter a valid domain name.';
  }

  return errors;
}

export default function SetupOrganizationPage() {
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState('');
  const [domain, setDomain] = useState('');

  const [screenState, setScreenState] = useState<ScreenState>('empty');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<SetupResponse | null>(null);

  const stateCopy = useMemo(() => STATE_COPY[screenState], [screenState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: SetupPayload = {
      slug: slug.trim().toLowerCase(),
      display_name: displayName.trim(),
      status: status.trim(),
      domain: domain.trim().toLowerCase(),
      is_primary: true,
    };

    const errors = validatePayload(payload);
    setFieldErrors(errors);
    setResult(null);
    setMessage('');

    if (Object.keys(errors).length > 0) {
      setScreenState('error');
      setMessage('Please fix the highlighted form details and try again.');
      return;
    }

    setScreenState('loading');

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

    try {
      const response = await fetch(`${apiBaseUrl}/platform/setup/organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const json = (await response.json()) as SetupResponse;
        setResult(json);
        setScreenState('success');
        setMessage('Organization setup finished successfully.');
        return;
      }

      let responseMessage = '';
      try {
        const json = (await response.json()) as { message?: string | string[] };
        if (Array.isArray(json.message)) {
          responseMessage = json.message.join(' ');
        } else if (typeof json.message === 'string') {
          responseMessage = json.message;
        }
      } catch {
        responseMessage = '';
      }

      if (response.status === 400) {
        setScreenState('error');
        setMessage(responseMessage || 'Please review your details and try again.');
        return;
      }

      if (response.status === 409) {
        if (responseMessage.toLowerCase().includes('already completed')) {
          setScreenState('permission_denied');
          setMessage(responseMessage || STATE_COPY.permission_denied.message);
          return;
        }

        setScreenState('error');
        setMessage(responseMessage || 'This slug or domain is already in use.');
        return;
      }

      setScreenState('error');
      setMessage(responseMessage || STATE_COPY.error.message);
    } catch {
      setScreenState('error');
      setMessage('We could not reach the setup service. Please try again.');
    }
  }

  return (
    <main
      style={{
        margin: '0 auto',
        maxWidth: '40rem',
        padding: '1.25rem 1rem 2rem',
        display: 'grid',
        gap: '1rem',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.75rem', lineHeight: 1.2 }}>Set Up Organization</h1>

      <section style={{ border: '1px solid #d7dce5', borderRadius: '0.5rem', padding: '1rem', display: 'grid', gap: '0.5rem' }}>
        <p style={{ margin: 0 }}>{stateCopy.title}</p>
        <p style={{ margin: 0 }}>{stateCopy.message}</p>
        {message ? <p style={{ margin: 0 }}>{message}</p> : null}
        {result ? (
          <p style={{ margin: 0 }}>
            Created organization “{result.organization.display_name}” with primary domain “{result.domain.domain}”.
          </p>
        ) : null}
      </section>

      <section style={{ border: '1px solid #d7dce5', borderRadius: '0.5rem', padding: '1rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <label htmlFor="slug-input" style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ margin: 0 }}>Organization slug (required)</span>
            <input
              id="slug-input"
              name="slug"
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              aria-invalid={Boolean(fieldErrors.slug)}
              aria-describedby={fieldErrors.slug ? 'slug-error' : undefined}
              required
              maxLength={64}
              autoComplete="off"
            />
          </label>
          {fieldErrors.slug ? <p id="slug-error" style={{ margin: 0 }}>{fieldErrors.slug}</p> : null}

          <label htmlFor="display-name-input" style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ margin: 0 }}>Organization name (required)</span>
            <input
              id="display-name-input"
              name="display_name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-invalid={Boolean(fieldErrors.display_name)}
              aria-describedby={fieldErrors.display_name ? 'display-name-error' : undefined}
              required
              maxLength={160}
              autoComplete="off"
            />
          </label>
          {fieldErrors.display_name ? <p id="display-name-error" style={{ margin: 0 }}>{fieldErrors.display_name}</p> : null}

          <label htmlFor="status-input" style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ margin: 0 }}>Organization status (required)</span>
            <input
              id="status-input"
              name="status"
              type="text"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-invalid={Boolean(fieldErrors.status)}
              aria-describedby={fieldErrors.status ? 'status-error' : undefined}
              required
              maxLength={64}
              autoComplete="off"
            />
          </label>
          {fieldErrors.status ? <p id="status-error" style={{ margin: 0 }}>{fieldErrors.status}</p> : null}

          <label htmlFor="domain-input" style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ margin: 0 }}>Primary domain (required)</span>
            <input
              id="domain-input"
              name="domain"
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              aria-invalid={Boolean(fieldErrors.domain)}
              aria-describedby={fieldErrors.domain ? 'domain-error' : undefined}
              required
              maxLength={253}
              autoComplete="off"
            />
          </label>
          {fieldErrors.domain ? <p id="domain-error" style={{ margin: 0 }}>{fieldErrors.domain}</p> : null}

          <button type="submit" disabled={screenState === 'loading'}>
            {screenState === 'loading' ? 'Submitting setup...' : 'Start setup'}
          </button>
        </form>
      </section>
    </main>
  );
}
