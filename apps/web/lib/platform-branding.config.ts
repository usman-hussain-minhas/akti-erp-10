export const PLATFORM_PRODUCT_NAME = 'AKTI Spark';

export const PLATFORM_LEGACY_PRODUCT_NAME = 'AKTI ERP';

export const PLATFORM_BRANDING = {
  productName: PLATFORM_PRODUCT_NAME,
  legacyProductName: PLATFORM_LEGACY_PRODUCT_NAME,
  themeDefault: 'system',
  flagshipMode: 'dark',
  lightModeSource: 'derived_from_dark_mode',
  cssTokensProvidedByBackend: false,
  databaseRecordRequired: false,
  semanticColorRoles: {
    brandIdentity: 'purple_violet',
    actionAndActivation: 'teal_cyan',
    warning: 'amber',
    success: 'emerald',
    danger: 'red_rose',
  },
} as const;
