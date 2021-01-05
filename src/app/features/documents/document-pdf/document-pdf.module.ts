import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPdfComponent } from './document-pdf.component';

@NgModule({
  declarations: [DocumentPdfComponent],
  exports: [DocumentPdfComponent],
  imports: [
    CommonModule
  ]
})
export class DocumentPdfModule { }
