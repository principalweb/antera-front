import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FuseSearchBarComponent } from './search-bar.component';
import { FuseSearchBarService } from './search-bar.service';
import { SearchKeywordPipe } from './search-keyword.pipe';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        FuseSearchBarComponent,
        SearchKeywordPipe,
    ],
    imports     : [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,

        MatProgressSpinnerModule,
        MatExpansionModule,
        MatListModule,
        MatButtonModule,
        MatIconModule
    ],
    providers: [
        FuseSearchBarService,
    ],
    exports     : [
        FuseSearchBarComponent,
    ]
})
export class FuseSearchBarModule
{
}
