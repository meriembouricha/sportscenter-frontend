import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { ServerErrorComponent } from './core/server-error/server-error.component';
import { LoginComponent } from './account/login/login.component';
import { AdminComponent } from './admin/admin.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { ProductManagementComponent } from './admin/product-management/product-management.component';
import { ComplaintManagementComponent } from './admin/complaint-management/complaint-management.component';
import { StockManagementComponent } from './admin/stock-management/stock-management.component';
import { UpdateProductComponent } from './admin/update-product/update-product.component';
import { ComplaintComponent } from './complaint/complaint.component';
import { MyComplaintsComponent } from './my-complaints/my-complaints.component';
import { ResponseComplaintComponent } from './admin/response-complaint/response-complaint.component';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';
import { OrderDashboardComponent } from './order-dashboard/order-dashboard.component';
import { MonthlySalesChartComponent } from './monthly-sales-chart/monthly-sales-chart.component';
import { DailySalesChartComponent } from './daily-sales-chart/daily-sales-chart.component';
import { BestProductsChartComponent } from './best-products-chart/best-products-chart.component';
import { PopularCategoriesChartComponent } from './popular-categories-chart/popular-categories-chart.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';
import { LivreurOrderDashboardComponent } from './livreur-order-dashboard/livreur-order-dashboard.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { RoleGuard } from './core/guards/role.guard';
import { FaqComponent } from './faq/faq.component';
import { AboutusComponent } from './aboutus/aboutus.component';


const routes: Routes = [
  // Admin routes
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      { path: 'users', component: UserManagementComponent },
      { path: 'products', component: ProductManagementComponent },
      { path: 'update-product/:id', component: UpdateProductComponent },
      { path: 'complaints', component: ComplaintManagementComponent },
      { path: 'stock', component: StockManagementComponent },
      { path: 'orders', component: OrderDashboardComponent },
      { path: 'stats', component: AdminStatsComponent },
    ]
  },

  // Livreur route
  {
    path: 'livreur',
    component: LivreurOrderDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_LIVREUR'] },
  },

  // My Complaints accessible for USER and ADMIN
  {
    path: 'myComplaints',
    component: MyComplaintsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] },
  },

  // Response complaint
  { path: 'response/:complaintId', component: ResponseComplaintComponent },

  // Store / Basket / Account / Checkout Modules
  { path: '', component: HomeComponent },
  { path: 'store', loadChildren: () => import('./store/store.module').then(m => m.StoreModule) },
  { path: 'basket', loadChildren: () => import('./basket/basket.module').then(m => m.BasketModule) },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'checkout', loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule) },

  // Complaint
  { path: 'complaint', component: ComplaintComponent },

  // Login & error pages
  { path: 'login', component: LoginComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  {path: 'faq', component: FaqComponent},  
  {path: 'about-us', component: AboutusComponent},

  // Forbidden page
  { path: 'app-forbidden', component: NotAuthorizedComponent },

  // Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
