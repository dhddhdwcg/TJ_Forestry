import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from "@angular/common/http";

import { Observable } from "rxjs";

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  private baseUrl: string =  'http://39.98.54.81:9000/';

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes(this.baseUrl)) {
      return next.handle(req);
    }

    const httpsReq = req.clone({
      url: this.baseUrl + req.url
		});

    return next.handle(httpsReq);
  }
}
