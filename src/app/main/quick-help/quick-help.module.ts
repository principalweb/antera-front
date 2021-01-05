import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickHelpComponent } from './quick-help/quick-help.component';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseSharedModule } from '@fuse/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,

    FuseSharedModule,
  ],
  declarations: [QuickHelpComponent],
  exports: [QuickHelpComponent]
})
export class QuickHelpModule { }
