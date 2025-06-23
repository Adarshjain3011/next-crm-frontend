# Next CRM Frontend

A modern, feature-rich B2B CRM dashboard built with **Next.js 15**, **React 19**, **Redux Toolkit**, **React Query**, and **Tailwind CSS**. This dashboard provides a comprehensive overview of your business operations, including invoices, orders, team management, and more.

---

## 🚀 Features

- **Dashboard Overview**: Visualize revenue, orders, invoices, and enquiries with interactive charts and growth metrics.
- **Invoice Management**: View, search, filter, and analyze all invoices. See statistics like total revenue, paid/pending invoices, average invoice value, and latest invoice at a glance.
- **Order & Enquiry Tracking**: Manage customer orders and user enquiries with status tracking and detailed views.
- **Team Management**: Add, edit, and manage team members and their roles.
- **Role-Based Access**: Secure pages and actions with robust role-based authentication.
- **Modern UI**: Built with reusable components and Tailwind CSS for a clean, responsive experience.
- **Export & Download**: Download invoices as PDF/Excel and export data for reporting.
- **Notifications**: Stay updated with real-time notifications.
- **Performance**: Optimized with React Query, Redux, and code-splitting for fast load times.

---

## 🏗️ Project Structure

```
app/
  (routes)/
    all-invoices/         # Invoice dashboard and management
    client-dashboard/     # Client-specific dashboard
    create-new-enquery/   # Enquiry creation
    customer-orders/      # Order management
    dashboard/            # Main dashboard overview
    invoice-form/         # Invoice creation/editing
    notifications/        # Notification center
    order-dashboard/      # Vendor/order details
    profile/              # User profile & password reset
    team-management/      # Team management
  hooks/                  # Custom React hooks (auth, loading, role)
  providers/              # Context providers (Auth, Redux, React Query)
  store/                  # Redux slices and store config
  utils/                  # Utility functions
components/
  auth/                   # Role guard and auth components
  client/                 # Client-related forms and modals
  common/                 # Shared UI components (Sidebar, Loader, etc.)
  invoice/                # Invoice-specific components
  order/                  # Order-specific components
  profile/                # Profile management
  team-management/        # Team management UI
  ui/                     # Design system (buttons, cards, tables, etc.)
lib/                      # API and data helpers
public/                   # Static assets
```

---

## 🛠️ Tech Stack

- **Next.js 15**
- **React 19**
- **Redux Toolkit** & **React Redux**
- **React Query** (TanStack)
- **Tailwind CSS**
- **Radix UI** (for accessible UI primitives)
- **Lucide React** (icons)
- **Chart.js** & **react-chartjs-2** (charts)
- **Date-fns** (date utilities)
- **Axios** (API calls)
- **React Hot Toast** (notifications)
- **XLSX** & **html2pdf.js** (export/download)

---

## ⚡ Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔒 Authentication & Roles

- Uses context providers and custom hooks for authentication.
- Role-based access control is enforced via the `RoleGuard` component.

---

## 📊 Dashboard Highlights

- **Statistics Cards**: Total revenue, total invoices, paid/pending invoices, average invoice value, and latest invoice.
- **Interactive Table**: Search, filter, sort, and view invoice details.
- **Charts**: Revenue and order trends, enquiry status distribution (see `/dashboard` route).
- **Quick Actions**: Download, export, and view invoice PDFs.

---

## 🧩 Customization

- **Add new modules**: Use the modular folder structure to add new features.
- **UI Components**: Reusable components in `components/ui` and `components/common`.
- **State Management**: Extend Redux slices in `app/store/slice`.

---

## 📝 Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Lint code

---

## 📦 Deployment

Deploy easily on [Vercel](https://vercel.com/) or any Node.js hosting platform.

---

## 🤝 Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

---

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy your modern CRM dashboard!**
