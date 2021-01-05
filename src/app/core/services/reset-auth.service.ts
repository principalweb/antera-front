import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models';
import { tap } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import { environment } from 'environments/environment';

@Injectable()
export class ResetAuthService {

    private readonly BASE_API_URL: string = '/protected';
  fToken = '';
  constructor(private http: HttpClient) { }

  sendResetLink(email: string) {
    const baseUrl = window.location.protocol + '//' + window.location.host;
    return this.http.post(this.BASE_API_URL + '/users/forgot-password', { email: email, site: baseUrl});
  }

  validateResetPasswordToken(fToken: string) {
    return this.http.post(this.BASE_API_URL + '/users/validate-reset-password-token', { fToken: fToken});
  }

  resetPassword(email: string, password: string, fToken: string) {
    return this.http.post(this.BASE_API_URL + '/users/reset-password', {email: email, password: password, fToken: fToken});
  }
}
