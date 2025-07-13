import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  couple_names: string;
  wedding_date: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  task_name: string;
  phase: string;
  completed: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  cost: string;
  notes: string;
  created_at: string;
}

export interface Guest {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  group_name: string;
  rsvp_status: string;
  plus_one: string;
  table_number: number | null;
  dietary_restrictions: string;
  created_at: string;
}

// Auth functions
export const authFunctions = {
  async signUp(email: string, password: string, coupleNames: string, weddingDate?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          couple_names: coupleNames,
          wedding_date: weddingDate || null,
          email,
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  }
};

// Database functions
export const dbFunctions = {
  // Tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at');

    if (error) throw error;
    return data as Task[];
  },

  async updateTask(id: string, completed: boolean) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id);

    if (error) throw error;
  },

  async addTask(taskName: string, phase: string) {
    const user = await authFunctions.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        task_name: taskName,
        phase,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Vendors
  async getVendors() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at');

    if (error) throw error;
    return data as Vendor[];
  },

  async addVendor(vendor: Omit<Vendor, 'id' | 'user_id' | 'created_at'>) {
    const user = await authFunctions.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        ...vendor,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Vendor;
  },

  async updateVendor(id: string, vendor: Partial<Vendor>) {
    const { error } = await supabase
      .from('vendors')
      .update(vendor)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteVendor(id: string) {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Guests
  async getGuests() {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at');

    if (error) throw error;
    return data as Guest[];
  },

  async addGuest(guest: Omit<Guest, 'id' | 'user_id' | 'created_at'>) {
    const user = await authFunctions.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('guests')
      .insert({
        user_id: user.id,
        ...guest,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Guest;
  },

  async updateGuest(id: string, guest: Partial<Guest>) {
    const { error } = await supabase
      .from('guests')
      .update(guest)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteGuest(id: string) {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Admin functions
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
  },

  async getProfileProgress(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.length;
    const completed = data.filter(task => task.completed).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeTasks(callback: (tasks: Task[]) => void) {
    return supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        dbFunctions.getTasks().then(callback);
      })
      .subscribe();
  },

  subscribeVendors(callback: (vendors: Vendor[]) => void) {
    return supabase
      .channel('vendors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => {
        dbFunctions.getVendors().then(callback);
      })
      .subscribe();
  },

  subscribeGuests(callback: (guests: Guest[]) => void) {
    return supabase
      .channel('guests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => {
        dbFunctions.getGuests().then(callback);
      })
      .subscribe();
  }
};
