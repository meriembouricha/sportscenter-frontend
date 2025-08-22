import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { ServerErrorComponent } from './core/server-error/server-error.component';
import { LoginComponent } from './account/login/login.component';
import { AdminComponent } from './admin/admin.component';
import { canActivate } from './core/guards/auth.guard';
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


const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
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
  {
    path: 'livreur',
    component: LivreurOrderDashboardComponent,
  },
  { path: 'response/:complaintId', component: ResponseComplaintComponent },
  { path: 'myComplaints', component: MyComplaintsComponent },
  { path: '', component: HomeComponent, data: { breadcrumb: 'Home' } },
  { path: 'store', loadChildren: () => import('./store/store.module').then(m => m.StoreModule) },
  { path: 'basket', loadChildren: () => import('./basket/basket.module').then(m => m.BasketModule) },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'checkout', loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'complaint', component: ComplaintComponent },
  { path: 'login', component: LoginComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
