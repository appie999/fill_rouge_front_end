export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName: string;
  role: 'DOCTOR' | 'PATIENT';
  specialization?: string;
}


export interface AuthResponse {
  token: string; 
}