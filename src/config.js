// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gaia-competitor-analytics-production.up.railway.app';

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD; 