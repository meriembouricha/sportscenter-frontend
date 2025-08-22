import { Component, OnInit } from '@angular/core';
import { BasketService } from './basket/basket.service';
import { AccountService } from './account/account.service';
import { Observable } from 'rxjs';
import { User } from './shared/models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Sports Center';
  currentUser$!: Observable<User | null>;
  isRouteAdmin: boolean = true; // XXXXX
  currentUtilisateur!: User | null ;
  isAdminRoute = false;

  constructor(
    private basketService: BasketService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.accountService.loadUser().subscribe();
    this.loadBasket();
    this.currentUser$ = this.accountService.currentUser$;
    this.currentUtilisateur = this.accountService.getCurrentUser();
    console.log(this.currentUtilisateur);
    this.currentUser$.subscribe(user => {
      this.isRouteAdmin = user?.username === 'admin';
    });
    console.log(this.isRouteAdmin);
  }

  loadBasket() {
    const basketId = localStorage.getItem('basket_id');
    if (basketId) this.basketService.getBasket(basketId);
  }

  loadUser() {
    this.accountService.loadUser();
  }

  checkIfAdminRoute(url: string) {
    this.isAdminRoute = url.includes('/admin');
  }
}
