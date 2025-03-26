# ELO Tracker

A full-stack application for tracking player ELO ratings in games or sports. Built with Next.js and Supabase, deployed on Vercel.

## Features

- **Player Management**: Add players and view their ELO ratings
- **Match Recording**: Record matches between teams with scores
- **History Tracking**: View match history and ELO changes over time
- **ELO Calculation**: Automatic ELO rating adjustments based on match results

## Technology Stack

- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/elo-tracker.git
cd elo-tracker
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up Supabase**

- Create a new project in [Supabase](https://supabase.com/)
- Get your project URL and anon key from the API settings
- Run the SQL from `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor
- Optionally run the seed data from `supabase/seed.sql`

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
