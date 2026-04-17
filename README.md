# Planning Poker (Supabase + Vercel)

A real-time, premium Planning Poker application for agile teams.

## 🚀 Setup Instructions

To get this running locally or on Vercel, follow these steps:

### 1. Supabase Setup
Create a new project on [Supabase.io](https://supabase.io) and run the following SQL in the **SQL Editor**:

```sql
-- Create Rooms table
create table rooms (
  id text primary key,
  is_revealed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Votes table
create table votes (
  id uuid default gen_random_uuid() primary key,
  room_id text references rooms(id) on delete cascade not null,
  user_name text not null,
  vote_value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, user_name)
);

-- Enable Realtime for both tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table votes;

-- Enable Public Access (RLS)
-- If sync doesn't work, ensure these policies are applied:
alter table rooms enable row level security;
alter table votes enable row level security;

create policy "Allow public read rooms" on rooms for select using (true);
create policy "Allow public insert rooms" on rooms for insert with check (true);
create policy "Allow public update rooms" on rooms for update using (true);

create policy "Allow public read votes" on votes for select using (true);
create policy "Allow public insert votes" on votes for insert with check (true);
create policy "Allow public update votes" on votes for update using (true);
create policy "Allow public delete votes" on votes for delete using (true);
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
Simply push your repository to GitHub and connect it to Vercel. Don't forget to add the environment variables in the Vercel dashboard.

## ✨ Features
- **Instant Sync**: Real-time voting status and results.
- **Presence**: See who is currently in the room.
- **Premium UI**: Glassmorphism, smooth animations, and a polished dark theme.
- **Fibonacci Scale**: Optimized for standard agile estimations.
- **Mobile Friendly**: Works great on any device.
