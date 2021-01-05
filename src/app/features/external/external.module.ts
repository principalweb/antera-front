import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FuseConfirmDialogModule } from '@fuse/components';
import { ExternalComponent } from './external.component';
import { FactoryInquiryComponent } from './factory-inquiry/factory-inquiry.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';
import { SourceResponseService } from 'app/core/services/source-response.service';
import { CoreModule } from 'app/core/core.module';


const routes = [
    {
        path: '',
        component: ExternalComponent,
        children: [
            {
                path: 'factory/:source/:factory',
                component: FactoryInquiryComponent,
                resolve: [
                    SourceResponseService
                ]
            },
            {
                path: 'art-proof',
                loadChildren: () => import('./art-proof-review/art-proof-review.module').then(m => m.ArtProofReviewModule),
            },
        ]

    }
];

@NgModule({
    declarations: [
        ExternalComponent,
        FactoryInquiryComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatExpansionModule,
        MatIconModule,
        FuseSharedModule,
        MatButtonModule,
        CoreModule,
        CommonModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatSelectModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        FuseConfirmDialogModule,
        SharedModule,
    ],
    providers: [],
    entryComponents: []
})
export class ExternalModule {
}
