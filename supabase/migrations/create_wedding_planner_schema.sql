/*
  # Wedding Planner Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `couple_names` (text)
      - `wedding_date` (date)
      - `email` (text)
      - `created_at` (timestamp)
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `task_name` (text)
      - `phase` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
    - `vendors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `type` (text)
      - `email` (text)
      - `phone` (text)
      - `cost` (text)
      - `notes` (text)
      - `created_at` (timestamp)
    - `guests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `group_name` (text)
      - `rsvp_status` (text)
      - `plus_one` (text)
      - `table_number` (integer)
      - `dietary_restrictions` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access only their own data
    - Add admin override policies
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_names text NOT NULL,
  wedding_date date,
  email text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_name text NOT NULL,
  phase text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  cost text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  group_name text DEFAULT '',
  rsvp_status text DEFAULT 'pending',
  plus_one text DEFAULT '',
  table_number integer,
  dietary_restrictions text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users can manage own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for vendors
CREATE POLICY "Users can manage own vendors"
  ON vendors
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for guests
CREATE POLICY "Users can manage own guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert default tasks for new users (trigger function)
CREATE OR REPLACE FUNCTION create_default_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- 12+ Months Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Set your wedding date', '12+ Months Before'),
    (NEW.id, 'Determine your budget', '12+ Months Before'),
    (NEW.id, 'Create guest list (rough estimate)', '12+ Months Before'),
    (NEW.id, 'Research and book venue', '12+ Months Before'),
    (NEW.id, 'Hire wedding planner (optional)', '12+ Months Before'),
    (NEW.id, 'Start shopping for wedding dress', '12+ Months Before'),
    (NEW.id, 'Research photographers', '12+ Months Before'),
    (NEW.id, 'Book photographer', '12+ Months Before'),
    (NEW.id, 'Research caterers', '12+ Months Before'),
    (NEW.id, 'Book caterer', '12+ Months Before');

  -- 8-12 Months Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Send save the dates', '8-12 Months Before'),
    (NEW.id, 'Register for gifts', '8-12 Months Before'),
    (NEW.id, 'Book officiant', '8-12 Months Before'),
    (NEW.id, 'Book florist', '8-12 Months Before'),
    (NEW.id, 'Book band/DJ', '8-12 Months Before'),
    (NEW.id, 'Order wedding dress', '8-12 Months Before'),
    (NEW.id, 'Book transportation', '8-12 Months Before'),
    (NEW.id, 'Plan honeymoon', '8-12 Months Before'),
    (NEW.id, 'Book honeymoon', '8-12 Months Before'),
    (NEW.id, 'Engagement party planning', '8-12 Months Before');

  -- 4-8 Months Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Order invitations', '4-8 Months Before'),
    (NEW.id, 'Plan bachelor/bachelorette parties', '4-8 Months Before'),
    (NEW.id, 'Book hair and makeup artists', '4-8 Months Before'),
    (NEW.id, 'Choose wedding cake', '4-8 Months Before'),
    (NEW.id, 'Plan rehearsal dinner', '4-8 Months Before'),
    (NEW.id, 'Shop for wedding rings', '4-8 Months Before'),
    (NEW.id, 'Plan ceremony details', '4-8 Months Before'),
    (NEW.id, 'Choose wedding party attire', '4-8 Months Before'),
    (NEW.id, 'Book accommodations for guests', '4-8 Months Before'),
    (NEW.id, 'Apply for marriage license', '4-8 Months Before');

  -- 2-4 Months Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Send wedding invitations', '2-4 Months Before'),
    (NEW.id, 'Finalize guest list', '2-4 Months Before'),
    (NEW.id, 'Order wedding favors', '2-4 Months Before'),
    (NEW.id, 'Plan seating arrangements', '2-4 Months Before'),
    (NEW.id, 'Write wedding vows', '2-4 Months Before'),
    (NEW.id, 'Schedule dress fittings', '2-4 Months Before'),
    (NEW.id, 'Confirm all vendors', '2-4 Months Before'),
    (NEW.id, 'Create wedding day timeline', '2-4 Months Before'),
    (NEW.id, 'Plan wedding day emergency kit', '2-4 Months Before'),
    (NEW.id, 'Confirm honeymoon details', '2-4 Months Before');

  -- 1-2 Months Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Final dress fitting', '1-2 Months Before'),
    (NEW.id, 'Confirm final headcount with caterer', '1-2 Months Before'),
    (NEW.id, 'Finalize seating chart', '1-2 Months Before'),
    (NEW.id, 'Confirm transportation details', '1-2 Months Before'),
    (NEW.id, 'Break in wedding shoes', '1-2 Months Before'),
    (NEW.id, 'Prepare wedding day emergency kit', '1-2 Months Before'),
    (NEW.id, 'Confirm ceremony and reception details', '1-2 Months Before'),
    (NEW.id, 'Get marriage license', '1-2 Months Before'),
    (NEW.id, 'Prepare vendor payments', '1-2 Months Before'),
    (NEW.id, 'Delegate wedding day responsibilities', '1-2 Months Before');

  -- 1 Week Before tasks
  INSERT INTO tasks (user_id, task_name, phase) VALUES
    (NEW.id, 'Confirm all vendor arrival times', '1 Week Before'),
    (NEW.id, 'Pack for honeymoon', '1 Week Before'),
    (NEW.id, 'Prepare wedding day timeline for vendors', '1 Week Before'),
    (NEW.id, 'Rehearsal and rehearsal dinner', '1 Week Before'),
    (NEW.id, 'Get manicure/pedicure', '1 Week Before'),
    (NEW.id, 'Prepare vendor tip envelopes', '1 Week Before'),
    (NEW.id, 'Confirm weather backup plans', '1 Week Before'),
    (NEW.id, 'Rest and relax', '1 Week Before'),
    (NEW.id, 'Prepare emergency contact list', '1 Week Before'),
    (NEW.id, 'Final venue walkthrough', '1 Week Before');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add default tasks when profile is created
CREATE OR REPLACE TRIGGER create_default_tasks_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_tasks();
