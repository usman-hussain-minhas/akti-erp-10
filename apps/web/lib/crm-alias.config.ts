export const CRM_VISIBLE_LABEL = 'CRM';

export const LEAD_DESK_TECHNICAL_ROUTE_PREFIX = '/lead-desk';

export const LEAD_DESK_TECHNICAL_MODULE_KEY = 'lead.desk';

export const CRM_VISIBLE_LABEL_RULE =
  'CRM is visible label only over existing Lead Desk technical surfaces; do not rename lead-desk routes, files, APIs, contracts, Prisma models, or data models.';

export const CRM_TECHNICAL_RENAME_FORBIDDEN = [
  'lead-desk routes',
  'lead-desk files',
  'lead-desk APIs',
  'Lead Desk contracts',
  'Lead Desk Prisma models',
  'Lead Desk data models',
] as const;

export const CRM_ALIAS = {
  visibleLabel: CRM_VISIBLE_LABEL,
  technicalRoutePrefix: LEAD_DESK_TECHNICAL_ROUTE_PREFIX,
  technicalModuleKey: LEAD_DESK_TECHNICAL_MODULE_KEY,
  visibleLabelRule: CRM_VISIBLE_LABEL_RULE,
  technicalRenameForbidden: CRM_TECHNICAL_RENAME_FORBIDDEN,
} as const;
