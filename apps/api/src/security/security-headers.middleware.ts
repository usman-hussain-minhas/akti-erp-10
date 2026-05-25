export const API_SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'no-referrer'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
];

export type SecurityHeaderResponse = {
  setHeader(name: string, value: string): void;
};

export function createSecurityHeadersMiddleware(enabled = true) {
  return (_request: unknown, response: SecurityHeaderResponse, next: () => void): void => {
    if (enabled) {
      for (const [name, value] of API_SECURITY_HEADERS) {
        response.setHeader(name, value);
      }
    }

    next();
  };
}
