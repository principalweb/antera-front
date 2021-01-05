import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { EMPTY } from 'rxjs';

import { Observable, of } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
//import 'rxjs/add/observable/of';

import { RequestCache } from '../request-cache.service';

@Injectable()
export class EmailInterceptor implements HttpInterceptor {
  constructor(private cache: RequestCache) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // this will find permission-check-user and permission-check-user-action
    
    if (req.url.indexOf("/protected/content/get-my-email") > -1) {
      if(req.url.indexOf("clearCache") > -1){
          var url = req.url;
          const httpRequest = new HttpRequest(<any>req.method,url.replace("&clearCache=1", ""));
          req = Object.assign(req, httpRequest);
          return this.sendRequest(req, next, this.cache);
      }else{
          const cachedResponse = this.cache.get(req);
          return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next, this.cache);      
      }
    } else {
      return this.sendRequest(req, next, this.cache);
    }
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: RequestCache): Observable<HttpEvent<any>> {

      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            cache.put(req, event);
          }
        })
      );
    }
}
