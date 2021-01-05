import { ApiService } from './../../../../../core/services/api.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'product-import-detail',
  templateUrl: './product-import-detail.component.html',
  styleUrls: ['./product-import-detail.component.scss']
})
export class ProductImportDetailComponent implements OnInit {
  @Input() product;
  @Output() close = new EventEmitter<boolean>();

  productDetail: any;

  loading = false;

  colors = [];
  size = [];
  sColor = '';
  sSize = '';
  colorImage = [];
  primaryImage = '';
  imagePartId = [];

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit() {
    if (this.product.productId && this.product.api) {
      this.loading = true;
      this.apiService.getUniversalProduct(this.product)
        .subscribe(res => {
          this.loading = false;
          this.productDetail = res;
          const uniqueColor = [];
          const uniqueSize = [];
          if (this.productDetail.MediaContent && this.productDetail.MediaContent.length > 0) {
            this.primaryImage = this.productDetail.MediaContent[0].url;
          }
          this.productDetail.ProductPartArray.ProductPart.forEach(p => {
            if (!uniqueColor[p.ColorArray.Color.colorName]) {
              uniqueColor[p.ColorArray.Color.colorName] = true;
              this.colors.push({color: p.ColorArray.Color.colorName, hex: p.ColorArray.Color.hex});
            }
            if (!this.colorImage[p.ColorArray.Color.colorName]) {
              this.productDetail.MediaContent.forEach(i => {
                if (i.partId && i.partId === p.partId) {
                  this.colorImage[p.ColorArray.Color.colorName] = i.url;
                  return;
                }
              });
            }
            if (!uniqueSize[p.ApparelSize.labelSize]) {
              uniqueSize[p.ApparelSize.labelSize] = true;
              this.size.push(p.ApparelSize.labelSize);
            }
          });
          this.sColor = '';
          this.sSize = '';
        },
        err => {
          this.loading = false;
        });
    }
  }

  closeDetail() {
    this.close.emit(true);
  }

}
