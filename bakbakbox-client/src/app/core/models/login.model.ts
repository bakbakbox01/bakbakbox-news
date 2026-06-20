export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginFormValue {
  email: string;
  password: string;
  rememberMe: boolean;
}
