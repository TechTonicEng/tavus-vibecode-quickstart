/*
  # Create educators table

  1. New Tables
    - `educators`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique, not null)
      - `class_ids` (text array, default empty array)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `educators` table
    - Add policy for anonymous users to read educator data

  3. Indexes
    - Add unique index on email
*/

CREATE TABLE IF NOT EXISTS educators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  class_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add index for email lookups
CREATE UNIQUE INDEX IF NOT EXISTS educators_email_idx ON educators(email);

ALTER TABLE educators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to educators"
  ON educators
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to educators"
  ON educators
  FOR INSERT
  TO anon
  WITH CHECK (true);