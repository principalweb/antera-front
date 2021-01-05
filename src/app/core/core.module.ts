import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ApiService } from './services/api.service';
import { LoginJSONAPIService } from './services/loginJSONAPI.service';
import { ApiMockService } from './services/api-mock.service';
import { MediaService } from './services/media.service';
import { ArtworksService } from './services/artworks.service';
import { MessageService } from './services/message.service';
import { ActivitiesService } from './services/activities.service';
import { SelectionService } from './services/selection.service';
import { TableFilterService } from './services/table-filter.service';
import { QbService } from './services/qb.service';
import { PsService } from './services/ps.service';
import { IntegrationService } from './services/integration.service';
import { StoreService } from './services/store.service';
import { ProjectsService } from './services/projects.service';
import { CategoryService } from './services/category.service';
import { PartnerService } from './services/partner.service';
import { IdentityService } from './services/identity.service';
import { ContactsService } from './services/contacts.service';
import { ActionService } from './services/action.service';
import { DocumentsService } from './services/documents.service';
import { InventoryService } from './services/inventory.service';
import { ProductionsService } from './services/productions.service';
import { SavedSearchService } from './services/saved-search.service';
import { GlobalConfigService } from './services/global.service';
import { SourceResponseService } from './services/source-response.service';
import { FeaturesService } from './services/features.service';
import { CustomerViewService } from './services/customer-view.service';
import { TagService } from './services/tag.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatToolbarModule,
  ],
  declarations: [],
  providers: [
      ApiService,
      LoginJSONAPIService,
    ApiMockService,
    MediaService,
    ArtworksService,
    MessageService,
    ActivitiesService,
    SelectionService,
    TableFilterService,
    QbService,
    PsService,
    IntegrationService,
    StoreService,
    ProjectsService,
    CategoryService,
    PartnerService,
    IdentityService,
    ContactsService,
    ActionService,
    DocumentsService,
    InventoryService,
    ProductionsService,
    SavedSearchService,
    GlobalConfigService,
    SourceResponseService,
    FeaturesService,
    CustomerViewService,
    TagService
  ]
})
export class CoreModule { }
