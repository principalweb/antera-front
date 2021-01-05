import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models';
import { tap } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {

    private readonly BASE_API_URL: string = '/protected';

  public static readonly ACCESS_TOKEN: string = "accessToken";
  public static readonly CURRENT_USER_KEY: string = "anteraUser";
  fToken = '';
  constructor(private http: HttpClient) { }

  /**
  *  current user // Rework needed
  */

  public getCurrentUser() {
    let user = localStorage.getItem(AuthService.CURRENT_USER_KEY);
    if (!user) return null;
    return JSON.parse(user);
  }

  public isTokenExpired() {
    const jwt = this.getCurrentUser();
    const current_time = new Date().getTime() / 1000;
    return !!(current_time > jwt.exp);
  }

  /**
   *  current token
   */

  public getToken(): string {
    let token: string = localStorage.getItem(AuthService.ACCESS_TOKEN);
    if (!token) {
      return null;
    }
    return localStorage.getItem(AuthService.ACCESS_TOKEN);
  }

  /**
   * Email Authentication
   * 
   * @param email 
   * @param password 
   */
  signInWithUsernameAndPassword(username: string, password: string): Promise<any> {

    return new Promise((resolve, reject) => {
      this.http.post(this.BASE_API_URL + '/users/authenticate',
        { username: username, password: password })
        .subscribe((response: any) => {
          const token = response && response.token;

          if (token) {
            const decoded = jwt_decode(token);
            localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify( decoded ));
            this.storeJwtToken(token);
            resolve();
          } else {
            let err = response && response.msg;
            reject(err);
          }
        }, err => reject(err));
    });

  }

  get hasPermission(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return of(true);
  }

  /**
   * Sign out / Rework needed
   */
  signOut() {
    // TODO: Technically this should be a post
    return this.http.get<any>(`${this.BASE_API_URL}/api/v1/jwt/blacklist`, {}).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.removeItem(AuthService.ACCESS_TOKEN);
          localStorage.removeItem(AuthService.CURRENT_USER_KEY);
        }
      })
    );
    // send request to 
    // make a request to signout api
  }

  public  storeJwtToken(token: string) {
    localStorage.setItem(AuthService.ACCESS_TOKEN, token);
    const decoded = jwt_decode(token);
    localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify( decoded ));
  }

  refreshToken() {
    const token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.get<any>(`${this.BASE_API_URL}/api/v1/jwt/refresh`, httpOptions).pipe(
      tap((response: any) => {
        if (response.status && response.data) {
          this.storeJwtToken(response.data);
        }
      })
    );
  }

  /**
   * forgot password
   * @param email 
   */
  sendResetLink(email: string) {
    return this.http.post(this.BASE_API_URL + '/users/forgot-password', { email: email});
  }

  validateResetPasswordToken(fToken: string) {
    return this.http.post(this.BASE_API_URL + '/users/validate-reset-password-token', { fToken: fToken});
  }
}
