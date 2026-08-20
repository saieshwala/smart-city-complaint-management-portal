import crypto from 'crypto';
import path from 'path';

const COMPLAINT_ID_PREFIX = 'CIV';

/**
 * Generates a complaint ID in the format CIV-YYYY-NNNNNN
 * @param sequence - The sequential number for the complaint
 * @returns Formatted complaint ID string
 */
export function generateComplaintId(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(6, '0');
  return `${COMPLAINT_ID_PREFIX}-${year}-${paddedSequence}`;
}

/**
 * Generates a random public ID for external-facing references
 * @returns A random 12-character hex string
 */
export function generatePublicId(): string {
  return crypto.randomBytes(6).toString('hex');
}

/**
 * Sanitizes a filename by removing unsafe characters
 * @param filename - The original filename
 * @returns A sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const name = path.basename(filename, ext);
  const sanitized = name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `${sanitized || 'file'}${ext}`;
}

/**
 * Generates a storage key for complaint images
 * @param complaintId - The complaint ID
 * @param filename - The original filename
 * @returns A storage key path
 */
export function generateStorageKey(complaintId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  return `complaints/${complaintId}/${timestamp}-${sanitized}`;
}

/**
 * Formats address components into a single formatted string
 * @param components - Object containing address parts
 * @returns Formatted address string
 */
export function formatAddress(components: {
  street?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts = [
    components.street,
    components.area,
    components.city,
    components.district,
    components.state,
    components.postalCode,
    components.country,
  ].filter(Boolean);
  return parts.join(', ');
}

/**
 * Validates whether latitude and longitude values are within valid ranges
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Calculates the SLA deadline from a submission date and SLA hours
 * @param submittedAt - The date the complaint was submitted
 * @param slaHours - Number of hours for the SLA
 * @returns The deadline date
 */
export function calculateSlaDeadline(submittedAt: Date, slaHours: number): Date {
  const deadline = new Date(submittedAt.getTime());
  deadline.setHours(deadline.getHours() + slaHours);
  return deadline;
}

/**
 * Checks if a given expected date has passed (i.e., the task is overdue)
 * @param expectedAt - The expected completion date
 * @returns True if the current time is past the expected date
 */
export function isOverdue(expectedAt: Date): boolean {
  return new Date() > expectedAt;
}

/**
 * Converts text into a URL-friendly slug
 * @param text - The text to slugify
 * @returns A lowercase, hyphen-separated slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
