import { Component, OnInit, Input, Inject } from '@angular/core';
import { IDecoVendor } from 'app/features/e-commerce/order-form/interfaces';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'preview-decoration',
  templateUrl: './preview-decoration.component.html',
  styleUrls: ['./preview-decoration.component.scss']
})
export class PreviewDecorationComponent implements OnInit {

  @Input() deco: IDecoVendor;

  constructor(
    private router: Router,
    private api: ApiService,
    private dialogRef: MatDialogRef<PreviewDecorationComponent>,
    @Inject(MAT_DIALOG_DATA) data,
  ) { }

  ngOnInit() {
  }

  navigateTo() {
    this.api.getArtworkIdFromDesignId(this.deco.designId)
      .subscribe(res => {
        this.dialogRef.close();
        this.router.navigate(['/artworks', res]);
      });
  }

}
