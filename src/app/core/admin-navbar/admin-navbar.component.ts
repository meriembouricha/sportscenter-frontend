import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { User } from 'src/app/shared/models/user';
import { Router } from '@angular/router'; // Importer Router pour la redirection

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
})
export class AdminNavbarComponent implements OnInit {
  currentUser$?: Observable<User | null>;  

  constructor(
    private accountService: AccountService,
    private router: Router // Injecter Router pour la redirection
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
  }

  logout() {
    this.accountService.logout(); // Appeler la méthode de déconnexion
    this.router.navigateByUrl('/login'); // Rediriger vers la page de connexion après déconnexion
  }
}
