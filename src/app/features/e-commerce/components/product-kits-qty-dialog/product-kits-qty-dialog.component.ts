import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { SelectionService } from 'app/core/services/selection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';

@Component({
  selector: 'app-product-kits-qty-dialog',
  templateUrl: './product-kits-qty-dialog.component.html',
  styleUrls: ['./product-kits-qty-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations    
})
export class ProductKitsQtyDialogComponent implements OnInit {
  kitProducts : any;
  loading = false;
  constructor(
        public confirmKitQtyDialogRef: MatDialogRef<ProductKitsQtyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private router: Router,
        private msg: MessageService        
  ) {
      this.kitProducts = data.kitProducts;
  }

  ngOnInit() {
     
     
  }

  save() {
        this.confirmKitQtyDialogRef.close(this.kitProducts);
  }
}
