/**
 * App config – API base URL (use env in production).
 * For S3 uploads you may have a separate media/upload endpoint.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export { API_BASE_URL };