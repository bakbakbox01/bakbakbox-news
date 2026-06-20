export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive?: boolean;
}

export interface AuthData {
  admin: Admin;
  token: string;
}
