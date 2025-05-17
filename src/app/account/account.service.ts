import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../shared/models/user';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../shared/models/JwtPayload';
import { SignupRequest } from '../shared/models/signupRequest';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  getCurrentUser(): User | null {
    console.log('Current user:', this.currentUserSource.getValue());
    return this.currentUserSource.getValue();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // loadUser() {
  //   const token = this.getToken();
  //   if (token) {
  //     const headers = new HttpHeaders({
  //       Authorization: `Bearer ${token}`
  //     });

  //     this.http.get<User>(`${this.apiUrl}/user`, { headers }).subscribe({
  //       next: (user) => {
  //         this.currentUserSource.next(user);
  //       },
  //       error: (error) => {
  //         console.error('Erreur lors du chargement de l\'utilisateur:', error);
  //       }
  //     });
  //   }
  // }
  loadUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) return this.currentUser$;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      map((user) => {
        console.log('[DEBUG] loadUser() raw response:', user);

        try {
          const decoded: JwtPayload = jwtDecode(token);
          const userWithId: User = {
            ...user,
            id: decoded.id,
            token: token,
            // role: decoded.role,
          };

          console.log('[DEBUG] loadUser() patched user:', userWithId);
          this.currentUserSource.next(userWithId);
          return userWithId;
        } catch (err) {
          console.error('[DEBUG] Failed to decode token in loadUser():', err);
          return null;
        }
      }),
      catchError((err) => {
        console.error('[DEBUG] Failed to load user from API:', err);
        return of(null);
      })
    );
  }



  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Utilise le type JwtPayload que tu viens de définir
      const tokenPayload: JwtPayload = jwtDecode(token);
      return tokenPayload.id || null;  // 🔹 Récupération de l'ID
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
      return null;
    }
  }

  login(values: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, values).pipe(
      map((response) => {
        const token = response.token;
        localStorage.setItem('token', token);

        // Décoder le token pour obtenir l'ID
        const decodedToken: JwtPayload = jwtDecode(token);
        const user: User = {
          username: response.username,
          token: token,
          role: response.role,
          id: decodedToken.id,  // Extraire l'ID du token
          email: "",
          enabled: true,
        };

        // Mettre à jour l'utilisateur avec l'ID
        this.currentUserSource.next(user);

        console.log('Utilisateur connecté:', user);
        console.log('Rôle de l\'utilisateur:', user.role);
        console.log('ID de l\'utilisateur:', user.id);

        // Redirection en fonction du rôle
        if (user.role === 'ROLE_ADMIN') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/store');
        }

        return user;
      })
    );
  }


  register(username: string, email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/register`,
        { username, email, password },
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de l\'inscription:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message || 'Erreur lors de l\'inscription.'
              )
          );
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/');
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.roles || [];
    } catch (error) {
      console.error('Erreur lors de l\'analyse du token JWT:', error);
      return [];
    }
  }
}
