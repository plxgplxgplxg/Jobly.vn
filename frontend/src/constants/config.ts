// App configuration
export const APP_CONFIG = {
  APP_NAME: 'Jobly.vn',
  APP_DESCRIPTION: 'Nền tảng tuyển dụng hàng đầu Việt Nam',
  
  // File upload
  MAX_CV_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_CV_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_CV_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  
  // Debounce
  SEARCH_DEBOUNCE_MS: 300,
  
  // Property-based testing
  PBT_NUM_RUNS: 100,
  
  // Performance
  MAX_BUNDLE_SIZE_KB: 500,
  
  // Timeouts
  API_TIMEOUT_MS: 30000,
  
  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user_data',
    THEME: 'theme_preference',
  },
} as const
