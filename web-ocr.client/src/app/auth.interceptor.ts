import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Prevent infite loop
    if (request.url.includes('/api/Auth/')) {
      return next.handle(request);
    }

    // Check if access token is expired
    if (this.authService.isTokenExpired()) {
      // Refresh the access token before handling the request
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          return this.HandleRequest(request, next);
        }),
        catchError(error => {
          console.error('Token refresh failed', error);
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Token still valid, handle the request
      return this.HandleRequest(request, next);
    }
  }

  private HandleRequest(request: HttpRequest<any>, next: HttpHandler) {
    const access_token = this.authService.getAccessToken();
    if (access_token) {
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${access_token}`
        }
      });
      console.log('Authorization header:', clonedRequest.headers.get('Authorization'));
      return next.handle(clonedRequest);
    } else {
      return next.handle(request);
    }
  }
}
