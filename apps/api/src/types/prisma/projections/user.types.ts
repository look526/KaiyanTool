export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: string;
  role: string;
  created_at: Date;
}

export interface UserDetail extends UserListItem {
  storage_used: bigint;
  storage_limit: bigint;
  last_login_at: Date | null;
  bio: string | null;
}
