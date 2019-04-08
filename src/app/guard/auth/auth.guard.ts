import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private _router: Router,
    @Inject(PLATFORM_ID) private _platformId: Object
  ) {
    
  }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let _token: any;
    if (isPlatformBrowser(this._platformId)) {
      _token = localStorage.getItem('token');
    }
    if (_token) {
      return true;
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }
}
