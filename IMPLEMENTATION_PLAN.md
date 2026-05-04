# Healthcare Toolkit - Implementation Plan

## Project Overview

A healthcare management tool to create a database of antibiograms for improving awareness of antibiotic resistance.

## Requirements Summary

### User Roles

1. **Doctor**

   - Access patient history
   - Diagnose and prescribe
   - Request peer review
   - Approve/reject diagnosis
   - View all patient details

2. **Patient**

   - View personal history
   - Upload diagnostic reports
   - Cannot delete records

3. **Diagnostic Center**

   - Upload reports using patient ID
   - Cannot access full patient history

4. **Admin** (Future)

   - Manage system

5. **Government Analyst** (Future)
   - View epidemiological insights

### Patient Data

- Doctor visit history
- Relationships
- Previous/current medical conditions
- Antibiogram reports
- Radiology reports
- Lab reports
- Medication history
- Allergies
- Family history
- Disease history

### PDF Report Processing

- Store PDF files
- Extract lab parameters (CBC, RBC, WBC, Platelet, Hb, ESR, Blood Sugar, Lipid Profile, Electrolyte, ECG, USG)
- Support report types: CBC / RBS / Antibiogram / Radiology

### Analytics

- Antibiotic sensitivity charts by microorganism, disease, and location
- Resistance trends over time
- Region-based filtering
- Sensitivity vs Antibiotic chart
- Disease clustering and outbreak detection

---

## Implementation Phases

### Phase 1: Backend Models & Auth (Priority: High)

- [x] 1.1 Extend User model with role field (Doctor/Patient/DiagnosticCenter)
- [x] 1.2 Create Patient model with demographics, visits, relationships
- [x] 1.3 Create Report model (antibiogram, radiology, lab results)
- [x] 1.4 Implement JWT authentication with role-based middleware
- [x] 1.5 Create auth routes (signup/login) with role selection
- [x] 1.6 Add role enum: Doctor / Patient / DiagnosticCenter / Admin / Government Analyst
- [x] 1.7 Implement fine-grained permissions (permissions.js with 12 permission types)
- [x] 1.8 Add audit logging (auditLogModel.js + audit.js middleware)
- [x] 1.9 Implement patient consent system (consentModel.js + controller + routes)
- [x] 1.10 Add session/device tracking (sessionModel.js + auth updates)

### Phase 2: Frontend Auth Integration (Priority: High)

- [x] 2.1 Update authContext to handle roles and protect routes
- [x] 2.2 Create role-based route guards
- [x] 2.3 Build sign-in page with role selection
- [x] 2.4 Update Navbar based on user role

### Phase 3: Patient Management (Priority: High)

- [x] 3.1 Create Patient API routes (CRUD)
- [x] 3.2 Connect createPatient page to backend
- [x] 3.3 Connect searchPatients to backend
- [x] 3.4 Load patient data in PatientDashboard
- [x] 3.5 Implement Visits, Demographics, Relationships
- [x] 3.6 Create Visit model with doctor_id, patient_id, reason, notes, timestamp (embedded in Patient)
- [x] 3.7 Create Diagnosis model (ICD mapping) with ICD_code, description, severity, status
- [x] 3.8 Create Prescription model with drug_name, dosage, duration
- [x] 3.9 Build patient timeline API with visits, diagnoses, prescriptions
- [x] 3.10 Add filters (date, disease, doctor) - implemented in controllers
- [ ] 3.11 Update the UI to display patient details and history effectively

### Phase 4: Report Management (Priority: Medium)

- [x] 4.1 Create Report API routes with CRUD operations
- [x] 4.2 Implement PDF file upload (multer + storage/MinIO)
- [x] 4.3 Create report model with fields: id, patient_id, type (CBC/RBS/Antibiogram/Radiology), file_url, uploaded_by, diagnostic_center_id, extracted_data (JSON), status (uploaded/parsed/verified)
- [ ] 4.4 Integrate object storage (MinIO/S3)
- [ ] 4.5 Build radiology report viewing page
- [ ] 4.6 Build lab results/form entry page
- [ ] 4.7 Create report viewer UI

### Phase 5: Report Parsing Engine (Priority: Medium)

- [ ] 5.1 Build Python microservice for PDF parsing
- [ ] 5.2 Implement OCR if needed
- [ ] 5.3 Write extraction logic for:
  - CBC: RBC, WBC, Hb, Platelet, ESR
  - Blood Sugar
  - Lipid Profile
  - Electrolytes
  - Antibiogram
- [ ] 5.4 Connect via message queue (Kafka)
- [ ] 5.5 Pipeline: PDF Upload → OCR → Parsing → NLP extraction → Structured JSON
- [ ] 5.6 Update report status based on parsing result

### Phase 6: Antibiogram & Analytics (Priority: Medium)

- [x] 6.1 Create Antibiogram data model with microorganism, antibiotic, sensitivity (S/I/R), patient_id, location, timestamp
- [ ] 6.2 Build antibiogram chart components
- [ ] 6.3 Implement sensitivity overview dashboard
- [x] 6.4 Build aggregation queries for sensitivity analysis
- [ ] 6.5 Create charts (frontend) for sensitivity vs antibiotic
- [ ] 6.6 Implement resistance trends visualization
- [ ] 6.7 Add region-based filtering

### Phase 7: Clinical Decision Support (Priority: Medium)

- [ ] 7.1 Build rule-based engine for antibiotic suggestions
- [ ] 7.2 Integrate antibiogram data
- [ ] 7.3 Display recommendations in UI (e.g., "High resistance to Ciprofloxacin detected. Consider alternative.")
- [ ] 7.4 Ensure doctor approval required for final decision

### Phase 8: Multi-Doctor Review System (Priority: Low)

- [x] 8.1 Create Review workflow model
- [x] 8.2 Implement review request system
- [ ] 8.3 Build review interface for doctors
- [x] 8.4 Workflow: Doctor submits diagnosis → Reviewed by General Physician → Specialist → Consultant
- [x] 8.5 Implement review features: comments, approval/rejection, version tracking

### Phase 9: Diagnostic Center Portal (Priority: Low)

- [ ] 9.1 Build diagnostic center dashboard
- [ ] 9.2 Implement bulk upload
- [ ] 9.3 Show parsing status
- [ ] 9.4 Upload reports using patient ID

### Phase 10: Epidemiological Surveillance (Priority: Low)

- [ ] 10.1 Build analytics service
- [ ] 10.2 Create heatmaps
- [ ] 10.3 Implement clustering logic
- [ ] 10.4 Disease clustering and outbreak detection
- [ ] 10.5 District-level trends visualization
- [ ] 10.6 Time-series graphs

### Phase 11: Notifications (Priority: Low)

- [x] 11.1 Implement WebSocket service
- [x] 11.2 Add notification system for:
  - Report upload alerts
  - Review requests
  - Critical value alerts

### Phase 12: Security & Compliance (Priority: Critical)

- [ ] 12.1 Implement encryption (TLS + at rest)
- [ ] 12.2 Add audit logs (immutable)
- [ ] 12.3 Implement access control logs
- [ ] 12.4 Build backup system
- [ ] 12.5 Implement disaster recovery

---

## Infrastructure

### Backend

- Node.js + Express
- Python (for parsing engine and ML tasks) in future

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn UI components
- React Router v6

### Database

- MongoDB (Mongoose ODM)

### Storage

- MinIO / Amazon S3

### Messaging

- Kafka

### Cache

- Redis

### Search

- Elasticsearch

### DevOps

- Docker
- Kubernetes
- CI/CD
- Prometheus + Grafana

---

## System Architecture

### Services

- Auth Service
- Patient Service
- Report Service
- Parsing Service (Python)
- Review Service
- Analytics Service
- Notification Service

---

## API Endpoints Structure

### Auth (/api/v1/auth)

- POST /register
- POST /login
- POST /logout
- GET /me

### Patients (/api/v1/patients)

- GET / (list)
- POST / (create)
- GET /:id (detail)
- PUT /:id (update)
- DELETE /:id

### Visits (/api/v1/visits)

- GET /patient/:patientId
- POST /
- PUT /:id

### Diagnoses (/api/v1/diagnoses)

- GET /patient/:patientId
- POST /
- PUT /:id

### Prescriptions (/api/v1/prescriptions)

- GET /patient/:patientId
- POST /
- PUT /:id

### Reports (/api/v1/reports)

- GET /patient/:patientId
- POST / (upload)
- GET /:id
- GET /:id/download

### Antibiograms (/api/v1/antibiograms)

- GET / (analytics)
- POST /
- GET /by-microorganism/:microorganism
- GET /by-region/:region

### Reviews (/api/v1/reviews)

- GET / (list all)
- GET /my-pending (pending for current user)
- GET /patient/:patientId
- GET /:id (detail)
- POST / (create request)
- PUT /:id/status (approve/reject/revision)
- POST /:id/comments
- DELETE /:id

---

## Execution Roadmap

### Week 1

- Patient domain + timeline UI
- Report upload + storage
- Parsing service (CBC + Antibiogram)
- Antibiogram dashboard
- ML-based recommendations for antibiotic selection (Future)

---

## Current Implementation Status

- Phase 1: Complete (auth & access control with permissions, audit logging, consent, sessions)
- Phase 2: Complete (frontend auth integration)
- Phase 3: Complete (patient management backend - models, diagnoses, prescriptions, timeline API)
- Phase 4: In Progress (report management - API routes, file upload done)
- Phase 6: Partial (antibiogram backend model & analytics done, frontend charts pending)
