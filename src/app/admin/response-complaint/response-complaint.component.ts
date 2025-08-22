import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResponseService } from 'src/app/core/services/Complaints-Services/response.service';

@Component({
  selector: 'app-response-complaint',
  templateUrl: './response-complaint.component.html',
  styleUrls: ['./response-complaint.component.scss']
})
export class ResponseComplaintComponent implements OnInit {
  responseText: string = '';
  complaintId?: number;
  isLoading: boolean = false; // Ajout d'un état de chargement

  constructor(
    private responseService: ResponseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.complaintId = +params['complaintId'];
    });
  }

  submitResponse(): void {
    if (!this.responseText.trim()) {
      alert('⚠️ Veuillez saisir une réponse avant d\'envoyer.');
      return;
    }
    
    if (!this.complaintId) {
      alert('⚠️ Identifiant de la réclamation manquant.');
      return;
    }

    this.isLoading = true; // Activation du chargement

    this.responseService.respondToComplaint(this.complaintId, this.responseText).subscribe(
      (response) => {
        console.log('✅ Réponse envoyée avec succès:', response);
        this.responseText = '';
        this.isLoading = false; // Désactivation du chargement
        alert('✅ Votre réponse a été envoyée avec succès !');
      },
      (error) => {
        console.error('❌ Erreur lors de l\'envoi de la réponse:', error);
        this.isLoading = false; // Désactivation du chargement
        alert('❌ Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
      }
    );
  }
}
