-- Run this SQL in Supabase SQL Editor to update the users table for NextAuth

-- Drop existing table if you want to start fresh (optional - be careful!)
-- drop table if exists resumes cascade;
-- drop table if exists jobs cascade;
-- drop table if exists users cascade;

-- Create updated users table with username/password support
-- Only run the alter table commands if the table already exists
-- Or create a new table if starting fresh

-- Option 1: If you want to keep existing data and just add columns:
-- alter table users add column if not exists username text unique;
-- alter table users add column if not exists password text;

-- Option 2: Create fresh table (RECOMMENDED for clean start):
create table users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  email text unique not null,
  password text not null,
  name text,
  image text,
  created_at timestamp with time zone default now()
);

-- Create jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  company text not null,
  position text not null,
  status text not null,
  description text not null,
  created_at timestamp with time zone default now()
);

-- Create resumes table
create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  file_url text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table users enable row level security;
alter table jobs enable row level security;
alter table resumes enable row level security;

-- Create storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;
