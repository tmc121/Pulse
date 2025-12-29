# InComm V2 Code Structure

This document captures the current layout, key flows, and entry points so new contributors can navigate the project quickly.

## Repository Layout
- Root configs: `package.json`, `wix.config.json`, `jsconfig.json`.
- Public modules (frontend shared): `src/public/`
  - `appNavigation.js`: multistate navigation helpers (`primaryNavigate`, `reportsNavigate`).
  - `appAuthentication.js`: login/logout and quick-menu handling with primary multistate fallback.
  - `appMyAccount.js`: populates My Account view.
  - `appReports.js`: report query helpers (inbound received count, filters for Not Received, Not Delivered, All).
  - `InitializeData.js`: search and create reference setup helpers.
- Page code: `src/pages/`
  - `Home.c1dmp.js`: main experience (dashboard/search/reports/create reference/reference path/team/my account).
  - `Login.e74l5.js`, `Sign Up.z8g67.js`: auth entry pages.
  - `Custom Member Page.d923z.js`, `Member Page.r7l1o.js`, `Get Team.v4lc0.js`, `Home.c1dmp.js`, `masterPage.js`: Wix page scripts.
- Backend: `src/backend/`
  - `permissions.json`: web module permissions.
  - Add `.jsw` modules/data/hooks/routers/events as needed per Wix backend docs.
- Styles: `src/styles/global.css`.

## Core Flows (Home)
- Primary multistate ids: `dashboard`, `searchMain1`, `pullMain1`, `reportsMain1`, `createReferenceMain1`, `manageTeamMain1`, `manageTeamNewAccountMain1`, `teamMain1`, `myAccountMain1`, `referencePathMain1`, `loadingMain1`, `noAccessStateMain1`.
- Reports multistate ids: `reportsDash`, `reportsData`, `reportsLoading` with dropdown `reports-InMenu-Dropdown`.
- Datasets expected: `searchDataset`, `selectedReferencedData-Dataset`, `createDataset`, `resultsDataset` (reports).
- Startup: `$w.onReady` guards authentication (shows No Access state via `showNoAccessState` if not logged in), then defaults to dashboard + reports dash. It now waits for datasets via `waitForDatasetsReady` before wiring handlers to reduce race conditions.
- Search: `initializeSearch` on input/debounced; `initializeSearchSelected` on submit populates reference path state.
- Reports: Buttons call `reportsInNotReceived`, `reportsNotDelivered`, `reportsAllInbound`; `reportsNavigate` handles state changes and loading indicator.
- Create Reference: `setupCreateOrEditReference` wires create form; triggered from main menu button `mainMenu-Button-CreateReference`.
- Dashboard: inbound count via `getInboundReceivedOnlyCount`; manage/account/settings sections wired through `setupDashboard*` functions (in `Home.c1dmp.js`).
- Quick menu (header) triggers navigation through `primaryNavigate` if the multistate exists; otherwise falls back to `/home` route (see `appAuthentication.js`).

## Authentication & Access
- `currentMember.getMember()` used on Home load; unauthenticated users are shown No Access messaging and prompted to sign in.
- Login/Signup pages redirect to `/home` after success (no URL-driven state switching).
- Logout routes to `/`.

## Reports Helpers
- `appReports.js` provides report entry points used by Home menu buttons; includes deduped inbound count via `getInboundReceivedOnlyCount`.

## Search & Reference Helpers
- `InitializeData.js` exports search initialization, selected reference display, and create/edit reference setup utilities consumed by Home.

## Styling
- Global styles live in `src/styles/global.css`; page-specific styling handled in Wix editor styles and components.

## Development & Deployment
- Local preview: `wix dev` (runs Local Editor against this repo).
- Publish: `wix publish` (already used in recent workflow).
- Avoid renaming page code files; Wix maps them by filename.

## Conventions and Notes
- Prefer state changes via `primaryNavigate` and `reportsNavigate` (avoids URL params for state).
- Bind dropdown/menu handlers only once (e.g., `reportsMenuHandlerBound` guard).
- When adding new datasets or states in Home, include them in `waitForDatasetsReady` to avoid early handler execution.
- Keep quick-menu IDs aligned with `appAuthentication.js` expectations so primary navigation works.
