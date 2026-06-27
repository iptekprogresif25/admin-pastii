export const CACHE_TAGS = {
  // Shared / Reference Data
  DIVISIONS: 'global:divisions',
  PROFILES: 'global:profiles',
  LOCATIONS: 'global:locations',
  EVENTS: 'global:events',
  
  // Specific Modules
  ATTENDANCE: 'module:attendance',
  FINANCE: 'module:finance',
} as const;

export const CACHE_TTL = {
  SHORT: 60,       // 1 minute
  MEDIUM: 300,     // 5 minutes
  LONG: 3600,      // 1 hour
} as const;
