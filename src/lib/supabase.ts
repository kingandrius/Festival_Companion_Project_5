// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE CLIENT SETUP
// ─────────────────────────────────────────────────────────────────────────────
//
// STEP 1 — Install the Supabase JS client (run once in your terminal):
//   pnpm add @supabase/supabase-js
//
// STEP 2 — Create a project at https://supabase.com, then go to:
//   Project Settings → API
//   Copy your "Project URL" and "anon public" key.
//
// STEP 3 — Create a .env file in the project root and add:
//   VITE_SUPABASE_URL=https://your-project-id.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key-here
//
//   (Add .env to your .gitignore so the key is never committed.)
//
// STEP 4 — Uncomment the two lines below and delete the placeholder strings.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTED TABLE SCHEMAS
// Run these SQL snippets in Supabase → SQL Editor to create your tables.
// ─────────────────────────────────────────────────────────────────────────────
//
// -- Performances (Schedule + Feed "Happening Now")
// create table performances (
//   id          bigint primary key generated always as identity,
//   day         int not null,          -- 1=Friday, 2=Saturday, 3=Sunday
//   artist      text not null,
//   subgenre    text,
//   stage       text not null,
//   stage_color text not null,         -- 'neon-blue' | 'neon-pink' | 'neon-green' | 'neon-yellow'
//   start_time  time not null,
//   end_time    time not null,
//   category    text not null
// );
//
// -- Food trucks (Food tab)
// create table food_trucks (
//   id          bigint primary key generated always as identity,
//   name        text not null,
//   cuisine     text not null,
//   description text,
//   location    text,
//   wait_time   text,
//   rating      numeric(3,1),
//   price_range text,
//   tags        text[],
//   emoji       text,
//   popular     text,
//   open        boolean default true
// );
//
// -- Announcements (Feed tab)
// create table announcements (
//   id         bigint primary key generated always as identity,
//   type       text,                   -- 'food' | 'alert' | 'info'
//   title      text not null,
//   message    text,
//   color      text,                   -- 'neon-green' | 'neon-pink' | 'neon-purple'
//   created_at timestamptz default now()
// );
// ─────────────────────────────────────────────────────────────────────────────
