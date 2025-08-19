export const FLAGS = {
  BUNDLE_SEGMENTED_FUNNELS: import.meta.env.VITE_FLAG_BUNDLE_SEGMENTED_FUNNELS === 'true'
};

export type Flags = typeof FLAGS;


