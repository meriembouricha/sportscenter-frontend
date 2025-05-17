import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  user!: User;

  constructor(
    private formsBuilder: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private toastService: ToastrService    
    ){
    this.loginForm = this.formsBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
    this.accountService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;  // Met à jour l'utilisateur
        console.log('Utilisateur connecté:', user);
        console.log(this.user.id);
      }
    });
  }
  

  onSubmit() {
    this.accountService.login(this.loginForm.value).subscribe({
      next: (user) => {
        console.log('User:', user);  // Vérifie ici que l'objet 'user' est bien reçu
        this.user = user ;
        // La redirection est maintenant gérée dans le service, pas besoin de la faire ici
        this.toastService.success('Successfully Logged In');
      },
      error: () => {
        this.toastService.error('Error Occurred during Login');
      }
    });
  }
  
  
  
  
}
