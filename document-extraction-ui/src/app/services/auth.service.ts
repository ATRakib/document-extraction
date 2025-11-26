import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginRequest {
  Username: string;
  Password: string;
}

interface RegisterRequest {
  Username: string;
  Email: string;
  Password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  Id: number;
  Username: string;
  Email: string;
  IsActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api/auth';
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

 

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials, { 
        withCredentials: true 
    }).pipe(
        tap((response) => {
            // Token localStorage এ save করুন
            localStorage.setItem('access_token', response.access_token);
            this.loadCurrentUser();
        })
    );
}

getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`, { 
        withCredentials: true 
    });
}

  loadCurrentUser() {
    this.getCurrentUser().subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, BehaviorSubject, tap } from 'rxjs';
// import { Router } from '@angular/router';

// interface LoginRequest {
//     Username: string;
//     Password: string;
// }

// interface RegisterRequest {
//     Username: string;
//     Email: string;
//     Password: string;
// }

// interface TokenResponse {
//     access_token: string;
//     token_type: string;
// }

// interface UserResponse {
//     Id: number;
//     Username: string;
//     Email: string;
//     IsActive: boolean;
// }

// @Injectable({
//     providedIn: 'root'
// })
// export class AuthService {
//     private apiUrl = 'http://127.0.0.1:8000/api/auth'; 
//     private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
//     public currentUser$ = this.currentUserSubject.asObservable();

//     constructor(
//         private http: HttpClient,
//         private router: Router
//     ) {}

//     login(credentials: LoginRequest): Observable<TokenResponse> {
//         return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
//             tap(() => this.loadCurrentUser())
//         );
//     }

//     register(data: RegisterRequest): Observable<any> {
//         return this.http.post(`${this.apiUrl}/register`, data);
//     }

//     logout(): Observable<any> {
//         return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
//             tap(() => {
//                 this.currentUserSubject.next(null);
//                 this.router.navigate(['/login']);
//             })
//         );
//     }

//     getCurrentUser(): Observable<UserResponse> {
//         return this.http.get<UserResponse>(`${this.apiUrl}/me`, { withCredentials: true });
//     }

//     loadCurrentUser(): void {
//         this.getCurrentUser().subscribe({
//             next: (user) => this.currentUserSubject.next(user),
//             error: () => this.currentUserSubject.next(null)
//         });
//     }

//     isAuthenticated(): boolean {
//         return this.currentUserSubject.value !== null;
//     }
// }