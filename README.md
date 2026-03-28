# Finance Tracker

A web app for tracking **income** and **expenses**. Users sign in with a username and password, add and manage their transactions, and see a dashboard with summaries and charts. An **admin** account can view all users and their financial totals.

## How to run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Convex (keep this terminal open):

   ```bash
   npx convex dev
   ```

3. Create `.env.local` in the project root with your Convex URL (the CLI usually adds this after step 2):

   ```env
   CONVEX_URL=https://your-deployment.convex.cloud
   ```

4. In another terminal, start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

**Admin login (demo):** username `admin`, password `admin123`. Other accounts can be created on the Register page.
