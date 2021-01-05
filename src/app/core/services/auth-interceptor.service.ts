// src/app/services/token-interceptor.service.ts

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public authService: AuthService, private router: Router) {
  }

  isApiRequest(request) {
    return request.url.match(/protected\//);
  }

  shouldSkipRequest(request) {
    // Applying the token to the refresh is currently handled in the auth service directly
    // Users shouldn't have a token when authenticating
    //return request.url.match(/refresh$|users\/authenticate$/);
    return request.url.match(/refresh$|users\/authenticate$|forgot-password$|reset-password$/);
  }

  debug(...args) {
    //if (!environment.production) {
    if (false) {
      console.log(...args, { debug: this.authService.getCurrentUser() });
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();
    
    // TODO: Fix this. It is temporary. Skips the interceptor if no token is set. 
    if (!token) {
      return next.handle(request);
    }

    if (!this.shouldSkipRequest(request) && this.isApiRequest(request)) {

      if (this.authService.isTokenExpired()) {
        this.debug('Token expired, trigger refresh');
        return this.refreshToken(request, next);
      }

      this.debug('Token valid, added to request', request);
      request = this.addToken(request, token);

      return next.handle(request).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.debug('Token invalid, trigger refresh');
            return this.refreshToken(request, next);
          } else {
            this.debug('Token error, throw exception', error);
            return throwError(error);
          }
        })
      );
    }

    return next.handle(request);
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }


  private refreshToken(request: HttpRequest<any>, next: HttpHandler) {
    this.debug('Token refresh started');
    if (!this.isRefreshing) {

      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((refreshResponse: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(refreshResponse.data);
          this.debug('\t Token refreshed successfully, continue request', refreshResponse, request);
          return next.handle(this.addToken(request, refreshResponse.data));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.router.navigate(['/lock']);
          this.debug('\t Token refresh failed, login again', request);
          const error = err.error.message || err.statusText;
          return throwError(error);
        })
      );

    } else {
      this.debug('\t Refresh already active, defer until complete', request);
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}
