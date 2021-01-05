import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';

import { FaqService } from './faq.service';
import { FuseFaqComponent } from './faq.component';
import { MatButtonModule } from '@angular/material/button';
import { FaqFormComponent } from './faq-form/faq-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FuseConfirmDialogModule } from '@fuse/components';
import { ViewImageComponent } from 'app/shared/view-image/view-image.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';


const routes = [
    {
        path     : '',
        component: FuseFaqComponent,
        resolve  : {
            faq: FaqService
        }
    }
];

@NgModule({
    declarations: [
        FuseFaqComponent,
        FaqFormComponent,
        ViewImageComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatExpansionModule,
        MatIconModule,
        FuseSharedModule,
        MatButtonModule,
        CommonModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        FuseConfirmDialogModule,
        MatDialogModule,
        MatCheckboxModule
    ],
    providers   : [
        FaqService
    ],
    entryComponents: [FaqFormComponent,ViewImageComponent]
})
export class FaqModule
{
}
