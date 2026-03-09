# Smart 5G Dashboard

A web-based sales management dashboard for Smart 5G, built with vanilla HTML, CSS, and JavaScript.

## Features

- **Dashboard** – KPI cards (Sales, Units, Revenue, Agents), monthly trend charts, agent performance, branch summary
- **Promotion** – Create, edit, restore, and view promotions with expiry tracking
- **Sale** – Table and summary views with date/agent/branch filtering
- **Customer** – Manage new customers, top-ups, and terminations
- **Deposit** – Track agent cash deposits across branches
- **Settings** – Role-based permission control, KPI target setting, and promotion management

## Usage

Open `index.html` in a browser. Default login credentials:

| Username | Password | Role |
|----------|----------|------|
| admin | admin@2026 | Admin |
| bob | Pass@123 | Supervisor |
| charlie | Pass@123 | Agent |

## Data Persistence

All data is saved automatically to `localStorage` so it persists across page reloads. Data is also synced to Google Sheets when available.

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) for charts
- [Font Awesome 6](https://fontawesome.com/) for icons
- [Google Fonts – Inter](https://fonts.google.com/specimen/Inter)
