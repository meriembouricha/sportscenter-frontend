import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Ajout pour les notifications

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  registerForm: FormGroup;
  message: string | null = null;
  success: boolean = false;
  loading: boolean = false;  // Indicateur de chargement

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService // Service de notification
  ) {
    // Initialisation du formulaire
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.message = null;
  
      const { username, email, password } = this.registerForm.value;
  
      this.accountService.register(username, email, password).subscribe(
        (response) => {
          this.loading = false;
          this.success = true;
          this.toastr.success('Inscription réussie !', 'Succès');
  
          const redirect = this.accountService.redirectUrl || '/login';
          this.accountService.redirectUrl = null; 
  
          setTimeout(() => {
            this.router.navigateByUrl(redirect);
          }, 2000);
        },
        (error) => {
          this.loading = false;
          this.success = false;
  
          if (error.status === 400) {
            this.message = 'Données invalides, veuillez vérifier vos informations.';
          } else if (error.status === 500) {
            this.message = 'Problème serveur, veuillez réessayer plus tard.';
          } else {
            this.message = error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
          }
  
          this.toastr.error(this.message || 'Une erreur est survenue.', 'Erreur');
        }
      );
    } else {
      this.message = 'Veuillez remplir tous les champs correctement.';
      this.success = false;
      this.toastr.warning(this.message, 'Attention');
    }
  }
  
}
