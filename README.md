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

All data is saved automatically to `localStorage` so it persists across page reloads. Data is also synced to Google Sheets when a Web App URL is configured.

## Google Sheets Sync

Dashboard data is automatically synced to the Google Sheet every time a record is saved or deleted.

**Target Sheet:** [Smart 5G Dashboard Data](https://docs.google.com/spreadsheets/d/1_Xx7sg1HMq_hOaAGvqCPjhoWiQU6TlOt7LXATyJWhMI/edit)

### Sheets managed

| Sheet | Data |
|-------|------|
| Sales | Sale records (agent, branch, date, items) |
| Customers | New customer pipeline |
| TopUp | Customer top-up / recharge records |
| Terminations | Terminated customer records |
| Promotions | Marketing promotions |
| Deposits | Agent cash deposits |
| Staff | User / staff accounts |
| KPI | KPI targets |

### One-time setup — deploy the Apps Script

1. Open [Google Apps Script](https://script.google.com/) and click **New project**.
2. Delete any placeholder code and paste the entire contents of [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).
3. Click **Deploy → New Deployment**.
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** and authorise the app when prompted.
5. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/…/exec`).
6. Open `app.js` and replace the value of `GS_URL` with the copied URL:
   ```js
   const GS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
7. Save and reload `index.html`. The sync indicator in the top bar will show **Synced** after each save.

> **Updating the script:** When you edit `Code.gs`, go to **Deploy → Manage deployments**, click the pencil icon on your existing deployment, change "Version" to **New version**, and click **Deploy**. The same URL stays valid — no need to update `GS_URL` in `app.js` again.

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) for charts
- [Font Awesome 6](https://fontawesome.com/) for icons
- [Google Fonts – Inter](https://fonts.google.com/specimen/Inter)
