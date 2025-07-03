/*
  # Create sessions table

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students.id)
      - `mood_emoji` (text, not null)
      - `mood_score` (integer, default 0)
      - `sel_skill` (text, not null)
      - `transcript` (text, default empty string)
      - `flags` (text array, default empty array)
      - `duration` (integer, default 0)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `sessions` table
    - Add policy for anonymous users to insert, update, and read session data
    - Add foreign key constraint to students table

  3. Indexes
    - Add index on student_id for faster queries
    - Add index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  mood_emoji text NOT NULL,
  mood_score integer DEFAULT 0,
  sel_skill text NOT NULL,
  transcript text DEFAULT '',
  flags text[] DEFAULT '{}',
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'sessions_student_id_fkey'
  ) THEN
    ALTER TABLE sessions ADD CONSTRAINT sessions_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS sessions_student_id_idx ON sessions(student_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to sessions"
  ON sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);