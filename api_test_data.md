# API Documentation & Test Data

This document provides sample input data for testing the newly implemented endpoints.

## 1. Panchayat Endpoints (`/api/panchayat`)

### Login
- **URL**: `POST /api/panchayat/login`
- **Body**:
```json
{
  "panchayatName": "Hassan North",
  "password": "password123"
}
```

### Get Asha Workers
- **URL**: `GET /api/panchayat/asha-workers`
- **Auth**: Required (Panchayat Token)
- **Response**: List of workers under this panchayat.

### Create Village (Under Panchayat)
- **URL**: `POST /api/panchayat/villages`
- **Auth**: Required (Panchayat Token)
- **Body**:
```json
{
  "name": "Green Valley",
  "population": 1200,
  "numberOfHouses": 300,
  "locationUrl": "https://maps.google.com/?q=12.34,56.78"
}
```

### Create Worker (Under Panchayat)
- **URL**: `POST /api/panchayat/workers`
- **Auth**: Required (Panchayat Token)
- **Body**:
```json
{
  "name": "Jane Doe",
  "phone": "9876543210",
  "password": "workerpassword",
  "villageIds": ["VILLAGE_ID_1", "VILLAGE_ID_2"]
}
```

---

## 2. Admin Endpoints (`/api/admin`)

### Login
- **URL**: `POST /api/admin/login`
- **Body**:
```json
{
  "username": "admin",
  "password": "adminpassword"
}
```

### Create/Get Panchayat
- **URL**: `POST /api/admin/panchayat` (Create)
- **URL**: `GET /api/admin/panchayat` (Get all)
- **Auth**: Required (Admin Token)
- **Create Body**:
```json
{
  "name": "Hassan North",
  "code": "HN001",
  "password": "password123",
  "district": "Hassan",
  "taluk": "Hassan",
  "state": "Karnataka"
}
```

### Create/Get Village
- **URL**: `POST /api/admin/village` (Create)
- **URL**: `GET /api/admin/village` (Get all)
- **Auth**: Required (Admin Token)
- **Create Body**:
```json
{
  "name": "Blue River",
  "population": 800,
  "numberOfHouses": 200,
  "panchayatId": "PANCHAYAT_ID_HERE"
}
```

### Create/Get Worker
- **URL**: `POST /api/admin/worker` (Create)
- **URL**: `GET /api/admin/worker` (Get all)
- **Auth**: Required (Admin Token)
- **Create Body**:
```json
{
  "name": "John Smith",
  "phone": "9988776655",
  "password": "smithpassword",
  "villageIds": ["VILLAGE_ID_1"],
  "panchayatId": "PANCHAYAT_ID_HERE"
}
```

### Update/Delete Endpoints
- **Update/Delete Panchayat**: `PUT /api/admin/panchayat/:id`, `DELETE /api/admin/panchayat/:id`
- **Update/Delete Village**: `PUT /api/admin/village/:id`, `DELETE /api/admin/village/:id`
- **Update/Delete Worker**: `PUT /api/admin/worker/:id`, `DELETE /api/admin/worker/:id`

### Water Source CRUD (Admin)
- **URL**: `POST /api/admin/water-sources` (Create)
- **URL**: `GET /api/admin/water-sources` (Get all)
- **Body**:
- ```json
- {
-   "name": "Main Tank A",
-   "type": "tank",
-   "locationUrl": "https://maps.google.com/?q=12.34,56.78",
-   "villageId": "VILLAGE_ID_HERE",
-   "panchayatId": "PANCHAYAT_ID_HERE"
- }
- ```

### Global Symptom Reports (Admin)
- **URL**: `GET /api/admin/symptom-reports`
- **Response**: List of all reports across the district.

---

## 3. Worker Endpoints (`/api/worker`)

### Login
- **URL**: `POST /api/auth/login`
- **Body**:
- ```json
- {
-   "phone": "9876543210",
-   "password": "workerpassword"
- }
- ```

> [!NOTE]
> Worker and Panchayat registration is handled exclusively by the **Admin** via the `/api/admin/worker` and `/api/admin/panchayat` endpoints.

### Get Current Worker (Profile)
- **URL**: `GET /api/auth/me`
- **Auth**: Required (Worker Token)

### Water Source CRUD (Worker)
- **URL**: `GET /api/worker/water-sources` (Assigned villages only)
- **URL**: `POST /api/worker/water-sources` (Add new source)
- **POST Body**:
- ```json
- {
-   "name": "Borewell 5",
-   "type": "borewell",
-   "villageId": "VILLAGE_ID_HERE"
- }
- ```

### Report Symptoms (Worker)
- **URL**: `POST /api/worker/report-symptoms`
- **Body**:
- ```json
- {
-   "villageId": "VILLAGE_ID_HERE",
-   "panchayatId": "PANCHAYAT_ID_HERE",
-   "symptoms": ["diarrhea", "vomiting"],
-   "patientCount": 3,
-   "severity": "MEDIUM",
-   "waterSourceId": "SOURCE_ID_HERE",
-   "locationUrl": "https://maps.google.com/?q=12.34,56.78"
- }
- ```

### My Reports (Worker)
- **URL**: `GET /api/worker/my-reports`

---

## 4. Water Source CRUD (Panchayat - `/api/panchayat`)

### Water Source CRUD
- **URL**: `POST /api/panchayat/water-sources` (Create)
- **URL**: `GET /api/panchayat/water-sources` (Get for this panchayat)
- **Body**:
- ```json
- {
-   "name": "Community Well",
-   "type": "well",
-   "villageId": "VILLAGE_ID_HERE"
- }
- ```

### Symptom Reports (Panchayat)
- **URL**: `GET /api/panchayat/symptom-reports`
