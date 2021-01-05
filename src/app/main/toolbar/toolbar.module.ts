import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FuseSharedModule } from '@fuse/shared.module';

import { FuseToolbarComponent } from './toolbar.component';
import { FuseSearchBarModule, FuseShortcutsModule } from '@fuse/components';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ToolbarShortcutsComponent } from './shortcuts/toolbar-shortcuts.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
    declarations: [
        FuseToolbarComponent,
        ToolbarShortcutsComponent
    ],
    imports     : [
        RouterModule,

        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatToolbarModule,

        FlexLayoutModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        MatTooltipModule,
        
        SharedModule
    ],
    exports     : [
        FuseToolbarComponent    
    ]

})
export class FuseToolbarModule
{
}
