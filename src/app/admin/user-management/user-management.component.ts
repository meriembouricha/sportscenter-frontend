import { UserService } from 'src/app/core/services/user.service';
import { Component, OnInit } from '@angular/core'; 
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];  // Tableau pour stocker les utilisateurs

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

  // user-management.component.ts
deleteUser(id: number): void {
  this.userService.deleteUser(id).subscribe(
      () => {
          // Si la suppression est réussie, mettre à jour la liste des utilisateurs
          this.users = this.users.filter(user => user.id !== id);
      },
      (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
      }
  );
}



}
