# Technology Stack - LearnToAction (Tier 1 MVP)

This document outlines the technical architecture and libraries used in the `learntoaction` project.

---

## 🏗️ Architecture Overview
*   **Type:** Monorepo (Single Repository) containing Frontend and Backend.
*   **Pattern:** Single-Tenant MVP (Ghost Multi-tenancy capable).
*   **Database strategy:** Relational (PostgreSQL) with strict Schema.

---

## 🖥️ Frontend (Web)
Located in `/web`

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | **React** | v19.0 | Core UI library. |
| **Build Tool** | **Vite** | v7.2 | Fast development server and bundler. |
| **Language** | **TypeScript** | v5.9 | Type safety. |
| **Styling** | **Tailwind CSS** | **v4.0** | Utility-first CSS (Newest version). |
| **Routing** | **React Router** | v7.1 | Client-side navigation (`/builder`, `/w/:slug`). |
| **State** | **Zustand** | v5.0 | Global state management (Minimalist). |
| **Forms** | **React Hook Form** | v7.71 | Efficient form validation and inputs. |
| **HTTP Client** | **Axios** | v1.13 | API requests. |
| **Icons** | **Lucide React** | v0.563 | Modern, clean SVG icons. |

---

## ⚙️ Backend (API)
Located in `/api`

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | **NestJS** | v11.0 | Enterprise-grade Node.js framework. |
| **Language** | **TypeScript** | v5.7 | Strict type safety. |
| **Runtime** | **Node.js** | v18+ | JavaScript runtime. |
| **Validation** | **Zod** | v4.3 | Runtime schema validation for JSON content. |
| **Database Driver** | **pg** | Native | Direct PostgreSQL connection for performance. |

---

## 💾 Database & Infrastructure

| Category | Technology | Details |
| :--- | :--- | :--- |
| **Database** | **PostgreSQL** | v14+ | Relational data, JSONB support for schemas. |
| **ORM / Schema**| **Prisma** | _(Schema Only)_ | Used for defining `schema.prisma` and migrations. |
| **Hosting** | _None (Local)_ | Currently runs on `localhost:3000` & `5174`. |

---

## 🛠️ Key Libraries & Decisions

### 1. Tailwind CSS v4
We are using the latest "Oxford" engine of Tailwind.
*   **Config:** Zero-config (No `tailwind.config.js` needed for basics).
*   **Import:** `@import "tailwindcss";` in CSS.

### 2. Vertical-Scroll Runtime
Instead of a complex paginated wizard, we use a single-page vertical scroll for the Student experience.
*   **Benefit:** Better mobile experience (swipe vs click).
*   **Tech:** Standard HTML `form` with scroll-margin offsets.

### 3. "Ghost" Multi-Tenancy
Although this is a **Single Tenant** launch, the database has `workspaceId` columns on every table.
*   **Benefit:** 100% ready for SaaS upgrade (Tier 2) without database migration.
*   **Current State:** Hardcoded to a default UUID `0000...` via `workspaceId` constant.
