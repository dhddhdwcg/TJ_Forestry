import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authorizationReq = this.addAuthenticationToken(req);
    return next.handle(authorizationReq);
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    
    let token = localStorage.getItem('Authorization');

    if (!token) {
      return request;
    }
    
    return request.clone({
      headers: request.headers.set('Authorization',  token)
    });
  }
}
