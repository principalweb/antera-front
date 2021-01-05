import { Component, OnInit, Input } from '@angular/core';
import { ProductDetails } from '../../../../models';
import { ProductImageUploadComponent } from '../product-image-upload/product-image-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { EcommerceProductService } from '../../product/product.service';
import { uniqBy, sortBy, find } from 'lodash';
import { ProductLogoBlockDialogComponent } from '../product-logo-block-dialog/product-logo-block-dialog.component';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-product-image-gallery',
  templateUrl: './product-image-gallery.component.html',
  styleUrls: ['./product-image-gallery.component.scss']
})
export class ProductImageGalleryComponent implements OnInit {
  @Input() product = new ProductDetails();

  loading = false;
  colors = [];
  lastSharedPath = '';
  constructor(
    private dialog: MatDialog,
    private productService: EcommerceProductService,
    private msg: MessageService,
  ) { }

  ngOnInit() {
      this.colors = [];
      if (this.product.ProductPartArray.ProductPart && this.product.ProductPartArray.ProductPart.length > 0){
        this.product.ProductPartArray.ProductPart.forEach(part => {
          const color = (part && (part.ColorArray && (part.ColorArray.Color && part.ColorArray.Color.colorName))) || '';
          const hex = (part && (part.ColorArray && (part.ColorArray.Color && part.ColorArray.Color.hex))) || '';
          const partId = part && part.partId || '';
          const sku = part && part.sku || '';
          this.colors.push({
            color: color,
            partId: partId,
            sku: sku,
            hex: hex
          })
        });
      }
      this.colors = uniqBy(this.colors, 'color');
      this.colors = sortBy(this.colors, 'color');
  }

  openMediaDialog() {
    let dialogRef = this.dialog.open(ProductImageUploadComponent, {
      panelClass: 'product-image-upload-dialog',
      data: {
        lastSharedPath: this.lastSharedPath
      }
    });

    dialogRef.afterClosed()
    .subscribe(data => {
      if (data){
        if (data.type === 'Desktop'){
          this.uploadProductImage(data.file);
        }
        else if (data.type === 'Cloud') {
          console.log(data);
          if(data.lastSharedPath){
              this.lastSharedPath = data.lastSharedPath;
          }
          this.uploadProductImageUrl(data.imageUrls);
        }
        else{
        }
      }
    });

    // dialogRef.afterClosed()
    //   .subscribe(selectedImages => {
    //     if (selectedImages) {
    //       const newImages = [
    //         ...this.product.MediaContent,
    //         ...selectedImages
    //       ];

    //       this.product.MediaContent = unionBy(
    //         this.product.MediaContent,
    //         selectedImages,
    //         'url'
    //       );
    //     }
    //   });
  }

  uploadProductImage(file) {
    if (!file) return;
    console.log(file);
    const data = new FormData();
    data.append('file', file);
    data.append('id', this.product.id);
    this.loading = true;
    this.productService.uploadProductImage(data).then((mediaContent: any) => {
      console.log(mediaContent);
      this.loading = false;
      this.product.MediaContent.push(mediaContent);
    }).catch((err) => {
      console.log(err);
      this.loading = false;
    })
  }

  uploadProductImageUrl(imageUrls) {
    if (!imageUrls) return;
    const data = {
      id: this.product.id,
      imageUrls: imageUrls
    }
    this.loading = true;
    this.productService.uploadProductImageUrl(data).then((mediaContents: any) => {
      this.loading = false;
      mediaContents.forEach(mediaContent => {
          this.product.MediaContent.push(mediaContent);
      });
    }).catch((err) => {
      console.log(err);
      this.loading = false;
    })
  }

  deleteImage(img) {
    const idx = this.product.MediaContent.indexOf(img);

    if (idx >= 0) {
      this.product.MediaContent.splice(idx, 1);
    }
  }

  changeColor(colorValue,image) {
    const color = find(this.colors, {'color': colorValue});
    image.partId = color.partId;
    image.sku = color.sku;
    image.color = color.color;
    image.hex = color.hex;
  }

  editLogoBlock(index) {
    let dialogRef = this.dialog.open(ProductLogoBlockDialogComponent, {
      panelClass: 'product-logo-block-dialog',
      data: {
        imageIndex: index,
        product: this.productService.product,
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res === 'saved') {
        this.msg.show('Logo blocks saved successfully', 'success');
      }
      console.log('Edit logo block', res);
    });
  }
  primaryChanged(event, image) {
    const primary = !image.primary;
    this.product.MediaContent.forEach(img => {
      if (img.url !== image.url) {
        img.primary = false;
      }
    });
    if (primary) {
      image.primary = true;
    } else {
      this.product.MediaContent[0].primary = true;
      if (this.product.MediaContent[0].url === image.url) {
        event.source.checked = true;
      }
    }
  }
}
