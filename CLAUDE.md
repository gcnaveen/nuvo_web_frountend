# CLAUDE.md — Nuvo Admin Panel (Frontend) Engineering Knowledge Base

> **Living document.** Update this file every time a new page is added, a pattern changes, a dependency is introduced, or a decision is made. This is the single source of truth for the React JS admin panel.

---

## 1. Project Overview

This is the **Nuvo Hosting Admin Panel** — a React JS single-page application built with Vite. It is the web dashboard used by admins to manage events, staff, clients, makeup artists, and master configuration data.

### Role in the Platform
| Platform | Owner |
|---|---|
| **Admin Panel (this repo)** | Rakesh |
| Backend API (`nuvo_web_backend/`) | Rakesh |
| Mobile App (React Native) | External mobile developer |
| C++ Location Tracker | Separate repo |

### Companion Repos on This Machine
```
/Users/rudreshac/Desktop/rakesh/Nuvo/
├── nuvo_web_frountend/       ← THIS REPO (React JS admin panel)
├── nuvo_web_backend/         ← Django backend API
├── Nuvo_hosting_c_backend/   ← C++ location tracking server
└── frontencENV/              ← Frontend node environment (if separate)
```

---

## 2. Current Status (as of 2026-06-07)

### Completed Pages / Features
- [x] Admin login (email + password)
- [x] Admin register + OTP verification
- [x] Dashboard with live stats (auto-refresh every 60s)
- [x] Events list + detail view
- [x] Event status management
- [x] Staff assignment to events
- [x] Live event tracking (Google Maps)
- [x] Staff management (list, detail, create, update, delete, gallery)
- [x] Makeup Artist management (list, detail, create, update, delete, gallery)
- [x] Client management (list, detail, create, subscription update)
- [x] Master Data — Themes, Uniforms, Crew Gallery, Subscription Plans, Payment Terms, Coupons, Inventory
- [x] Uniforms page (separate route from master data)
- [x] Reports page

### Pending / Inactive
- [ ] Public landing page (`Homepage.jsx`) — routes commented out in `App.jsx`
- [ ] Staff recruitment form (`RecruitmentFormPage`) — route commented out in `App.jsx`
- [ ] Diamond-tier event pricing UI — handled manually by admin, no automated calculation

### Known Issues
- Landing page routes are commented out; the app always starts at `/admin/login`
- `test.jsx` in root is a scratch file — not part of the app
- Tailwind CSS v4 is installed (via `@tailwindcss/vite` plugin) but only used for the landing page; admin pages use Bootstrap Icons + custom CSS

---

## 3. Folder Structure

```
nuvo_web_frountend/
├── index.html
├── vite.config.js           ← Vite config (React + Tailwind plugins)
├── package.json
├── _redirects               ← Netlify/hosting redirect rule (e.g. /* → /index.html)
├── eslint.config.js
├── public/                  ← Static assets
└── src/
    ├── App.jsx              ← All route definitions
    ├── main.jsx             ← React DOM entry point
    ├── App.css              ← Global admin styles
    ├── index.css            ← Base CSS reset / variables
    ├── landing.css          ← Tailwind-based landing page styles (inactive)
    ├── landing_config.js    ← Config for landing page content (inactive)
    │
    ├── api/                 ← All API call functions (one file per domain)
    │   ├── axiosInstance.js ← Axios base instance + JWT interceptor + auto-refresh
    │   ├── authApi.js       ← login, logout, OTP, register calls
    │   ├── dashboardApi.js  ← getDashboardStats, getOnDutyStaff
    │   ├── eventsApi.js     ← Event CRUD, status, crew assignment
    │   ├── masterApi.js     ← All master data calls (themes, crew, coupons, etc.)
    │   ├── staffApi.js      ← Staff CRUD, image upload
    │   ├── clientApi.js     ← Client CRUD, subscription update
    │   └── muaApi.js        ← Makeup artist CRUD, image upload
    │
    ├── auth/
    │   ├── AuthContext.jsx  ← JWT context: login(), logout(), user, isAuthenticated
    │   └── ProtectedRoute.jsx ← Redirects unauthenticated users to /admin/login
    │
    ├── layouts/
    │   ├── MainLayout.jsx   ← Sidebar + header + <Outlet /> for all protected pages
    │   └── AuthLayout.jsx   ← Bare layout for login/register/verify-otp pages
    │
    ├── components/
    │   ├── Sidebar.jsx      ← Navigation sidebar with active-link highlighting
    │   └── Footer.jsx       ← Footer rendered inside MainLayout
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx        ← Admin email + password login
    │   │   ├── Register.jsx     ← Admin registration form
    │   │   └── VerifyOtp.jsx    ← OTP verification step
    │   │
    │   ├── user_management/
    │   │   ├── Staff.jsx            ← Staff list + create modal
    │   │   ├── StaffDetails.jsx     ← Single staff view, edit, gallery management
    │   │   ├── Clients.jsx          ← Client list + create modal
    │   │   ├── ClientDetails.jsx    ← Single client view, subscription management
    │   │   ├── MakeupArtist.jsx     ← MUA list + create modal
    │   │   └── MakeupArtistDetails.jsx ← Single MUA view, edit, gallery management
    │   │
    │   ├── Dashboard.jsx    ← Live stats cards, bar chart, upcoming events table
    │   ├── Events.jsx       ← Event list with filters and search
    │   ├── EventDetails.jsx ← Full event view: info, crew, status, payment
    │   ├── TrackEvent.jsx   ← Google Maps live tracking of staff at an event
    │   ├── MasterData.jsx   ← Tabbed master data management (7 tabs)
    │   ├── Uniforms.jsx     ← Uniform gallery/management (separate page)
    │   └── Reports.jsx      ← Reports and exports
    │
    ├── sections/            ← Landing page sections (inactive)
    ├── landing_components/  ← Landing page components (inactive)
    ├── constants/           ← App-level constants
    └── data/                ← Static data files
```

---

## 4. Tech Stack

| Library | Purpose | Version |
|---|---|---|
| React | UI framework | 18.3.1 |
| Vite | Build tool + dev server | 6.4.2 |
| React Router DOM | Client-side routing | 6.26.2 |
| Axios | HTTP client | 1.7.9 |
| Bootstrap Icons | Icon set (CSS class-based) | via CDN or import |
| Ant Design (antd) | Select dropdowns, date pickers | 5.22.0 |
| @ant-design/icons | Ant Design icon set | 5.5.0 |
| @react-google-maps/api | Google Maps live tracking | 2.20.8 |
| react-big-calendar | Calendar view for events | 1.14.1 |
| react-hook-form | Form state management | 7.53.0 |
| date-fns | Date formatting utilities | 3.6.0 |
| dayjs | Date manipulation (used with antd) | 1.11.13 |
| motion | Animation library | 12.34.0 |
| xlsx | Excel export for reports | 0.18.5 |
| file-saver | File download helper | 2.0.5 |
| Tailwind CSS v4 | Utility CSS (landing page only) | 4.1.18 |

---

## 5. Environment Setup

```bash
# 1. Navigate to frontend
cd /Users/rudreshac/Desktop/rakesh/Nuvo/nuvo_web_frountend

# 2. Install dependencies
npm install

# 3. Create .env in root with:
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# 4. Start dev server
npm run dev
# → Runs at http://localhost:5173 (default Vite port)

# Build for production
npm run build
# → Output in dist/

# Preview production build
npm run preview
```

### Important env variable
| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL for all API calls | `http://127.0.0.1:8000/api` |

If `VITE_API_BASE_URL` is not set, `axiosInstance.js` falls back to `http://127.0.0.1:8000/api`.

---

## 6. Routing

All routes defined in `src/App.jsx`.

```
/                        → Redirect to /admin/login
/login                   → Redirect to /admin/login
/register                → Redirect to /admin/register
/verify-otp              → Redirect to /admin/verify-otp

/admin/login             → Login.jsx         (AuthLayout, public)
/admin/register          → Register.jsx      (AuthLayout, public)
/admin/verify-otp        → VerifyOtp.jsx     (AuthLayout, public)

/admin                   → Dashboard.jsx     (MainLayout, protected)
/admin/events            → Events.jsx        (protected)
/admin/events/:id        → EventDetails.jsx  (protected)
/admin/events/:id/track  → TrackEvent.jsx    (protected)
/admin/staff             → Staff.jsx         (protected)
/admin/staff/:id         → StaffDetails.jsx  (protected)
/admin/makeup-artist     → MakeupArtist.jsx  (protected)
/admin/makeup-artist/:id → MakeupArtistDetails.jsx (protected)
/admin/clients           → Clients.jsx       (protected)
/admin/clients/:id       → ClientDetails.jsx (protected)
/admin/master-data       → MasterData.jsx    (protected)
/admin/uniforms          → Uniforms.jsx      (protected)
/admin/reports           → Reports.jsx       (protected)
/admin/*                 → Redirect to /admin (dashboard)
*                        → Redirect to /admin/login
```

**Inactive (commented out):**
```
/                        → Homepage.jsx      (public landing page)
/joinourteam             → RecruitmentFormPage.jsx
```

---

## 7. Authentication Flow

### How Auth Works

1. Admin submits email + password on `/admin/login`
2. Frontend calls `POST /api/auth/admin/login/`
3. On success, receives `{ access_token, refresh_token, user }`
4. `AuthContext.login(tokens, userData)` stores all three in `localStorage`
5. All subsequent API calls attach `Authorization: Bearer <access_token>` (via Axios interceptor)
6. On `401` response: interceptor silently calls `POST /api/auth/refresh-token/` to get a new access token, retries the failed request
7. If refresh fails: localStorage cleared, redirect to `/admin/login`

### AuthContext API

```jsx
import { useAuth } from '../auth/AuthContext';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();

// user shape:
// {
//   id, email, role, status, is_approved,
//   profile_completed, subscription_plan, ...
// }
```

### ProtectedRoute

Wraps all `/admin/*` routes. Shows spinner while `isLoading` is true (prevents flash redirect on page refresh). Redirects to `/admin/login` if not authenticated.

```jsx
// In App.jsx — all admin routes are wrapped:
<Route path="/admin" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  ...child routes...
</Route>
```

### localStorage Keys
| Key | Value |
|---|---|
| `access_token` | JWT access token string |
| `refresh_token` | JWT refresh token string |
| `user` | JSON-stringified user object |

---

## 8. API Layer

### Pattern

All API calls live in `src/api/`. Every file imports the shared Axios instance:

```js
import api from './axiosInstance';

// GET
export const listThemes = () => api.get('/master/themes/');

// POST with JSON
export const createCoupon = (data) => api.post('/master/coupons/create/', data);

// PUT with multipart (file upload)
export const updateCrewMember = (id, fd) =>
  api.put(`/master/crew/${id}/update/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// DELETE
export const deleteTheme = (id) => api.delete(`/master/themes/${id}/delete/`);
```

### API Files Summary

| File | Domain | Key exports |
|---|---|---|
| `axiosInstance.js` | Base HTTP | Default export `api` |
| `authApi.js` | Auth | `adminLogin`, `sendOtp`, `verifyOtp`, `logout`, `register` |
| `dashboardApi.js` | Dashboard | `getDashboardStats`, `getOnDutyStaff` |
| `eventsApi.js` | Events | `listEvents`, `createEvent`, `updateEvent`, `updateEventStatus`, `assignCrew`, etc. |
| `masterApi.js` | Master Data | `listThemes`, `createCrewMember`, `listCoupons`, `getPaymentTerms`, etc. |
| `staffApi.js` | Staff | `listStaff`, `createStaff`, `updateStaff`, `deleteStaff`, `uploadStaffImages` |
| `clientApi.js` | Clients | `listClients`, `createClient`, `updateSubscription` |
| `muaApi.js` | Makeup Artists | `listMUA`, `createMUA`, `updateMUA`, `deleteMUA`, `uploadMUAImages` |

### File Upload Pattern

When a form includes an image file, build a `FormData` object and pass `multipart/form-data`:

```jsx
const fd = new FormData();
fd.append('name', name);
fd.append('image', imageFile);   // File object from <input type="file">
// Pass override header:
await createCrewMember(fd);      // already sets Content-Type in masterApi.js
```

---

## 9. MasterData.jsx — Tab Structure

The `MasterData.jsx` page is a single page with 7 tabs:

| # | Tab Name | Component/Panel | Description |
|---|---|---|---|
| 1 | Themes | `ThemesPanel` | Event theme images (S3 hosted) |
| 2 | Uniforms | `UniformsPanel` | Uniform categories with images |
| 3 | Crew Gallery | `CrewPanel` | Crew photos for mobile "Our Crew" section |
| 4 | Subscription | `SubscriptionPanel` | Plan settings per tier |
| 5 | Payment Terms | `PaymentPanel` | Advance %, tier pricing, overtime rate |
| 6 | Coupons | `CouponsPanel` | Coupon CRUD + usage progress display |
| 7 | Inventory | `InventoryPanel` | Stock management per uniform category |

### CrewPanel
- CSS grid layout: `repeat(auto-fill, minmax(180px, 1fr))`
- Portrait-ratio cards (`padding-top: 120%` for 5:6 aspect)
- Hover overlay reveals Edit/Delete buttons
- `is_active = false` shows grey "Inactive" badge
- Image `onError` → shows fallback grey placeholder

### PaymentPanel
- Two-column layout:
  - Left: advance %, default hours/day, overtime rate (with live info tip)
  - Right: 4 tier pricing cards (Bronze/Silver/Gold/Platinum) with colored ₹ inputs
- Blue info box explaining Diamond tier is excluded (negotiated manually)

### CouponsPanel
- Coupon cards with usage progress bar (`used_count / usage_limit`)
- Discount badge: shows `20%` for PERCENTAGE or `₹5,000` for FLAT
- Status badge: Active / Inactive / Expired / Exhausted

---

## 10. Styling Conventions

- **Admin pages:** Bootstrap Icons (`bi bi-*` classes) + custom CSS in `App.css`
- **Landing pages (inactive):** Tailwind CSS v4 utility classes via `landing.css`
- **Do NOT mix Tailwind and Bootstrap Icons in admin pages** — keeps styling predictable
- **Ant Design** (`antd`) is used selectively: date pickers, select dropdowns — not for entire layouts
- **No global component library for admin** — most UI is hand-written with Bootstrap class names and custom CSS

### Color Reference (admin pages)
| Status | Color | Hex |
|---|---|---|
| Created | Blue | `#435ebe` |
| Planning Started | Cyan | `#0dcaf0` |
| Staff Allocated | Amber | `#f59f00` |
| Completed | Green | `#198754` |
| Cancelled | Red | `#dc3545` |
| Default/Unknown | Grey | `#6c757d` |

---

## 11. State Management

- **No Redux or Zustand** — all page state is local `useState` per component
- **Auth state** — `AuthContext` (React Context), persisted in `localStorage`
- **Forms** — mix of controlled `useState` inputs and `react-hook-form` (varies by page)
- **Data fetching** — `useEffect` on mount; `useCallback` used in Dashboard for refresh
- **Modals** — local `useState` boolean flags (e.g., `showModal`, `editTarget`)

### Typical Page Pattern

```jsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showModal, setShowModal] = useState(false);
const [editTarget, setEditTarget] = useState(null);  // null = create, object = edit

useEffect(() => {
  fetchItems();
}, []);

const fetchItems = async () => {
  try {
    const res = await listItems();
    setItems(res.data.data);
  } catch (err) {
    setError('Failed to load items');
  } finally {
    setLoading(false);
  }
};
```

---

## 12. Sidebar Navigation

`Sidebar.jsx` uses `useLocation()` to highlight the active link.

```js
const isActive = (path) => pathname.startsWith(path) ? 'active' : '';
const isParentOpen = (...paths) => paths.some(p => pathname.startsWith(p));
```

**Sidebar sections:**
- Dashboard → `/admin`
- Events → `/admin/events`
- User Management (accordion) → Staff, Makeup Artists, Clients
- Master Data → `/admin/master-data`
- Uniforms → `/admin/uniforms`
- Reports → `/admin/reports`
- Logout button → calls `AuthContext.logout()` then navigates to `/admin/login`

---

## 13. Dashboard

`Dashboard.jsx` polls `GET /api/events/dashboard/stats/` every 60 seconds using `setInterval` inside `useCallback`.

Features:
- Stats cards: total events, total revenue, on-duty staff, upcoming events count
- Pure CSS bar chart (no external chart library) showing events per month
- Upcoming events table with status and payment badges
- Amount formatted as `₹1.5L`, `₹75.0k`, or `₹500` depending on magnitude

---

## 14. Live Tracking

`TrackEvent.jsx` uses `@react-google-maps/api` to show real-time staff locations on a Google Map during an event. Fetches location data from `GET /api/events/:id/track/` which proxies through to the C++ location server.

---

## 15. Key Patterns & Rules

### Never break these
1. **All API calls go through `axiosInstance.js`** — never use raw `fetch` or a separate axios instance
2. **File uploads always use `FormData` with `Content-Type: multipart/form-data`** header override
3. **Never store sensitive data beyond what's in localStorage** (tokens + user object only)
4. **ProtectedRoute must wrap all admin routes** — never add a protected page without it
5. **Always check `isLoading` before rendering auth-dependent content** — prevents flash redirect on refresh

### Adding a New Page
1. Create the component in `src/pages/`
2. Import it in `App.jsx`
3. Add a `<Route>` inside the protected `/admin` block
4. Add a sidebar link in `Sidebar.jsx` with `isActive()` logic
5. Add any API calls as named exports in the relevant `src/api/*.js` file

### Adding a New API Call
1. Add a named export in the appropriate `src/api/*.js` file
2. Use the shared `api` instance from `axiosInstance.js`
3. For multipart (file upload): pass `{ headers: { 'Content-Type': 'multipart/form-data' } }` as third argument to `api.post/put`

---

## 16. Build & Deployment

```bash
npm run build       # outputs to dist/
npm run preview     # serve the dist/ build locally
```

- `_redirects` file in root handles SPA routing on Netlify/similar hosts:
  ```
  /*    /index.html   200
  ```
- Vite config: `@vitejs/plugin-react` for Fast Refresh + `@tailwindcss/vite` for Tailwind (landing page)
- No server-side rendering — pure SPA

---

## 17. Known Issues & Technical Debt

| Issue | Status | Notes |
|---|---|---|
| Landing page routes commented out | Inactive | Homepage.jsx and RecruitmentFormPage exist but not routed |
| `test.jsx` in repo root | Scratch file | Not part of the app, can be deleted |
| No automated tests | Tech debt | All manual currently |
| Mixed form handling | Tech debt | Some pages use `useState`, others `react-hook-form` — inconsistent |
| Tailwind v4 + Bootstrap Icons both present | By design | Tailwind for landing, Bootstrap for admin — do not mix in admin pages |
| No loading skeleton components | UX debt | Pages show blank while loading; spinners are minimal |

---

## 18. Architectural Decisions

### Why Vite (not CRA)?
Faster dev server HMR and simpler config. No Create React App overhead.

### Why no global state library?
Admin panel is mostly independent pages. No complex cross-page state sharing needed. If it grows, consider Zustand (lightweight) over Redux.

### Why Bootstrap Icons instead of a full component library?
Keeps the bundle lean. The admin template was originally Bootstrap-based. Ant Design is used only where Bootstrap doesn't have a suitable component (date pickers, advanced selects).

### Why manual `FormData` instead of a form library for file uploads?
`react-hook-form` doesn't handle `FileList` / S3 upload naturally. `FormData` is explicit and predictable for multipart posts.

### Why `localStorage` for tokens (not cookies)?
Consistent with the existing pattern. HttpOnly cookies would be more secure against XSS but require backend changes.

---

## 19. Change Log

| Date | Change | Files |
|---|---|---|
| 2026-06-07 | Added Crew Gallery tab to MasterData.jsx (grid layout, hover overlays, form modal) | `src/pages/MasterData.jsx` |
| 2026-06-07 | Added crew API calls to masterApi.js | `src/api/masterApi.js` |
| 2026-06-07 | Rewrote PaymentPanel — two-column layout with tier pricing cards and Diamond note | `src/pages/MasterData.jsx` |
| 2026-06-07 | Added CouponsPanel and CouponFormModal to MasterData.jsx | `src/pages/MasterData.jsx` |
| 2026-06-07 | Added coupon API calls (listCoupons, createCoupon, updateCoupon, deleteCoupon) | `src/api/masterApi.js` |
| 2026-06-07 | Created CLAUDE.md — this engineering knowledge base | `CLAUDE.md` |
