import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AwsFileManagerDialogComponent } from 'app/shared/aws-file-manager-dialog/aws-file-manager-dialog.component';

@Component({
  selector: 'app-product-image-upload',
  templateUrl: './product-image-upload.component.html',
  styleUrls: ['./product-image-upload.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductImageUploadComponent implements OnInit {

  @ViewChild('fileInput') fileInputField;
  fileManagerDialogRef: MatDialogRef<AwsFileManagerDialogComponent>;
  lastSharedPath = '';
  constructor(    
    public dialogRef: MatDialogRef<ProductImageUploadComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) { 
      if(this.data.lastSharedPath){
          this.lastSharedPath = this.data.lastSharedPath
      }
  }

  ngOnInit() {
    
  }

  onFileChange(event) {
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.dialogRef.close({
        type: 'Desktop',
        file: file
      });
    }
  }

  onSelectImageFromCloudSelected(){
    this.fileManagerDialogRef = this.dialog.open(AwsFileManagerDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
         lastSharedPath: this.lastSharedPath
      }
    });

      this.fileManagerDialogRef.afterClosed()
        .subscribe((res: any) => {
          if (!res) { return; }
              this.dialogRef.close({
                type: 'Cloud',
                imageUrls: res.imageUrls,
                lastSharedPath : res.lastSharedPath
              });
        });

  }
}
