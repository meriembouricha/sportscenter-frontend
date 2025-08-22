import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { StoreService } from '../store.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { BasketService } from 'src/app/basket/basket.service';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from 'src/app/core/services/feedback.service';
import { Feedback } from 'src/app/shared/models/feedback';
import { ProductService } from 'src/app/core/services/productService';
import { AccountService } from 'src/app/account/account.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  feedback: Feedback;
  feedbacks: Feedback[] = [];
  user! : User | null ;

  constructor(
    private storeService: StoreService,
    private activateRoute: ActivatedRoute,
    private breadcrumb: BreadcrumbService,
    private basketService: BasketService,
    private productService: ProductService,
    private feedbackService: FeedbackService,
    private toastr: ToastrService,
    private accountService:AccountService
  ) {
    // Assurez-vous que feedback a un objet utilisateur valide
    this.feedback = { rate: 0, descFeedback: '', product: null, user: {} as User };
  }

  ngOnInit(): void {
    this.loadProduct();
    this.user = this.accountService.getCurrentUser();
    console.log('User:', this.user);

    if (this.user) {
      this.user.id = this.accountService.getUserIdFromToken() ?? 0;
    }

    const productId = this.activateRoute.snapshot.paramMap.get('id');
    if (productId) {
      const productIdNumber = Number(productId);
      this.productService.getProductById(productIdNumber).subscribe((data) => {
        this.product = data;
        this.feedback.product = this.product;
        this.loadFeedbacks(productIdNumber);
      });

      // if (this.user && this.user.id && this.product && this.product.id) {
      const userId = this.user?.id;
      if (userId  && productId) {
        this.storeService.postUserProductView({
          user: {id: userId},
          product: {id: Number(productId)},
        }).subscribe({
          next: () => console.log('Product view recorded'),
          error: (err) => console.error('Error recording product view', err)
        });
      }
    }
  }

  loadFeedbacks(productId: number): void {
    this.feedbackService.getFeedbacksByProductId(productId).subscribe(
      (data) => {
        this.feedbacks = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des feedbacks:', error);
      }
    );
  }

  submitFeedback(): void {
    // Vérification que currentUser existe avant la soumission
    if (!this.user) {
      this.toastr.error("Vous devez être connecté pour laisser un avis.");
      return;
    }

    this.feedback.user = this.user; // Assigner le currentUser

    this.feedbackService.addFeedback(this.feedback).subscribe(
      (response) => {
        console.log('Feedback soumis avec succès:', response);
        this.feedbacks.push(response);
        this.toastr.success('Votre avis a été soumis avec succès.');

        // Réinitialiser feedback avec l'utilisateur connecté
        this.feedback = { rate: 0, descFeedback: '', product: this.product, user: this.user };
      },
      (error) => {
        console.error('Erreur lors de la soumission du feedback:', error);
        this.toastr.error("Erreur lors de l'envoi de votre avis.");
      }
    );
  }

  setRating(rating: number) {
    this.feedback.rate = rating;
  }

  loadProduct() {
    const id = this.activateRoute.snapshot.paramMap.get('id');
    if (id) {
      this.storeService.getProduct(+id).subscribe({
        next: (product) => {
          this.product = product;
          this.breadcrumb.set('@productName', product.name);
        },
        error: (error) => console.log(error),
      });
    }
  }

  addToCart() {
    if (this.product) {
      this.basketService.addItemToBasket(this.product, this.quantity);
      this.toastr.success('Article ajouté au panier');
    }
  }

  extractImageName(): string | null {
    if (this.product && this.product.pictureUrl) {
      const parts = this.product.pictureUrl.split('/');
      return parts.length > 0 ? parts[parts.length - 1] : null;
    }
    return null;
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getStars(rating: number): number[] {
    return new Array(rating).fill(1);  // Crée un tableau avec autant de 1 que la note
  }

}
