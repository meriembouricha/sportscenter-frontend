import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { BasketService } from 'src/app/basket/basket.service';
import { Basket, BasketItem } from 'src/app/shared/models/basket';
import { User } from 'src/app/shared/models/user';
import { Router , NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  currentUser$?: Observable<User | null>;
  isLoggedIn: boolean = false;
    isStoreRoute = false;

    currentRoute: string = '/';

  constructor(
    public basketService: BasketService,
    public accountService: AccountService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isStoreRoute = event.urlAfterRedirects.startsWith('/store');
      });
  }

  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
    this.isLoggedIn = !!localStorage.getItem('token');
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  getItemsCount(items: BasketItem[]) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
  logout() {
    this.accountService.logout();
    this.isLoggedIn = false;
  }
}
