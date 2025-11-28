# Hackathon Frontend 2025

This is the frontend project for Hackathon 2025, built with **Angular 19** and TypeScript.  
This README provides step-by-step instructions for setting up, cleaning caches, building, and running the project locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Project Folder Structure](#project-folder-structure)  
3. [Install Angular CLI](#install-angular-cli)  
4. [Clean npm Cache](#clean-npm-cache)  
5. [Install Dependencies](#install-dependencies)  
6. [Build the Project](#build-the-project)  
7. [Run the Project Locally](#run-the-project-locally)  
8. [Troubleshooting](#troubleshooting)  

---

## 1. Prerequisites

Make sure you have installed:

- **Node.js 18+**  
- **npm** (comes with Node.js)  
- **Angular CLI 19**

Check installed versions:

```bash
node -v
npm -v
ng version
```

---

## 2. Project Folder Structure

Navigate to your project folder (`C:\Personal\hackathon-frontend`) and ensure it looks like this:

```
hackathon-frontend/
├─ src/
│  ├─ app/             # Angular components, modules, services
│  ├─ assets/          # Static files like images, icons
│  ├─ index.html
│  ├─ main.ts          # Angular bootstrap
│  ├─ polyfills.ts     # Required browser polyfills
│  └─ styles.scss
├─ angular.json
├─ package.json
├─ tsconfig.json
└─ tsconfig.app.json
```

### Example `polyfills.ts` (Angular 19 minimal):

```ts
/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** Zone JS is required by Angular */
import 'zone.js';  // Included with Angular CLI
```

---

## 3. Install Angular CLI

Open terminal in **any folder** (preferably Administrator on Windows) and run:

```bash
npm install -g @angular/cli
```

Verify installation:

```bash
ng version
```

---

## 4. Clean npm Cache

Sometimes cached dependencies cause errors. Run:

```bash
npm cache clean --force
```

Also remove `node_modules` and `package-lock.json` if present:

```bash
rm -rf node_modules package-lock.json
```

Windows PowerShell alternative:

```powershell
rd /s /q node_modules
del package-lock.json
```

---

## 5. Install Dependencies

From **project root** (`C:\Personal\hackathon-frontend`):

```bash
npm install
```

> If you face dependency conflicts:

```bash
npm install --legacy-peer-deps
```

---

## 6. Build the Project

Build for development (default configuration):

```bash
npm run build
```

Build for production:

```bash
ng build --configuration production
```

Output will be in the `dist/` folder:

```
hackathon-frontend/dist/prolik-frontend-ui/
```

---

## 7. Run the Project Locally

To start a local development server, run:

```bash
ng serve --open
```

- The project will compile and automatically open in your default browser.  
- Default URL: [http://localhost:4200](http://localhost:4200)  

```

---

## 8. Troubleshooting

### Common Issues

1. **Missing polyfills.ts**  
Ensure `src/polyfills.ts` exists and contains:

```ts
import 'zone.js';
```

2. **Dependency errors**  
Clear cache and reinstall:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

3. **Angular CLI commands fail**  
Verify CLI installation and version:

```bash
ng version
```

---

## Notes

- All commands must be run from the **project root** (`C:\Personal\hackathon-frontend`) unless specified otherwise.  
- Always clear cache if installation or build fails.  
- Angular 19 uses Zone.js 0.15.x and TypeScript 5.x.

