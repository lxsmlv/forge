export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  car: string | null;
  sports: string[];
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  image_url: string;
  caption: string;
  category: 'gym' | 'cars' | 'lifestyle' | 'sport';
  created_at: string;
  author?: User;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  created_at: string;
  author?: User;
}

export interface Workout {
  id: string;
  user_id: string;
  type: 'gym' | 'tennis' | 'padel' | 'running' | 'other';
  duration_min: number;
  notes: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  text: string;
  category: 'car' | 'gym' | 'personal' | 'general';
  is_done: boolean;
  due_date: string | null;
  created_at: string;
}

export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}
