# NymAI Landing Page

<div align="center">
<img width="1200" height="475" alt="NymAI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

The official landing page for NymAI - an AI-powered engine that instantly verifies the authenticity and credibility of any text, image, or video.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   
2. **npm** (comes with Node.js) or **yarn** or **pnpm**
   - Verify installation: `npm --version`
   
3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/nymai-landing.git
cd nymai-landing
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

**What this does:**
- Installs React, React DOM, React Router, and other dependencies
- Installs Vite and TypeScript as development dependencies
- Creates a `node_modules` folder with all packages

**Expected output:**
```
added 1234 packages, and audited 1235 packages in 45s
```

### Step 3: Set Up Environment Variables

#### Option A: Using Environment Variables (Recommended for Production)

1. Create a `.env` file in the root directory:

```bash
# On Linux/Mac
touch .env

# On Windows (PowerShell)
New-Item -Path .env -ItemType File
```

2. Copy the example environment file and edit it:

```bash
# Copy the example file
cp .env.example .env

# Or manually create .env with these variables:
```

3. Add the following variables to your `.env` file:

```env
# Supabase Configuration
# SECURITY NOTE: These values are SAFE TO BE PUBLIC
# - Supabase anon keys are designed to be public (protected by Row Level Security)
# - Supabase URL is a public endpoint
VITE_SUPABASE_URL=https://rpnprnyoylifxxstdxzg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_BB5Hs1o7Za_hR00TC23GxA__bFgMKqO
```

**Important Notes:**
- The `.env` file is gitignored and will NOT be committed to the repository
- These values have defaults in the code, so the app will work without `.env` file
- Supabase anon keys are intentionally public - this is safe and expected
- Never commit your `.env` file to version control

#### Option B: Using Defaults (Works Immediately)

If you don't create a `.env` file, the application will use hardcoded defaults. This works for development but is not recommended for production.

## Development

### Starting the Development Server

Run the development server:

```bash
npm run dev
```

**What happens:**
- Vite starts a development server
- The app compiles and watches for file changes
- Hot Module Replacement (HMR) enables instant updates

**Expected output:**
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Accessing the Application

1. Open your web browser
2. Navigate to `http://localhost:5173` (or the port shown in terminal)
3. You should see the NymAI landing page

### Development Features

- **Hot Reload**: Changes to files automatically refresh the browser
- **TypeScript Support**: Type checking and IntelliSense
- **Error Overlay**: Errors display directly in the browser
- **Fast Refresh**: React components update without losing state

### Common Development Tasks

**View the app:**
```bash
npm run dev
```

**Check for TypeScript errors:**
```bash
npx tsc --noEmit
```

**Format code (if Prettier is configured):**
```bash
npx prettier --write .
```

## Building for Production

### Step 1: Create Production Build

Build the application for production:

```bash
npm run build
```

**What this does:**
- Compiles TypeScript to JavaScript
- Bundles and minifies code
- Optimizes assets
- Creates a `dist` folder with production-ready files

**Expected output:**
```
vite v6.2.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.js       245.67 kB
dist/assets/index-def456.css      12.34 kB
```

### Step 2: Preview Production Build Locally

Preview the production build before deploying:

```bash
npm run preview
```

This serves the `dist` folder locally so you can test the production build.

**Expected output:**
```
  ➜  Local:   http://localhost:4173/
```

## Deployment

### Deploying to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings on [vercel.com](https://vercel.com)
   - Navigate to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

### Deploying to Other Platforms

The `dist` folder contains static files that can be deployed to:
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions or deploy `dist` folder
- **AWS S3**: Upload `dist` folder contents
- **Any static hosting service**: Upload `dist` folder contents

### Important Deployment Notes

- Ensure environment variables are set in your hosting platform
- The `vercel.json` file includes security headers (CSP, etc.)
- Content Security Policy is configured for security
- Subresource Integrity (SRI) is enabled for CDN scripts

## Project Structure

```
nymai-landing/
├── public/                 # Static assets (logos, icons)
│   ├── NymAI_full_logo.svg
│   └── NymAI_icon.svg
├── src/
│   ├── components/        # React components
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── LoginForm.tsx
│   │   ├── Pricing.tsx
│   │   └── icons/         # Icon components
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   └── LoginPage.tsx
│   ├── utils/             # Utility functions
│   │   └── extensionId.ts # Extension ID validation
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # Application entry point
├── index.html             # HTML template
├── index.css              # Global styles
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment config (CSP headers)
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Technologies Used

- **React 19** - UI library
- **React Router 7** - Client-side routing
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** (via CDN) - Styling
- **Supabase** - Authentication and database
- **Vercel** - Deployment platform

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port (Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Check TypeScript configuration:

```bash
npx tsc --noEmit
```

### Build Fails

1. Check Node.js version: `node --version` (should be 18+)
2. Clear build cache: `rm -rf dist node_modules/.vite`
3. Reinstall dependencies: `npm install`
4. Try building again: `npm run build`

## Security Notes

- **Environment Variables**: Never commit `.env` files
- **Supabase Keys**: Anon keys are safe to be public (protected by RLS)
- **CSP Headers**: Content Security Policy is configured in `vercel.json`
- **SRI**: Subresource Integrity is enabled for CDN scripts
- **Extension ID Validation**: Extension IDs are validated before use

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation

---

**Built with ❤️ for NymAI**
