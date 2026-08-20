# CivicConnect India - Database Schema

## Database: PostgreSQL 16 + PostGIS

## Entity Relationship

```
Users ──< Complaints ──< ComplaintImages
                    ──< ComplaintStatusHistory
                    ──< AuditLogs
                    >── Categories
                    >── Subcategories
                    >── Authorities
                    >── Departments

Authorities ──< Departments
            ──< RoutingRules
            ──< SlaRules
            ──< IntegrationConfigs

Categories ──< Subcategories

AdminUsers ──< AuditLogs
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE, NULLABLE |
| password_hash | VARCHAR(255) | NULLABLE (for OTP-only auth) |
| email_verified | BOOLEAN | DEFAULT false |
| phone_verified | BOOLEAN | DEFAULT false |
| avatar_url | VARCHAR(500) | NULLABLE |
| preferred_language | VARCHAR(5) | DEFAULT 'en' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### admin_users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM | SUPER_ADMIN, AUTHORITY_ADMIN, DEPARTMENT_ADMIN, OFFICER, VIEWER |
| authority_id | UUID | FK -> authorities, NULLABLE |
| department_id | UUID | FK -> departments, NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| last_login_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### authorities
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| type | ENUM | MUNICIPAL_CORPORATION, MUNICIPALITY, NAGAR_PANCHAYAT, OTHER |
| state | VARCHAR(100) | NOT NULL |
| district | VARCHAR(100) | NOT NULL |
| city | VARCHAR(100) | NOT NULL |
| jurisdiction_boundary | GEOMETRY(POLYGON) | NULLABLE (PostGIS) |
| website | VARCHAR(500) | NULLABLE |
| contact_email | VARCHAR(255) | NULLABLE |
| contact_phone | VARCHAR(20) | NULLABLE |
| api_available | BOOLEAN | DEFAULT false |
| api_endpoint | VARCHAR(500) | NULLABLE |
| integration_type | ENUM | API, EMAIL, WEBHOOK, PORTAL_LINK, MANUAL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### departments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| authority_id | UUID | FK -> authorities, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL |
| description | TEXT | NULLABLE |
| contact_email | VARCHAR(255) | NULLABLE |
| contact_phone | VARCHAR(20) | NULLABLE |
| escalation_hours | INTEGER | DEFAULT 48 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| description | TEXT | NULLABLE |
| icon | VARCHAR(100) | NULLABLE |
| display_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### subcategories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| category_id | UUID | FK -> categories, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | NOT NULL |
| description | TEXT | NULLABLE |
| display_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### complaints
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| public_id | VARCHAR(20) | UNIQUE, NOT NULL (e.g., CIV-2026-000184) |
| user_id | UUID | FK -> users, NOT NULL |
| category_id | UUID | FK -> categories, NULLABLE |
| subcategory_id | UUID | FK -> subcategories, NULLABLE |
| authority_id | UUID | FK -> authorities, NULLABLE |
| department_id | UUID | FK -> departments, NULLABLE |
| assigned_officer_id | UUID | FK -> admin_users, NULLABLE |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | NOT NULL |
| ai_generated_description | TEXT | NULLABLE |
| status | ENUM | (see status list) |
| priority | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| severity | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| location | GEOMETRY(POINT, 4326) | NULLABLE (PostGIS) |
| latitude | DECIMAL(10, 8) | NULLABLE |
| longitude | DECIMAL(11, 8) | NULLABLE |
| address | TEXT | NULLABLE |
| ward | VARCHAR(100) | NULLABLE |
| city | VARCHAR(100) | NULLABLE |
| district | VARCHAR(100) | NULLABLE |
| state | VARCHAR(100) | NULLABLE |
| country | VARCHAR(100) | DEFAULT 'India' |
| postal_code | VARCHAR(10) | NULLABLE |
| location_source | ENUM | EXIF, BROWSER, MANUAL |
| external_reference | VARCHAR(255) | NULLABLE |
| external_status | VARCHAR(100) | NULLABLE |
| integration_status | ENUM | PENDING, SUBMITTED, SUCCESS, FAILED |
| integration_error | TEXT | NULLABLE |
| retry_count | INTEGER | DEFAULT 0 |
| last_submission_attempt | TIMESTAMPTZ | NULLABLE |
| reported_at | TIMESTAMPTZ | NOT NULL |
| submitted_at | TIMESTAMPTZ | NULLABLE |
| received_at | TIMESTAMPTZ | NULLABLE |
| resolved_at | TIMESTAMPTZ | NULLABLE |
| closed_at | TIMESTAMPTZ | NULLABLE |
| expected_resolution_at | TIMESTAMPTZ | NULLABLE |
| citizen_verified | BOOLEAN | NULLABLE |
| citizen_verification_note | TEXT | NULLABLE |
| admin_notes | TEXT | NULLABLE |
| is_public | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

**Complaint Statuses**: DRAFT, ANALYZING, AWAITING_USER_CONFIRMATION, READY_TO_SUBMIT, SUBMITTED, RECEIVED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, NEEDS_INFORMATION, RESOLVED, CLOSED, REJECTED, DUPLICATE, FAILED_SUBMISSION

### complaint_images
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| complaint_id | UUID | FK -> complaints, NOT NULL |
| storage_key | VARCHAR(500) | NOT NULL |
| thumbnail_key | VARCHAR(500) | NULLABLE |
| original_filename | VARCHAR(255) | NOT NULL |
| mime_type | VARCHAR(50) | NOT NULL |
| file_size | INTEGER | NOT NULL |
| width | INTEGER | NULLABLE |
| height | INTEGER | NULLABLE |
| exif_timestamp | TIMESTAMPTZ | NULLABLE |
| exif_latitude | DECIMAL(10, 8) | NULLABLE |
| exif_longitude | DECIMAL(11, 8) | NULLABLE |
| exif_device | VARCHAR(255) | NULLABLE |
| location_source | ENUM | EXIF, BROWSER, MANUAL |
| image_hash | VARCHAR(64) | NULLABLE (perceptual hash) |
| is_primary | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### complaint_status_history
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| complaint_id | UUID | FK -> complaints, NOT NULL |
| old_status | VARCHAR(50) | NULLABLE |
| new_status | VARCHAR(50) | NOT NULL |
| changed_by_user_id | UUID | FK -> users, NULLABLE |
| changed_by_admin_id | UUID | FK -> admin_users, NULLABLE |
| reason | TEXT | NULLABLE |
| metadata | JSONB | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### ai_analyses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| complaint_id | UUID | FK -> complaints, NOT NULL |
| image_id | UUID | FK -> complaint_images, NULLABLE |
| provider | VARCHAR(50) | NOT NULL |
| category | VARCHAR(100) | NULLABLE |
| subcategory | VARCHAR(100) | NULLABLE |
| confidence | DECIMAL(5, 4) | NULLABLE |
| severity | VARCHAR(20) | NULLABLE |
| evidence | JSONB | NULLABLE |
| explanation | TEXT | NULLABLE |
| raw_response | JSONB | NULLABLE |
| generated_title | TEXT | NULLABLE |
| generated_description | TEXT | NULLABLE |
| processing_time_ms | INTEGER | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### routing_rules
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| authority_id | UUID | FK -> authorities, NOT NULL |
| category_id | UUID | FK -> categories, NOT NULL |
| subcategory_id | UUID | FK -> subcategories, NULLABLE |
| department_id | UUID | FK -> departments, NOT NULL |
| priority | ENUM | DEFAULT MEDIUM |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### sla_rules
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| authority_id | UUID | FK -> authorities, NOT NULL |
| category_id | UUID | FK -> categories, NULLABLE |
| priority | ENUM | NULLABLE |
| resolution_hours | INTEGER | NOT NULL |
| escalation_hours | INTEGER | NULLABLE |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### integration_configs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| authority_id | UUID | FK -> authorities, NOT NULL |
| type | ENUM | API, EMAIL, WEBHOOK, PORTAL_LINK, MANUAL |
| config | JSONB | NOT NULL (encrypted sensitive fields) |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users, NOT NULL |
| complaint_id | UUID | FK -> complaints, NULLABLE |
| type | VARCHAR(50) | NOT NULL |
| channel | ENUM | EMAIL, SMS, PUSH, IN_APP |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL |
| status | ENUM | PENDING, SENT, FAILED |
| sent_at | TIMESTAMPTZ | NULLABLE |
| read_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| admin_id | UUID | FK -> admin_users, NULLABLE |
| user_id | UUID | FK -> users, NULLABLE |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | NULLABLE |
| old_values | JSONB | NULLABLE |
| new_values | JSONB | NULLABLE |
| ip_address | VARCHAR(45) | NULLABLE |
| user_agent | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### otp_codes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users, NULLABLE |
| email | VARCHAR(255) | NULLABLE |
| phone | VARCHAR(20) | NULLABLE |
| code | VARCHAR(6) | NOT NULL |
| type | ENUM | EMAIL_VERIFY, PHONE_VERIFY, LOGIN |
| expires_at | TIMESTAMPTZ | NOT NULL |
| used_at | TIMESTAMPTZ | NULLABLE |
| attempts | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Complaints
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_department_id ON complaints(department_id);
CREATE INDEX idx_complaints_authority_id ON complaints(authority_id);
CREATE INDEX idx_complaints_public_id ON complaints(public_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_location ON complaints USING GIST(location);
CREATE INDEX idx_complaints_assigned_officer ON complaints(assigned_officer_id);

-- Status History
CREATE INDEX idx_status_history_complaint ON complaint_status_history(complaint_id);
CREATE INDEX idx_status_history_created ON complaint_status_history(created_at);

-- Images
CREATE INDEX idx_images_complaint ON complaint_images(complaint_id);
CREATE INDEX idx_images_hash ON complaint_images(image_hash);

-- Departments
CREATE INDEX idx_departments_authority ON departments(authority_id);

-- Routing Rules
CREATE INDEX idx_routing_authority_category ON routing_rules(authority_id, category_id);

-- Audit Logs
CREATE INDEX idx_audit_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_complaint ON notifications(complaint_id);
```
