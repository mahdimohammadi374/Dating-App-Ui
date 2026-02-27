import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType,
} from '@angular/common/http';
import { Observable, exhaustMap, take, tap } from 'rxjs';
import { AccountService } from '../_services/account.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('/Account/login')) {
      return next.handle(request);
    }
    if (this.accountService.currentUser$) {


      return this.accountService.currentUser$.pipe(
        take(1),
        exhaustMap((user) => {
          if (user) {
            var jwt = user.token;
            request = request.clone({
              setHeaders: {
                Authorization: 'Bearer' + ' ' + jwt,
              },
            });
          }
          return next.handle(request);
        }),
        tap((event) => {
          if (event.type === HttpEventType.Sent) {
          }
          if (event.type === HttpEventType.Response) {
            const token = event.body.token;
            if (token) {
              localStorage.setItem('User', JSON.stringify(event.body));
            }
          }
        })
      );
    }
    return next.handle(request);

  }
}
