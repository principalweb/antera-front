import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from "@ngrx/effects";
import { MaterialModule } from 'app/main/content/components/angular-material/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { StoreModule } from "@ngrx/store";
import { FuseWidgetModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { ListViewComponent } from './list-view/list-view.component';
import { DetailComponent } from './detail/detail.component';
import { Routes, RouterModule } from '@angular/router';
import { CreateInvoicesComponent } from './create-invoices/create-invoices.component';
import { FuseArtworksListModule } from 'app/features/artworks/artworks-list/artworks-list.module';
import { InvoiceReducer } from '../store/invoices.reducer';
import { StepOneComponent, PendingInvoiceDataSource } from './create-invoices/step-one/step-one.component';
import { StepTwoComponent } from './create-invoices/step-two/step-two.component';
import { StepThreeComponent } from './create-invoices/step-three/step-three.component';
import { InvoiceEffects } from '../store/invoices.effects';
import { InvoiceDetailService } from '../services/invoice-detail.service';
import { PendingInvoicesReducer } from '../store/pendingInvoices.reducer';
import { PendingInvoicesService } from '../services/pending-invoices.service';
import { PendingInvoiceEffects } from '../store/pendingInvoices.effects';
import { AmountInputContainerComponent } from './create-invoices/step-two/amount-input-container/amount-input-container.component';
import { PriceInputContainerComponent } from './create-invoices/step-two/price-input-container/price-input-container.component';
import { DocumentPdfModule } from '../../../documents/document-pdf/document-pdf.module';
const routes: Routes = [
  {
    path: "",
    component: ListViewComponent
  },
  {
    path: "invoices/:id",
    resolve: {
      data: InvoiceDetailService
    },
    component: DetailComponent
  },
  {
    path: "new",
    resolve: {
      data: PendingInvoicesService
    },
    component: CreateInvoicesComponent
  }
]
@NgModule({
  declarations: [ListViewComponent, DetailComponent, CreateInvoicesComponent, StepOneComponent, StepTwoComponent, StepThreeComponent, AmountInputContainerComponent, PriceInputContainerComponent],
  imports: [
    RouterModule.forChild(routes),
    StoreModule.forFeature('invoices', InvoiceReducer),
    StoreModule.forFeature('pendingInvoices', PendingInvoicesReducer),
    EffectsModule.forFeature([InvoiceEffects, PendingInvoiceEffects]),
    FuseArtworksListModule,
    CommonModule,
    MaterialModule,
    SharedModule,
    FuseWidgetModule,
    FuseSharedModule,
    DocumentPdfModule
  ],
})
export class ArInvoiceModule {}
