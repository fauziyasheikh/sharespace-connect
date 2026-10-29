export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | string;
  trained: boolean;
  verified?: boolean;
  points?: number;
}

export interface Resource {
  id: string;
  owner_id?: string | null;
  name: string;
  category: string;
  location: string;
  description: string | null;
  rules: string | null;
  requires_training: boolean;
  max_days: number;
  image_url?: string | null;
  status?: string | null;
}

export interface Booking {
  id: string;
  resource_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  purpose: string;
  status: 'pending' | 'waitlisted' | 'approved' | 'declined' | 'in_use' | 'completed' | 'cancelled' | string;
  decision_reason?: string | null;
  created_at?: string;
  resource?: Resource;
  requester?: Profile;
}

export interface ActivityLog {
  id: string;
  action: string;
  booking_id?: string | null;
  actor_id?: string | null;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at?: string;
}
