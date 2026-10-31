# SmartCivic — Municipal Grievance & Rapid Redressal System

> **Full-Stack Development Innovative Assignment**  
> **Institution:** Nirma University, Institute of Technology  
> **Department:** Department of Computer Science and Engineering  
> **Authors:** Donda Parth (25BCE504), Gajjar Daksh (25BCE507)  
> **Faculty Advisor:** Dr. Sanjay Patel  

---

## 🌟 Executive Summary & Mission
Municipal governance faces a communication gap between citizens and city administration. Complaints disappear into bureaucratic black holes with zero status tracking, zero evidence verification, and zero accountability.

**SmartCivic** is an enterprise-grade municipal grievance management platform built with:
- **5-Tier Role-Based Access Control (RBAC):** Public Citizen, Department Triage Officer, Field Repair Technician, Quality Supervisor, and Municipal Commissioner/Admin.
- **10-Stage Grievance Lifecycle State Machine:** Strict sequential transitions (`SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `ACCEPTED` &rarr; `ASSIGNED` &rarr; `ON_THE_WAY` &rarr; `IN_PROGRESS` &rarr; `DONE` &rarr; `VERIFIED` &rarr; `CLOSED` / `REOPENED`).
- **Interactive OpenStreetMap / Leaflet GIS:** Sub-meter coordinate geopicking, ward defect density heatmaps, and geospatial intelligence.
- **Proximity-Based Duplicate Detection Engine:** Queries 50-meter geospatial radius for active issues in the same category and prompts citizens to upvote existing tickets.
- **Mandatory Photographic Before/After Proof:** Field technicians cannot close tickets without geo-referenced photo evidence and logged materials.
- **Independent Quality Audit Desk:** Supervisors audit on-site repair proof before certifying resolution or sending back for rework.
- **Statutory SLA Countdown Matrix:** Legally bound deadlines (Critical: 6h, High: 24h, Medium: 48h, Low: 72h) with automated breach escalations.
- **Citizen Reopen Guarantee (48h Window):** Citizens can rate satisfaction or reopen tickets if unresolved.
- **Immutable Forensic Audit Ledger:** Append-only log of every state change, actor footprint, timestamp, delta, and IP address.

---

## 🚀 Complete Technology Stack (Pure Full-Stack)
- **Frontend Presentation Layer:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet, Recharts.
- **Backend API & Logic Layer:** Node.js, Express, RESTful APIs, JWT Authentication, Multer file handling, CORS.
- **Persistence Layer:** JSON file-backed database (`server/data/database.json`) with auto-seeding.

---

## 🔑 Pre-Seeded Evaluation Credentials (1-Click Login Available)

All demo accounts use password: `pass123`

| Persona Role | Username | Password | Department / Jurisdiction Scope |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin` | `pass123` | Central Municipal Governance (Citywide oversight) |
| **Department Officer** | `officer` | `pass123` | Roads & Infrastructure Department |
| **Water Officer** | `officer_water` | `pass123` | Water Supply & Sewerage Department |
| **Electrical Officer** | `officer_elec` | `pass123` | Electrical & Streetlighting Department |
| **Field Supervisor** | `supervisor` | `pass123` | Quality & Safety Audit Desk |
| **Field Technician** | `worker` | `pass123` | Roads & Infrastructure Repair Crew |
| **Public Citizen** | `citizen` | `pass123` | Public Citizen / Taxpayer Account |

*Evaluators can also use the **1-Click Persona Simulator** directly on the Login page or Navbar dropdown!*

---

## ⚡ Quick Start & Local Execution

### One-Command Startup:
```bash
npm run dev
```
*(Runs both backend on `http://localhost:5000` and frontend on `http://localhost:3000` concurrently)*

Alternatively:
- Backend alone: `cd server && npm run dev`
- Frontend alone: `cd client && npm run dev`
- Production build: `npm run build`

### Access URLs:
- **Public Citizen Portal & Landing Page:** `http://localhost:3000/`
- **File a Grievance with Geotagging:** `http://localhost:3000/report`
- **Public Grievance Tracking Timeline:** `http://localhost:3000/track/SC-2026-00001`
- **Multi-Role Authentication Desk:** `http://localhost:3000/login`
- **Backend REST API:** `http://localhost:5000/api/issues/`

