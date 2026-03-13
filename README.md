# 🚀 Job Flow

An AI-powered web application to help users **track job applications, analyze resumes, and match job descriptions with required skills**.
Built with **Next.js, TypeScript, Supabase, NextAuth.js, and Groq AI**.

---

## ✨ Features

- 🔐 **Authentication** – Simple username/password login using NextAuth.js.
- 📂 **Job Application Tracker** – Add, edit, and filter applications by status.
- 📄 **Resume Upload** – Upload and store your resume (PDF) in Supabase Storage.
- 🤖 **AI Resume Analyzer** – Get AI-powered suggestions to improve your resume.
- 📊 **AI Job Description Matcher** – Compare resumes with job descriptions and highlight missing skills.
- 📈 **Dashboard & Analytics** – Visualize application progress.
- 🌐 **Deployment Ready** – Hosted on Vercel with Supabase backend.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend:** Next.js API Routes
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Auth:** [NextAuth.js](https://next-auth.js.org/) (Credentials provider)
- **AI:** [Groq](https://groq.com/) (Llama 3.3 70B via OpenAI-compatible API)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```
job-flow/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── jobs/         # Job tracker page
│   │   ├── resumes/      # Resume management page
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── public/               # Static assets
├── .env                  # Environment variables
└── README.md             # Project documentation
```

---

## ⚡ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR-USERNAME/job-flow.git
cd job-flow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

### 4. Set up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  email text unique not null,
  password text not null,
  name text,
  created_at timestamp with time zone default now()
);

create table jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  position text not null,
  company text not null,
  status text not null,
  description text,
  created_at timestamp with time zone default now()
);

create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  file_url text not null,
  created_at timestamp with time zone default now()
);
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
4. Deploy!

---

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server-side operations) |
| `GROQ_API_KEY` | Your Groq API key (get from [console.groq.com](https://console.groq.com/keys)) |
| `NEXTAUTH_URL` | Your app URL (localhost or production) |
| `NEXTAUTH_SECRET` | Random secret for JWT encryption |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
