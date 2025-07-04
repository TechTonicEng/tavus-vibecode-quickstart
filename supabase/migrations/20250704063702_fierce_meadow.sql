/*
  # Enhanced T.E.S.S. Features Migration

  1. New Tables
    - `context_tags` - Predefined context options for mood check-ins
    - `sel_goals` - Available SEL goals for students
    - `student_goals` - Student's selected weekly goals and progress
    - `favorite_skills` - Student's favorited coping strategies
    - `journal_entries` - Daily reflection entries
    - `mini_games` - Available SEL mini-games
    - `game_sessions` - Student's game play sessions

  2. Table Updates
    - Add `context_tag` and `journal_entry` to sessions table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for student and staff access
*/

-- Add new columns to existing sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'context_tag'
  ) THEN
    ALTER TABLE sessions ADD COLUMN context_tag text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'journal_entry'
  ) THEN
    ALTER TABLE sessions ADD COLUMN journal_entry text DEFAULT '';
  END IF;
END $$;

-- Context Tags table
CREATE TABLE IF NOT EXISTS context_tags (
  id text PRIMARY KEY,
  label text NOT NULL,
  emoji text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- SEL Goals table
CREATE TABLE IF NOT EXISTS sel_goals (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Student Goals table
CREATE TABLE IF NOT EXISTS student_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  goal_id text NOT NULL REFERENCES sel_goals(id),
  week_start timestamptz NOT NULL,
  progress boolean[] DEFAULT ARRAY[false, false, false, false, false, false, false],
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Favorite Skills table
CREATE TABLE IF NOT EXISTS favorite_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Mini Games table
CREATE TABLE IF NOT EXISTS mini_games (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  duration integer NOT NULL DEFAULT 120,
  difficulty text NOT NULL DEFAULT 'easy',
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Game Sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  game_id text NOT NULL REFERENCES mini_games(id),
  score integer DEFAULT 0,
  completed boolean DEFAULT false,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE context_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sel_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for context_tags (read-only for all)
CREATE POLICY "Allow anonymous read access to context_tags"
  ON context_tags
  FOR SELECT
  TO anon
  USING (true);

-- Policies for sel_goals (read-only for all)
CREATE POLICY "Allow anonymous read access to sel_goals"
  ON sel_goals
  FOR SELECT
  TO anon
  USING (true);

-- Policies for student_goals
CREATE POLICY "Allow anonymous access to student_goals"
  ON student_goals
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for favorite_skills
CREATE POLICY "Allow anonymous access to favorite_skills"
  ON favorite_skills
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for journal_entries
CREATE POLICY "Allow anonymous access to journal_entries"
  ON journal_entries
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for mini_games (read-only for all)
CREATE POLICY "Allow anonymous read access to mini_games"
  ON mini_games
  FOR SELECT
  TO anon
  USING (true);

-- Policies for game_sessions
CREATE POLICY "Allow anonymous access to game_sessions"
  ON game_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default context tags
INSERT INTO context_tags (id, label, emoji, color) VALUES
  ('before-school', 'Before School', '🌅', '#FFB347'),
  ('during-class', 'During Class', '📚', '#87CEEB'),
  ('recess', 'Recess', '⚽', '#98FB98'),
  ('lunch', 'Lunch Time', '🍎', '#F0E68C'),
  ('group-work', 'Group Work', '👥', '#DDA0DD'),
  ('test-quiz', 'Test/Quiz', '📝', '#FFA07A'),
  ('at-home', 'At Home', '🏠', '#F5DEB3'),
  ('after-school', 'After School', '🎒', '#B0E0E6'),
  ('with-friends', 'With Friends', '👫', '#FFB6C1'),
  ('family-time', 'Family Time', '👨‍👩‍👧‍👦', '#FFDAB9')
ON CONFLICT (id) DO NOTHING;

-- Insert default SEL goals
INSERT INTO sel_goals (id, title, description, category, icon) VALUES
  ('stay-calm-frustrated', 'Stay calm when frustrated', 'Practice breathing and counting when things don''t go my way', 'emotional-regulation', '🧘‍♀️'),
  ('ask-for-help', 'Ask for help when overwhelmed', 'Recognize when I need support and reach out to trusted adults', 'self-awareness', '🙋‍♀️'),
  ('speak-kindly', 'Speak kindly to others', 'Use respectful words and tone when talking to classmates and teachers', 'social-skills', '💝'),
  ('listen-actively', 'Listen when others are talking', 'Pay attention and show I''m listening with my body and words', 'social-skills', '👂'),
  ('manage-big-feelings', 'Manage big feelings', 'Use my coping strategies when emotions feel too big', 'emotional-regulation', '💪'),
  ('include-others', 'Include others in activities', 'Invite classmates to join games and group activities', 'social-skills', '🤝'),
  ('think-before-acting', 'Think before I act', 'Pause and consider consequences before making decisions', 'responsible-decision-making', '🤔'),
  ('celebrate-others', 'Celebrate others'' success', 'Feel happy for my friends when good things happen to them', 'social-skills', '🎉')
ON CONFLICT (id) DO NOTHING;

-- Insert default mini games
INSERT INTO mini_games (id, title, description, type, duration, difficulty, content) VALUES
  ('match-the-feeling', 'Match the Feeling', 'Drag emotions to match the right situations', 'matching', 120, 'easy', '{"pairs": [{"emotion": "😊", "situation": "Getting a good grade on a test"}, {"emotion": "😢", "situation": "Losing your favorite toy"}, {"emotion": "😠", "situation": "Someone cuts in line"}, {"emotion": "😰", "situation": "Speaking in front of the class"}, {"emotion": "😴", "situation": "Staying up too late"}, {"emotion": "🤗", "situation": "Hugging a friend"}]}'),
  ('what-would-you-do', 'What Would You Do?', 'Choose the best response to different situations', 'scenario', 180, 'medium', '{"scenarios": [{"situation": "Your friend accidentally breaks your pencil during art class.", "options": [{"text": "Get angry and yell at them", "points": 0, "feedback": "This might hurt your friendship. Try a calmer approach."}, {"text": "Say \"It''s okay, accidents happen\"", "points": 3, "feedback": "Great! You showed understanding and kindness."}, {"text": "Ignore them for the rest of the day", "points": 1, "feedback": "This might make things worse. Communication is better."}, {"text": "Ask the teacher for a new pencil", "points": 2, "feedback": "Good problem-solving, but talking to your friend first would be even better."}]}]}'),
  ('emotion-detective', 'Emotion Detective', 'Identify emotions from facial expressions and body language', 'quiz', 150, 'easy', '{"questions": [{"question": "What emotion is this person showing?", "image": "😊", "options": ["Happy", "Sad", "Angry", "Scared"], "correct": 0, "explanation": "A smile usually means someone is happy or content!"}, {"question": "If someone has their arms crossed and is frowning, they might be:", "options": ["Excited", "Upset or defensive", "Sleepy", "Hungry"], "correct": 1, "explanation": "Crossed arms and frowning often show someone is upset or protecting themselves."}, {"question": "When someone is fidgeting and looking around, they might feel:", "options": ["Calm", "Nervous or anxious", "Angry", "Bored"], "correct": 1, "explanation": "Fidgeting and looking around can be signs of nervousness or anxiety."}]}')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS student_goals_student_id_idx ON student_goals(student_id);
CREATE INDEX IF NOT EXISTS student_goals_week_start_idx ON student_goals(week_start);
CREATE INDEX IF NOT EXISTS favorite_skills_student_id_idx ON favorite_skills(student_id);
CREATE INDEX IF NOT EXISTS journal_entries_student_id_idx ON journal_entries(student_id);
CREATE INDEX IF NOT EXISTS journal_entries_session_id_idx ON journal_entries(session_id);
CREATE INDEX IF NOT EXISTS game_sessions_student_id_idx ON game_sessions(student_id);
CREATE INDEX IF NOT EXISTS game_sessions_created_at_idx ON game_sessions(created_at DESC);