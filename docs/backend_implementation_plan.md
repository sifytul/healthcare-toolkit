# Backend Implementation Plan - Healthcare Toolkit

## Context

The IMPLEMENTATION_PLAN.md shows:
- **Phase 1-3**: Complete (auth, patient management backend)
- **Phase 4**: In Progress (Report Management - API routes pending)
- **Phase 5-12**: Not started

The existing `reportModel.js` already exists with comprehensive schemas for antibiogram, radiology, and lab results. The main gap is the **Report API routes** and **Antibiogram analytics**.

## Scope

Implement the backend for:
1. **Report Management (Phase 4)** - API routes for CRUD operations
2. **Antibiogram & Analytics (Phase 6)** - Data model and API endpoints

---

## Implementation Plan

### Step 1: Create Report Controller (`server/src/controllers/reportController.js`)

Created controller with functions:
- `createReport` - Upload/create report for patient
- `getAllReports` - List reports with filtering
- `getReportById` - Get single report
- `getPatientReports` - Get reports for a specific patient
- `updateReport` - Update report metadata/status
- `deleteReport` - Soft delete (mark as deleted)
- `downloadReport` - Get file download URL

**Reused existing patterns from** `patientController.js` and `diagnosisController.js`

### Step 2: Create Report Routes (`server/src/routes/reportRoutes.js`)

Defined routes:
```
POST   /                    - createReport (doctor, diagnostic_center)
GET    /                    - getAllReports (doctor, admin)
GET    /patient/:patientId  - getPatientReports (authorized users)
GET    /:id                 - getReportById
PUT    /:id                 - updateReport
DELETE /:id                 - deleteReport (soft delete)
GET    /:id/download        - downloadReport
```

Applied middleware: `verifyToken` + role-based authorization

### Step 3: Register Routes in allRoutes.js

Added to `server/src/routes/allRoutes.js`:
```javascript
import reportRoutes from "./reportRoutes.js";
router.use("/reports", reportRoutes);
```

### Step 4: Create Antibiogram Model (`server/src/models/antibiogramModel.js`)

Created new model with fields:
- `microorganism` - string (e.g., "E. coli", "S. aureus")
- `antibiotic` - string (e.g., "Amoxicillin", "Ciprofloxacin")
- `sensitivity` - enum: "sensitive", "intermediate", "resistant"
- `zoneSize` - number (mm)
- `MIC` - number (minimum inhibitory concentration)
- `patient_id` - ObjectId ref Patient
- `report_id` - ObjectId ref Report
- `location` - string (city/district)
- `hospital` - string
- `department` - string
- `sampleDate` - Date
- `sampleType` - string (blood, urine, sputum, etc.)
- `recordedBy` - ObjectId ref User

Added indexes for analytics queries:
- microorganism + antibiotic
- location + sampleDate
- sensitivity

### Step 5: Create Antibiogram Controller (`server/src/controllers/antibiogramController.js`)

Created controller with functions:
- `createAntibiogram` - Record antibiogram data
- `getAllAntibiograms` - List with filters
- `getByMicroorganism` - Get sensitivity by organism
- `getByRegion` - Get sensitivity by location
- `getAnalytics` - Aggregation for charts (sensitivity %, trends)
- `getTrendsOverTime` - Time-series data
- `getByDisease` - Get sensitivity filtered by diagnosis

### Step 6: Create Antibiogram Routes (`server/src/routes/antibiogramRoutes.js`)

Defined routes:
```
POST   /                    - createAntibiogram
GET    /                    - getAllAntibiograms
GET    /analytics           - getAnalytics (for charts)
GET    /by-microorganism/:microorganism - getByMicroorganism
GET    /by-region/:region   - getByRegion
GET    /trends              - getTrendsOverTime
GET    /by-disease/:diseaseCode - getByDisease
```

### Step 7: Register Antibiogram Routes in allRoutes.js

Added to `server/src/routes/allRoutes.js`:
```javascript
import antibiogramRoutes from "./antibiogramRoutes.js";
router.use("/antibiograms", antibiogramRoutes);
```

---

## Files Created

### New Files
- `server/src/controllers/reportController.js`
- `server/src/routes/reportRoutes.js`
- `server/src/models/antibiogramModel.js`
- `server/src/controllers/antibiogramController.js`
- `server/src/routes/antibiogramRoutes.js`

### Modified Files
- `server/src/routes/allRoutes.js` - Registered new routes

---

## API Endpoints Summary

### Reports API (`/api/v1/reports`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | / | Create new report | doctor, diagnostic_center |
| GET | / | List all reports | doctor, admin |
| GET | /patient/:patientId | Get patient reports | authorized |
| GET | /:id | Get single report | authorized |
| PUT | /:id | Update report | doctor, diagnostic_center |
| DELETE | /:id | Delete report (soft) | doctor, diagnostic_center, admin |
| GET | /:id/download | Get file URL | authorized |

### Antibiogram API (`/api/v1/antibiograms`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | / | Create antibiogram record | doctor, diagnostic_center |
| GET | / | List with filters | doctor, diagnostic_center, admin |
| GET | /analytics | Get analytics for charts | doctor, diagnostic_center, admin |
| GET | /by-microorganism/:microorganism | Get by organism | authorized |
| GET | /by-region/:region | Get by location | authorized |
| GET | /trends | Get time-series data | authorized |
| GET | /by-disease/:diseaseCode | Get by diagnosis | authorized |

---

## Verification

After implementation:
1. Start backend: `cd server && yarn dev`
2. Test Report API:
   - POST /api/v1/reports (create)
   - GET /api/v1/reports (list)
   - GET /api/v1/reports/patient/:patientId
3. Test Antibiogram API:
   - POST /api/v1/antibiograms
   - GET /api/v1/antibiograms/analytics
   - GET /api/v1/antibiograms/by-microorganism/E.%20coli
4. Verify routes are protected and return proper responses

---

## Notes

- PDF file upload (multer + storage) deferred to later iteration
- Report parsing engine (Python) deferred - only data model and API needed now
- Permissions reuse existing permission system from `middleware/auth.js`
- Follow exact response format: `{ success: true/false, message: string, data: object }`