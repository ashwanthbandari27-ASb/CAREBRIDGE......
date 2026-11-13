# CAREBRIDGE – SMART AI-POWERED HEALTHCARE MANAGEMENT SYSTEM

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![Python Version](https://img.shields.io/badge/Python-3.9%2B-yellow.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2%2B-darkgreen.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Databases](https://img.shields.io/badge/Databases-SQLite%20%7C%20MySQL%20%7C%20JSON-orange.svg)]()

**CAREBRIDGE** is an enterprise-grade hospital management web application suite connecting patients, doctors, administrators, and hospital staff through an intelligent, unified dashboard. It is delivered with multiple modern tech stacks for immediate deployment across any environment.

---

## 📦 What's Included in This Package

| Tech Stack | Location | Description |
| :--- | :--- | :--- |
| **Standalone Dashboard** | `dashboard.html` | **Zero-setup, 1-click dashboard**. Double-click to open in any web browser without starting any server! |
| **Pure HTML / CSS / JS** | `frontend_html/` | Pure HTML5, CSS3, and JavaScript portal (`index.html`) & dashboard (`dashboard.html`). |
| **Python / Django Backend** | `django_backend/` | Full Django REST Framework API with models, views, seed command, and admin panel. |
| **SQLite Database** | `django_backend/database/schema_sqlite.sql` | Production-ready SQLite schema & pre-populated seed data. |
| **MySQL Database** | `django_backend/database/schema_mysql.sql` | Full MySQL DDL schema & relational seed data with foreign keys. |
| **React 18 + Tailwind Frontend** | `frontend/` & `frontend/dist/` | Production Vite build with Recharts, Lucide icons, and responsive layouts. |
| **Node.js / Express API** | `backend/` | RESTful API server with auto-fallback database, seeding, and live asset serving. |
| **1-Click Launchers** | `START-CAREBRIDGE.bat` & `django_backend/run_django.bat` | Automated scripts to launch and test any stack on Windows. |

---

## 🚀 Quick Start Guide

### Option 1: Instant Standalone Dashboard (No Installation Required)
Simply double click `dashboard.html` in the root folder or open it in Google Chrome, Microsoft Edge, or Firefox. It runs 100% offline with preloaded mock data!

### Option 2: Full-Stack Node.js & React (Port 5000)
1. Double click `START-CAREBRIDGE.bat` or run:
   ```bash
   node backend/server.js
   ```
2. Open your browser at **`http://localhost:5000`**

### Option 3: Python & Django Backend (Port 8000)
1. Open terminal in `django_backend/` or double-click `django_backend/run_django.bat`:
   ```bash
   cd django_backend
   pip install -r requirements.txt
   python manage.py makemigrations hospital
   python manage.py migrate
   python manage.py seed_data
   python manage.py runserver 0.0.0.0:8000
   ```
2. Access the API and endpoints at:
   - **API Overview**: `http://localhost:8000/api/`
   - **Hospital KPI Stats**: `http://localhost:8000/api/stats/`
   - **Django Admin Panel**: `http://localhost:8000/admin/`

### Option 4: Pure HTML5, CSS3 & JavaScript Portal
Navigate to `frontend_html/index.html` and double click to run in any browser.

---

## 🗄️ Database Configurations (SQLite & MySQL)

### SQLite Setup (Default for Django)
SQLite works immediately with zero configuration. Running `python manage.py migrate` generates `db.sqlite3` in `django_backend/`. You can also import `django_backend/database/schema_sqlite.sql` into SQLite Studio or DB Browser for SQLite.

### MySQL Setup
1. Create your database:
   ```sql
   CREATE DATABASE carebridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the complete schema and seed data:
   ```bash
   mysql -u root -p carebridge_db < django_backend/database/schema_mysql.sql
   ```
3. In `django_backend/carebridge_project/settings.py` or `.env`:
   ```env
   USE_MYSQL=True
   DB_NAME=carebridge_db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```

---

## 🌟 Core System Modules & Features

1. **Dashboard & Command Center**: 8 KPI cards, monthly appointment trends, status breakdown, live doctor roster, and ER triage list.
2. **Patient Management**: Full CRUD, unique IDs (`PAT-1001`), blood group & allergy tags, and clinical history.
3. **Doctor Directory**: Specialties, consultation fees, room numbers, and one-click availability toggles.
4. **Appointment Scheduler**: Real-time slot selection, doctor allocation, and status management.
5. **Medical Records & EMR**: Diagnosis documentation, treatment protocols, and visit logs.
6. **E-Prescriptions**: Multi-medicine prescriptions with instructions and printable Rx pads.
7. **Pharmacy & Inventory**: Stock counts, low-stock threshold alerts, and batch expiry tracking.
8. **Laboratory & Diagnostics**: Diagnostic requisitions, test results, normal ranges, and printable reports.
9. **Billing & Invoices**: Itemized medical invoices, insurance claims, and printable tax bills.
10. **Emergency Room Triage**: Red-flag prioritization, vital signs tracking (BP, HR, RR, SpO2, Temp), and bed allocation.

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@carebridge.org` | `Admin@123` |
| **Doctor (Cardiology)** | `doctor@carebridge.org` | `Doctor@123` |
| **Nurse / Staff** | `nurse@carebridge.org` | `Nurse@123` |
| **Patient** | `patient@carebridge.org` | `Patient@123` |

---

## 🐙 Pushing to GitHub via VS Code

1. Open this unzipped folder in **VS Code** (`File` -> `Open Folder...`).
2. Open terminal in VS Code (`Ctrl + ~`) and initialize your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CareBridge Smart Healthcare Management System"
   ```
3. Create a repository on [GitHub](https://github.com/new) and link it:
   ```bash
   git remote add origin https://github.com/<your-username>/carebridge-healthcare.git
   git branch -M main
   git push -u origin main
   ```

---

## 📄 License
This project is licensed under the MIT License.
