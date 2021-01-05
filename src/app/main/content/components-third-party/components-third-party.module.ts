import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { FuseSharedModule } from '@fuse/shared.module';

import { GoogleMapsModule } from './google-maps/google-maps.module';

import { FuseNgxDatatableComponent } from './datatable/ngx-datatable.component';

const routes = [
    {
        path     : 'datatables/ngx-datatable',
        component: FuseNgxDatatableComponent
    }
];

@NgModule({
    declarations: [
        FuseNgxDatatableComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,

        NgxDatatableModule,

        FuseSharedModule,

        GoogleMapsModule
    ],
})
export class FuseComponentsThirdPartyModule
{
}
