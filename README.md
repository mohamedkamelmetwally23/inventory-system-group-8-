# <img  src="assets/imgs/logo.png" alt="PharmaFlow Logo" width="32"/> PharmaFlow – Pharmacy Inventory Management System

[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://github.com/mohamedkamelmetwally23/inventory-system-group-8-)

A comprehensive web-based inventory system tailored for pharmacies. Manage medicines, track expiry dates, handle suppliers, and generate smart reports.
_Project developed as part of the ITI Full‑Stack (MEARN) scholarship program._

---

## ✨ Key Features

- **Dashboard:** At-a-glance inventory status and alerts.
- **Product Management:** Add, edit, remove and view product details.
- **Categories:** Create and manage product categories.
- **Suppliers:** Manage supplier records and contact details.
- **Purchase Orders:** Create and track purchase orders.
- **Stock Adjustments:** Record stock changes and corrections.
- **Reports:** Generate inventory, expiry, and movement reports.
- **Activity Log:** Track user actions and system events.

---

## 🛠 Technologies Used

##### Frontend

- HTML5, CSS3, Bootstrap 5
- JavaScript (ES6+)
- Font Awesome 6, Google Fonts (Inter)

##### Backend (Mock)

- json-server (mock REST API)

##### Development Tools

- npm, live-server, npm-run-all
- Git & GitHub

---

## 📂 Project Structure

```plaintext

inventory-system/
├─ index.html                     # Main landing page / entry point
├─ FormRender.js                  # Modal/form helper scripts
├─ package.json                   # npm scripts and dependencies
├─ README.md                      # Project documentation (this file)
├─ .gitignore                     # Git ignore rules
├─ server/                        # Mock API data for json-server
│  ├─ db.json                     # Development database snapshot
│  └─ mahmoud.json                # Alternate/mock data file used by scripts
├─ views/                         # Pre-built HTML pages for each section
│  ├─ activity-log.html           # Activity log UI view
│  ├─ categories.html             # Categories management view
│  ├─ orders.html                 # Orders management view
│  ├─ products.html               # Products listing and management view
│  ├─ reports.html                # Reports and analytics view
│  ├─ stock-adjustments.html      # Stock adjustments view
│  └─ suppliers.html              # Suppliers management view
└─ assets/                        # Front-end assets (scripts, styles, images)
   ├─ api/                        # API helper modules for CRUD operations
   ├─ components/                 # Reusable UI components and form code
   ├─ css/                        # Stylesheets for the application
   ├─ imgs/                       # Image assets and site icons
   ├─ libs/                       # Third-party libraries (Bootstrap, FontAwesome)
   ├─ models/                     # Data models / constructors used by scripts
   ├─ pages/                      # Page-specific JavaScript entry points
   └─ utils/                      # Small helper utilities and constants
```

Note: JavaScript sources are organized under `assets/` (API helpers, UI components, page scripts, models and utilities).

---

## Getting Started

Follow these steps to run the project locally.

```bash
git clone https://github.com/mohamedkamelmetwally23/inventory-system-group-8-.git
cd inventory-system-group-8-
npm install
npm run dev
```

- The `dev` script runs two services in parallel (defined in `package.json`):
  - `json-server` (mock API) — runs on port `3000`
  - `live-server` (static front-end) — runs on port `2210`

Open your browser to the live-server address (typically http://127.0.0.1:2210 or http://localhost:2210) to view the app.

---

## Team

Built by the project team.

| Name                        | Role                 | LinkedIn Profile                                                                                                                                                    |
| --------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mahmoud Mostafa**         | Full‑Stack Developer | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mahmoudmostafa99)                  |
| **Hababa Ahmed Elbaghdady** | Full‑Stack Developer | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/habeba-ahmed-elbaghdady-6a9b851b4) |
| **Hajar Zain**              | Full‑Stack Developer | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hajarzain222)                      |
| **Mohammed Kamel**          | Full‑Stack Developer | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mohammed-kamel-5262a7280)          |

---

## 🙏 Acknowledgements

We extend our deepest thanks to our supervisor **Eng. Aya Shehata** at ITI for their continuous guidance and support.

---

⭐ If you like this project, don't forget to give it a star on GitHub! ⭐
