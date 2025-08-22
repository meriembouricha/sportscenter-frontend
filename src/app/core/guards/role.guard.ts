import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccountService } from 'src/app/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];
    const userRoles: string[] = this.accountService.getRoles();

    if (userRoles.some(role => expectedRoles.includes(role))) {
      return true;
    } else {
      this.router.navigate(['/app-forbidden']);
      return false;
    }
  }
}
