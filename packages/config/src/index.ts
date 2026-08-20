// ============================================================
// General Constants
// ============================================================

export const COMPLAINT_ID_PREFIX = 'CIV';

// ============================================================
// Image Upload Constants
// ============================================================

/** Maximum image size in bytes (10MB) */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const MAX_IMAGES_PER_COMPLAINT = 5;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// ============================================================
// Pagination Constants
// ============================================================

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

// ============================================================
// OTP Constants
// ============================================================

export const OTP_EXPIRY_MINUTES = 10;

export const OTP_MAX_ATTEMPTS = 3;

// ============================================================
// Retry Constants
// ============================================================

export const MAX_RETRY_COUNT = 3;

/** Retry delays in milliseconds: 30s, 2min, 10min */
export const RETRY_DELAYS = [30000, 120000, 600000];

// ============================================================
// JWT Constants
// ============================================================

export const JWT_ACCESS_EXPIRY = '15m';

export const JWT_REFRESH_EXPIRY = '7d';

// ============================================================
// Categories
// ============================================================

export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Waste Management',
    slug: 'waste-management',
    icon: 'trash',
    subcategories: [
      { name: 'Garbage Not Collected', slug: 'garbage-not-collected' },
      { name: 'Overflowing Dustbin', slug: 'overflowing-dustbin' },
      { name: 'Illegal Dumping', slug: 'illegal-dumping' },
      { name: 'Dead Animal Removal', slug: 'dead-animal-removal' },
      { name: 'Construction Debris', slug: 'construction-debris' },
    ],
  },
  {
    name: 'Roads',
    slug: 'roads',
    icon: 'road',
    subcategories: [
      { name: 'Pothole', slug: 'pothole' },
      { name: 'Road Damage', slug: 'road-damage' },
      { name: 'Footpath Damage', slug: 'footpath-damage' },
      { name: 'Speed Breaker Issue', slug: 'speed-breaker-issue' },
      { name: 'Road Marking Faded', slug: 'road-marking-faded' },
    ],
  },
  {
    name: 'Traffic',
    slug: 'traffic',
    icon: 'traffic-light',
    subcategories: [
      { name: 'Traffic Signal Not Working', slug: 'traffic-signal-not-working' },
      { name: 'Missing Sign Board', slug: 'missing-sign-board' },
      { name: 'Illegal Parking', slug: 'illegal-parking' },
      { name: 'Traffic Congestion', slug: 'traffic-congestion' },
      { name: 'Encroachment on Road', slug: 'encroachment-on-road' },
    ],
  },
  {
    name: 'Water',
    slug: 'water',
    icon: 'droplet',
    subcategories: [
      { name: 'No Water Supply', slug: 'no-water-supply' },
      { name: 'Water Leakage', slug: 'water-leakage' },
      { name: 'Contaminated Water', slug: 'contaminated-water' },
      { name: 'Low Pressure', slug: 'low-pressure' },
      { name: 'Broken Pipeline', slug: 'broken-pipeline' },
    ],
  },
  {
    name: 'Sewerage',
    slug: 'sewerage',
    icon: 'pipe',
    subcategories: [
      { name: 'Sewer Overflow', slug: 'sewer-overflow' },
      { name: 'Blocked Drain', slug: 'blocked-drain' },
      { name: 'Manhole Issue', slug: 'manhole-issue' },
      { name: 'Sewage on Road', slug: 'sewage-on-road' },
      { name: 'Bad Odor', slug: 'bad-odor' },
    ],
  },
  {
    name: 'Street Lighting',
    slug: 'street-lighting',
    icon: 'lightbulb',
    subcategories: [
      { name: 'Light Not Working', slug: 'light-not-working' },
      { name: 'Dim Light', slug: 'dim-light' },
      { name: 'Broken Pole', slug: 'broken-pole' },
      { name: 'Dangling Wires', slug: 'dangling-wires' },
      { name: 'New Light Required', slug: 'new-light-required' },
    ],
  },
  {
    name: 'Public Infrastructure',
    slug: 'public-infrastructure',
    icon: 'building',
    subcategories: [
      { name: 'Park Maintenance', slug: 'park-maintenance' },
      { name: 'Public Toilet', slug: 'public-toilet' },
      { name: 'Bus Stop Damage', slug: 'bus-stop-damage' },
      { name: 'Community Hall Issue', slug: 'community-hall-issue' },
      { name: 'Playground Issue', slug: 'playground-issue' },
    ],
  },
  {
    name: 'Environment',
    slug: 'environment',
    icon: 'leaf',
    subcategories: [
      { name: 'Air Pollution', slug: 'air-pollution' },
      { name: 'Noise Pollution', slug: 'noise-pollution' },
      { name: 'Water Pollution', slug: 'water-pollution' },
      { name: 'Tree Cutting', slug: 'tree-cutting' },
      { name: 'Open Burning', slug: 'open-burning' },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
    icon: 'more-horizontal',
    subcategories: [
      { name: 'Encroachment', slug: 'encroachment' },
      { name: 'Stray Animals', slug: 'stray-animals' },
      { name: 'Mosquito Menace', slug: 'mosquito-menace' },
      { name: 'Other Issue', slug: 'other-issue' },
    ],
  },
];
