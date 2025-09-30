import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Observable } from 'rxjs';

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

  
    

}
