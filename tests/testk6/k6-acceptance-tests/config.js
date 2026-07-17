export const BASE_URL = __ENV.SNIPEIT_URL || 'http://localhost:8000';
export const API_TOKEN = __ENV.SNIPEIT_TOKEN || '';
export const THRESHOLDS = {
    API_RESPONSE_TIME: 2000,
    PAGE_LOAD_TIME: 3000,
};