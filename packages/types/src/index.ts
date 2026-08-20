// ============================================================
// Enums
// ============================================================

export enum ComplaintStatus {
  DRAFT = 'DRAFT',
  ANALYZING = 'ANALYZING',
  AWAITING_USER_CONFIRMATION = 'AWAITING_USER_CONFIRMATION',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTED = 'SUBMITTED',
  RECEIVED = 'RECEIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  NEEDS_INFORMATION = 'NEEDS_INFORMATION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  DUPLICATE = 'DUPLICATE',
  FAILED_SUBMISSION = 'FAILED_SUBMISSION',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum LocationSource {
  EXIF = 'EXIF',
  BROWSER = 'BROWSER',
  MANUAL = 'MANUAL',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AUTHORITY_ADMIN = 'AUTHORITY_ADMIN',
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN',
  OFFICER = 'OFFICER',
  VIEWER = 'VIEWER',
}

export enum IntegrationType {
  API = 'API',
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  PORTAL_LINK = 'PORTAL_LINK',
  MANUAL = 'MANUAL',
}

export enum IntegrationStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum AuthorityType {
  MUNICIPAL_CORPORATION = 'MUNICIPAL_CORPORATION',
  MUNICIPALITY = 'MUNICIPALITY',
  NAGAR_PANCHAYAT = 'NAGAR_PANCHAYAT',
  OTHER = 'OTHER',
}

export enum OtpType {
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  PHONE_VERIFY = 'PHONE_VERIFY',
  LOGIN = 'LOGIN',
}

// ============================================================
// Interfaces
// ============================================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ImageClassificationResult {
  category: string;
  subcategory: string;
  confidence: number;
  severity: Severity;
  evidence: string[];
  explanation: string;
}

export interface GeocodingResult {
  country: string;
  state: string;
  district: string;
  city: string;
  ward: string;
  postalCode: string;
  formattedAddress: string;
}

export interface JurisdictionResult {
  authority: string;
  ward: string;
  departments: string[];
}

export interface ComplaintSubmissionResult {
  success: boolean;
  externalReference?: string;
  status: IntegrationStatus;
  error?: string;
}
