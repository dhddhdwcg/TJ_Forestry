import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { BaseUrlInterceptor } from './base-url.interceptor';
import { AuthInterceptor } from './auth.interceptor';
import { CacheInterceptor } from './cache.interceptor';
import { HeaderInterceptor } from './header.interceptor';
import { ErrorInterceptor } from './error.interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
];
