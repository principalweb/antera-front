import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkTableModule } from '@angular/cdk/table';
import { FuseConfirmDialogModule } from '@fuse/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountsImportComponent } from './accounts-import/accounts-import.component';
import { ContactsImportComponent } from './contacts-import/contacts-import.component';
import { DecoChargesImportComponent } from './deco-charges-import/deco-charges-import.component';
import { ProductsImportComponent } from './products-import/products-import.component';
import { SiteComponent } from './site/site.component';
import { ArtworksImportComponent } from './artworks-import/artworks-import.component';
import { LeadsImportComponent } from './leads-import/leads-import.component';
import { AdditionalChargesImportComponent } from  './additional-charges-import/additional-charges-import.component';

@Component({
  selector: 'app-imports',
  templateUrl: './imports.component.html',
  styleUrls: ['./imports.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations  
})



export class ImportsComponent implements OnInit {
  inventoryEnabled: boolean = false;



    
    @ViewChild(AccountsImportComponent) accountsimportcomponent: AccountsImportComponent;
    @ViewChild(ContactsImportComponent) contactsimportcomponent: ContactsImportComponent;
    @ViewChild(DecoChargesImportComponent) decochargesimportcomponent: DecoChargesImportComponent;
    @ViewChild(ProductsImportComponent) productsimportcomponent: ProductsImportComponent;
    @ViewChild(SiteComponent) sitecomponent: SiteComponent;
    @ViewChild(ArtworksImportComponent) artworksimportcomponent: ArtworksImportComponent;
    @ViewChild(LeadsImportComponent) leadsimportcomponent: LeadsImportComponent;
    constructor(private api: ApiService) {
      this.api.getAdvanceSystemConfig({module: 'Products', setting:'inventoryEnabled'})
        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.inventoryEnabled = true;
            }
        });
    }


    ngOnInit() {
    
    }
    
    importTabClicked(tab) {
      //console.log(tab.tab.textLabel);
      switch(tab.tab.textLabel){
          case 'Accounts':
              this.accountsimportcomponent.initImportAccountsForm();
          break;
          case 'Contacts':
              this.contactsimportcomponent.initImportContactsForm();
          break;
          case 'DecoCharges':
              this.decochargesimportcomponent.initImportDecoChargesForm();
          break;    
          case 'Products':
              this.productsimportcomponent.initImportProductsForm();
          break;         
          case 'Site':
              this.sitecomponent.initImportsForm();
          break;         
          case 'Artwork':
              this.artworksimportcomponent.initImportArtworksForm();
          break;    
          case 'Leads':
              this.leadsimportcomponent.initImportLeadsForm();
          break;          
      }
    }
}
