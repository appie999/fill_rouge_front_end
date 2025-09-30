import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponse, RegisterRequest } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = "http://localhost:8080/auth"

  constructor(private http: HttpClient, private router: Router) { }


  login( email: string, password: string):Observable <AuthResponse> {
    return this.http.post <AuthResponse> (`${this.apiUrl}/login`, {email, password});
  }

  register(payload: RegisterRequest){
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }


  saveAuthData(token: string, role: string, username?: string){
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if(username){
      localStorage.setItem('username', username);
    }
  }

getUserName(): string | null {
  return localStorage.getItem('username');
}

logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  hasRole(role: string): boolean {
    return (this.getRole() || '').toUpperCase() === role.toUpperCase();
  }

}
