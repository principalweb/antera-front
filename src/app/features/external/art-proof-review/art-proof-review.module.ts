import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArtProofReviewRoutingModule } from './art-proof-review-routing.module';
import { ReviewOrderProofsComponent } from './review-order-proofs/review-order-proofs.component';
import { RouterModule } from '@angular/router';
import { DocumentPdfModule } from 'app/features/documents/document-pdf/document-pdf.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ReviewOrderProofsComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    TextFieldModule,
    FlexLayoutModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    ArtProofReviewRoutingModule,
    DocumentPdfModule,
  ]
})
export class ArtProofReviewModule { }
