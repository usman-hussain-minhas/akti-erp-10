export const PLATFORM_PRODUCT_NAME = 'Esbla Spark';

export const PLATFORM_LEGACY_PRODUCT_NAME = 'Esbla Spark';

export const PLATFORM_BRANDING = {
  productName: PLATFORM_PRODUCT_NAME,
  legacyProductName: PLATFORM_LEGACY_PRODUCT_NAME,
  effectiveBrandingEndpoint: 'GET /platform/branding/effective',
  readOnlyInPhase5C: true,
  uploadWriteUiAllowedInPhase5C: false,
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
