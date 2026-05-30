import { CRM_VISIBLE_LABEL } from './crm-alias.config';
import { PLATFORM_PRODUCT_NAME } from './platform-branding.config';

export const SHELL_ROUTE_TYPES = ['primary_navigation', 'system_navigation', 'diagnostics', 'hidden', 'future'] as const;

export type ShellRouteType = (typeof SHELL_ROUTE_TYPES)[number];

export type ShellRouteSection = 'primary' | 'system' | 'diagnostics' | 'hidden' | 'future';

export type ShellRouteMetadata = {
  route: string;
  type: ShellRouteType;
  label: string;
  description: string;
  visible: boolean;
  section: ShellRouteSection;
  capability_required?: string;
};

export type ShellCommandMetadata = {
  id: string;
  route: string;
  label: string;
  description: string;
  group: 'Navigation' | typeof CRM_VISIBLE_LABEL | 'Settings' | 'Help';
  keywords: readonly string[];
};

export const SHELL_ROUTES = {
  '/': {
    route: '/',
    type: 'hidden',
    label: `${PLATFORM_PRODUCT_NAME} scaffold`,
    description: 'Root scaffold route.',
    visible: false,
    section: 'hidden',
  },
  '/app': {
    route: '/app',
    type: 'primary_navigation',
    label: 'Mission Control',
    description: `Default ${PLATFORM_PRODUCT_NAME} shell`,
    visible: true,
    section: 'primary',
  },
  '/lead-desk/inbox': {
    route: '/lead-desk/inbox',
    type: 'primary_navigation',
    label: CRM_VISIBLE_LABEL,
    description: 'Open current CRM work',
    visible: true,
    section: 'primary',
  },
  '/app#module-launcher': {
    route: '/app#module-launcher',
    type: 'primary_navigation',
    label: 'Modules',
    description: 'View role-aware platform modules',
    visible: true,
    section: 'primary',
    capability_required: 'platform.modules.view',
  },
  '/lead-desk/create': {
    route: '/lead-desk/create',
    type: 'hidden',
    label: 'Create lead',
    description: `Open the existing ${CRM_VISIBLE_LABEL} intake route.`,
    visible: false,
    section: 'hidden',
  },
  '/app/settings': {
    route: '/app/settings',
    type: 'system_navigation',
    label: 'Settings',
    description: 'Control panel shell',
    visible: true,
    section: 'system',
  },
  '#diagnostics-region': {
    route: '#diagnostics-region',
    type: 'diagnostics',
    label: 'Diagnostics',
    description: 'Session setup and diagnostics boundary',
    visible: true,
    section: 'diagnostics',
  },
  '#help-region': {
    route: '#help-region',
    type: 'hidden',
    label: 'Help',
    description: 'Jump to the local Mission Control help region.',
    visible: false,
    section: 'hidden',
  },
} as const satisfies Record<string, ShellRouteMetadata>;

export const MODULES_ROUTE_ACTION_AUTHORITY = {
  dataSource: 'GET /platform/modules',
  approvedRoute: null,
  deferredRoute: '/modules',
  fallbackRoute: SHELL_ROUTES['/app#module-launcher'].route,
} as const;

export const SHELL_NAVIGATION_ROUTES = [
  SHELL_ROUTES['/app'],
  SHELL_ROUTES['/lead-desk/inbox'],
  SHELL_ROUTES['/app#module-launcher'],
] as const;

export const SHELL_SYSTEM_NAVIGATION_ROUTES = [SHELL_ROUTES['/app/settings'], SHELL_ROUTES['#diagnostics-region']] as const;

export const SHELL_COMMANDS: readonly ShellCommandMetadata[] = [
  {
    id: 'dashboard.open',
    route: SHELL_ROUTES['/app'].route,
    label: 'Open dashboard',
    description: 'Go to Mission Control overview.',
    group: 'Navigation',
    keywords: ['home', 'mission control', 'overview'],
  },
  {
    id: 'lead-desk.open',
    route: SHELL_ROUTES['/lead-desk/inbox'].route,
    label: `Open ${CRM_VISIBLE_LABEL}`,
    description: `Open the current ${CRM_VISIBLE_LABEL} inbox.`,
    group: CRM_VISIBLE_LABEL,
    keywords: ['crm', 'leads', 'inbox', 'follow up'],
  },
  {
    id: 'modules.view',
    route: SHELL_ROUTES['/app#module-launcher'].route,
    label: 'View modules',
    description: 'Jump to the role-aware Modules area.',
    group: 'Navigation',
    keywords: ['modules', 'apps', 'module cards'],
  },
  {
    id: 'lead-desk.create',
    route: SHELL_ROUTES['/lead-desk/create'].route,
    label: SHELL_ROUTES['/lead-desk/create'].label,
    description: SHELL_ROUTES['/lead-desk/create'].description,
    group: CRM_VISIBLE_LABEL,
    keywords: ['crm', 'new lead', 'intake', 'create'],
  },
  {
    id: 'settings.open',
    route: SHELL_ROUTES['/app/settings'].route,
    label: 'Open settings',
    description: 'Open the Settings control panel.',
    group: 'Settings',
    keywords: ['control panel', 'diagnostics', 'session'],
  },
  {
    id: 'diagnostics.open',
    route: SHELL_ROUTES['#diagnostics-region'].route,
    label: 'Open diagnostics',
    description: SHELL_ROUTES['#diagnostics-region'].description,
    group: 'Settings',
    keywords: ['diagnostics', 'session setup', 'technical setup'],
  },
  {
    id: 'help.open',
    route: SHELL_ROUTES['#help-region'].route,
    label: 'Open help',
    description: SHELL_ROUTES['#help-region'].description,
    group: 'Help',
    keywords: ['support', 'guide', 'help'],
  },
] as const;
