import { Component, OnInit, Input, Inject } from '@angular/core';
import { ProductDetails } from 'app/models';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'preview-product',
  templateUrl: './preview-product.component.html',
  styleUrls: ['./preview-product.component.scss']
})
export class PreviewProductComponent implements OnInit {

  @Input() product: ProductDetails;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<PreviewProductComponent>,
    @Inject(MAT_DIALOG_DATA) data,
  ) { }

  ngOnInit() {
  }

  navigateTo() {
    this.router.navigate(['/e-commerce', 'products', this.product.id]);
    this.dialogRef.close();
  }
}
