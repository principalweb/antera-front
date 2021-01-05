import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MediaService } from '../../core/services/media.service';

@Component({
  selector: 'app-media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaDialogComponent implements OnInit {

  images: any[];
  loading = false;
  selectedImages = [];

  constructor(
    public dialogRef: MatDialogRef<MediaDialogComponent>,
    private mediaService: MediaService,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.selectedImages = this.data.images;
  }

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.mediaService.getImages()
      .subscribe((res: any[]) => {
        this.images = res;
      },
      err => console.log(err),
      () => {
        this.loading = false;
      }
    );
  }

  toggleImage(img) {
    const idx = this.selectedImages.indexOf(img);

    if (idx >= 0) {
      this.selectedImages.splice(idx, 1);
    } else {
      this.selectedImages.push(img);
    }
  }

  isSelected(img) {
    return this.selectedImages.indexOf(img) >= 0;
  }

  select() {
    this.dialogRef.close(this.selectedImages);
  }

  upload() {
    console.log('Uploading images...');
  }

}
