import { storiesOf, addParameters } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { MatButtonModule, MatIconModule, MatCheckboxModule, MatExpansionModule, MatMenuModule, MatTooltipModule, MatSidenavModule, MatDatepickerModule, MatAutocompleteModule, MatToolbarModule, MatFormFieldModule, MatNativeDateModule, MatInputModule, MatTabsModule, MatSelectModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule, MatPaginatorModule, MatDividerModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
;
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectionModel } from '@angular/cdk/collections';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderDetailsComponent } from 'app/features/e-commerce/order-form/order-details/order-details.component';
import { OrderItemComponent } from 'app/features/e-commerce/order-form/order-item/order-item.component';
import { OrderItemAddonComponent } from 'app/features/e-commerce/order-form/order-item-addon/order-item-addon.component';
import { OrderItemListComponent } from 'app/features/e-commerce/order-form/order-item-list/order-item-list.component';
import { OrderItemDecoComponent } from 'app/features/e-commerce/order-form/order-item-deco/order-item-deco.component';
import { OrderItemFormComponent } from 'app/features/e-commerce/order-form/order-item/order-item-form/order-item-form.component';
import { OrderFormComponent } from 'app/features/e-commerce/order-form/order-form.component';
import { ILineItem } from 'app/features/e-commerce/order-form/interfaces';
import { MockOrder } from 'app/features/e-commerce/order-form/mocks/order';
import { NumericDirective } from 'app/directives/numeric.directive';
import { DefaultImage } from 'app/shared/directives/default-image';
import { OrderItemRowComponent } from 'app/features/e-commerce/order-form/order-item/order-item-row/order-item-row.component';
import { OrderAddItemComponent } from 'app/features/e-commerce/order-form/order-add-item/order-add-item.component';
import { ProductListComponent } from 'app/features/e-commerce/products/product-list/product-list.component';
import { CdkTableModule } from '@angular/cdk/table';
import { ApiService } from 'app/core/services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'app/core/services/auth.service';
import { EcommerceOrderService } from 'app/features/e-commerce/order.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { EcommerceProductsService } from 'app/features/e-commerce/products/products.service';
import { RouterModule, Router } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';



// storiesOf('Welcome', module).add('to Storybook', () => ({
//   component: Welcome,
//   props: {},
// }));
addParameters({
  options: {
    name: 'Antera Software',
    isFullscreen: true,
    showPanel: false,
    // more configuration here
  },
});

let storyModule = {
  providers: [
    ApiService,
    AuthService,
    EcommerceOrderService,
    GlobalConfigService,
    EcommerceProductService,
    EcommerceProductsService,
    {provide: APP_BASE_HREF, useValue: '/'}
  ],
  declarations: [
    OrderDetailsComponent,
    OrderItemComponent,
    OrderItemRowComponent,
    OrderItemAddonComponent,
    OrderItemListComponent,
    OrderItemDecoComponent,
    OrderItemFormComponent,
    OrderAddItemComponent,
    NumericDirective,
    DefaultImage,
    ProductListComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    FlexLayoutModule,
    DragDropModule,
    MatTooltipModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatTableModule,
    CdkTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    RouterModule.forRoot([]),
  ]
};

storiesOf('Orders', module).add('Order', () => ({
  component: OrderFormComponent,
  props: {
    order: MockOrder
  },
  moduleMetadata: storyModule
}))
.add('Line Item List', () => ({
  component: OrderItemListComponent,
  props: {
    items: MockOrder.lineItems
  },
  moduleMetadata: storyModule
}))
.add('Line Item', () => ({
  component: OrderItemComponent,
  props: {
    item: MockOrder.lineItems[0],
    selection: new SelectionModel<ILineItem>(),
  },
  moduleMetadata: storyModule
}));
