import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { NzMessageService } from 'ng-zorro-antd';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private message: NzMessageService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      retry(2),
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          // 401 handled in auth.interceptor
          this.message.create('error', error.message);
        }
        return throwError(error);
      })
    );
  }
}
