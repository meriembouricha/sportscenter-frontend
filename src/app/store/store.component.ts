import { ToastrService } from 'ngx-toastr';
import { StoreData } from './../shared/models/storeData';
import { Brand } from './../shared/models/brand';
import { Component, Input, OnInit } from '@angular/core';
import { StoreService } from './store.service';
import { Product } from '../shared/models/product';
import { Type } from '../shared/models/type';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { StoreModelService } from './store.service.module';
import { User } from '../shared/models/user';
import { AccountService } from '../account/account.service';
import { filter, take, tap } from 'rxjs';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  constructor(
    private storeService: StoreService,
    public storeData: StoreModelService,
    private toastr: ToastrService,
    private accountService: AccountService
  ) { }


  @Input() title: string = '';

  user: User | null = null;
  recommendedProducts: Product[] = [];

  ngOnInit() {
    this.storeData.selectedBrand = { id: 0, name: 'All' };
    this.storeData.selectedType = { id: 0, name: 'All' };

    this.fetchProducts();
    this.getBrands();
    this.getTypes();

    this.accountService.currentUser$
    .pipe(
      tap((user) => console.log('[DEBUG] currentUser$ emitted:', user)),
      filter((user): user is User => !!user && !!user.id),
      take(1)
    )
    .subscribe({
      next: (user) => {
        console.log('[DEBUG] Valid user received in Store:', user);
        this.user = user;
        this.storeService.getRecommendedProducts(user.id).subscribe({
          next: (products) => {
            this.recommendedProducts = products;
            console.log('[DEBUG] Recommended products:', products);
          },
          error: (err) => console.error('Error fetching recommendations', err),
        });
      },
    });
  }


  pageChanged(event: PageChangedEvent): void {
    // Check if the page has actually changed
    if (event.page !== this.storeData.currentPage) {
      this.storeData.currentPage = event.page;
      this.fetchProducts(this.storeData.currentPage);
    }
  }


  fetchProducts(page: number = 1) {
    // Calculate the backend page (subtract 1)
    const backendPage = page - 1;

    // Pass the selected brand/type ids
    const brandId = this.storeData.selectedBrand?.id;
    const typeId = this.storeData.selectedType?.id;

    // Construct the base URL
    let url = `${this.storeService.apiUrl}?`;

    // Check the brand and type
    if (brandId && brandId !== 0) {
      url += `brandId=${brandId}&`;
    }

    if (typeId && typeId !== 0) {
      url += `typeId=${typeId}&`;
    }

    // Search
    if (this.storeData.search) {
      url += `keyword=${this.storeData.search}&`;
    }

    // Append backendPage and size parameters to the URL
    url += `page=${backendPage}&size=${this.storeData.pageSize}`;

    // Include sorting parameters only when selectedSort is not empty
    if (this.storeData.selectedSort !== 'asc') {
      url += `&sort=name&order=${this.storeData.selectedSort}`;
    }

    this.storeService.getProducts(brandId, typeId, url).subscribe({
      next: (data) => {
        this.storeData.products = data.content;
        this.storeData.pageable = data.pageable;
        this.storeData.totalElements = data.totalElements;
        this.storeData.currentPage = data.pageable.pageNumber + 1; // Adjust the currentPage
        this.toastr.success('Products fetched');
      },
      error: (error) => {
        this.toastr.error('Error fetching data:');
        console.log('error');
      },
    });
  }

  getBrands() {
    this.storeService.getBrands().subscribe({
      next: (response) => (this.storeData.brands = [{ id: 0, name: 'All' }, ...response]),
      error: (error) => console.log(error)
    });
  }
  getTypes() {
    this.storeService.getTypes().subscribe({
      next: (response) => (this.storeData.types = [{ id: 0, name: 'All' }, ...response]),
      error: (error) => console.log(error)
    });
  }

  selectBrand(brand: Brand) {
    //update the selected brand and fetch the products
    this.storeData.selectedBrand = brand;
    this.fetchProducts();
  }

  selectType(type: Type) {
    //update the selected brand and fetch the products
    this.storeData.selectedType = type;
    this.fetchProducts();
  }
  onSortChange() {
    this.fetchProducts();
  }
  onSearch() {
    this.fetchProducts();
  }
  onReset() {
    this.storeData.search = '';
    this.fetchProducts();
  }
}
