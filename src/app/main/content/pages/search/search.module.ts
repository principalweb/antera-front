import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { FuseSharedModule } from '@fuse/shared.module';

import { SearchService } from './search.service';
import { FuseSearchClassicComponent } from './tabs/classic/classic.component';
import { FuseSearchTableComponent } from './tabs/table/table.component';
import { FuseSearchComponent } from './search.component';

const routes = [
    {
        path     : 'search',
        component: FuseSearchComponent,
        resolve  : {
            search: SearchService
        }
    }
];

@NgModule({
    declarations: [
        FuseSearchComponent,
        FuseSearchClassicComponent,
        FuseSearchTableComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatTabsModule,

        FuseSharedModule
    ],
    providers   : [
        SearchService
    ]
})
export class SearchModule
{
}
