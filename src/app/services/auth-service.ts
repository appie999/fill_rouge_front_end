import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse, RegisterRequest } from '../model/auth.model';
import { jwtDecode } from 'jwt-decode';
import { AuthToken } from '../model/AuthToken';


@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = "http://localhost:8080/auth"
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  token: string | null = localStorage.getItem('token');

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }


  login(email: string, password: string): Observable<AuthResponse> {
    console.log('Attempting login with backend API for:', email);
    
    // Real API call to backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email: email,
      password: password
    });
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    console.log('Attempting registration with backend API for:', payload.email);
    
    // Real API call to backend
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }


  saveAuthData(token: string){
    localStorage.setItem('token', token);
    this.token = token;
    this.isAuthenticatedSubject.next(true); // Notify components of auth state change
  }

  getUserName(): string | null {

    const decodedToken = this.getDecodedToken(this.token);
    
    return `${decodedToken?.firstName} ${decodedToken?.lastName}`.trim() || "user";
  }

    getEmail(): string {

    const decodedToken = this.getDecodedToken(this.token);
    
    return `${decodedToken?.email}`.trim();
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.token = null;
    this.isAuthenticatedSubject.next(false); // Notify components of auth state change
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(token: string | null): string | null {
    return this.getDecodedToken(token)?.role || null;
  }

  hasRole(role: string): boolean {
    const token = localStorage.getItem('token');
    return (this.getRole( token ) || '').toUpperCase() === role.toUpperCase();
  }

  getDecodedToken ( token: string | null ) {
    return token ? jwtDecode<AuthToken>( token ) : null;
  }

  isTokenExpired ( token: string | null ): boolean {
    if (token) {
      const decoded: any = jwtDecode(token)
      const decodedExpDate = decoded.exp;
      const currentDate = Date.now() / 1000;

      return decodedExpDate < currentDate;
    }
    return true;
  }

}
