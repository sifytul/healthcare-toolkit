# Healthcare Toolkit - Implementation Plan

## Project Overview
A healthcare management tool to create a database of antibiograms for improving awareness of antibiotic resistance.

## Requirements Summary

### User Roles
1. **Doctor** - View all patient details, make diagnoses, request reviews
2. **Patient** - View own history, upload diagnostic reports (no delete)
3. **Diagnostic Center** - Upload reports for specific patients by ID

### Patient Data
- Doctor visit history
- Relationships
- Previous/current medical conditions
- Antibiogram reports
- Radiology reports
- Medication history

### PDF Report Processing
- Store PDF files
- Extract lab parameters (CBC, RBC, WBC, Platelet, Hb, ESR, Blood Sugar, Lipid Profile, Electrolyte, ECG, USG)

### Analytics
- Antibiotic sensitivity charts by microorganism, disease, and current

---

## Implementation Phases

### Phase 1: Backend Models & Auth (Priority: High)
- [x] 1.1 Extend User model with role field (Doctor/Patient/DiagnosticCenter)
- [x] 1.2 Create Patient model with demographics, visits, relationships
- [x] 1.3 Create Report model (antibiogram, radiology, lab results)
- [x] 1.4 Implement JWT authentication with role-based middleware
- [x] 1.5 Create auth routes (signup/login) with role selection

### Phase 2: Frontend Auth Integration (Priority: High)
- [x] 2.1 Update authContext to handle roles and protect routes
- [x] 2.2 Create role-based route guards
- [x] 2.3 Build sign-in page with role selection
- [x] 2.4 Update Navbar based on user role

### Phase 3: Patient Management (Priority: High)
- [ ] 3.1 Create Patient API routes (CRUD)
- [ ] 3.2 Connect createPatient page to backend
- [ ] 3.3 Connect searchPatients to backend
- [ ] 3.4 Load patient data in PatientDashboard
- [ ] 3.5 Implement Visits, Demographics, Relationships

### Phase 4: Report Management (Priority: Medium)
- [ ] 4.1 Create Report model and API routes
- [ ] 4.2 Implement PDF file upload (multer + storage)
- [ ] 4.3 Build radiology report viewing page
- [ ] 4.4 Build lab results/form entry page

### Phase 5: Antibiogram & Analytics (Priority: Medium)
- [ ] 5.1 Create Antibiogram data model
- [ ] 5.2 Build antibiogram chart components
- [ ] 5.3 Implement sensitivity overview dashboard

### Phase 6: Multi-Doctor Review (Priority: Low)
- [ ] 6.1 Create Review workflow model
- [ ] 6.2 Implement review request system
- [ ] 6.3 Build review interface for doctors