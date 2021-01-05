import { Component, OnInit ,Inject,ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmbeddedPurchaseOrderDecorationModernComponent } from '../../shared/templates/embedded-purchase-order-decoration-modern/embedded-purchase-order-decoration-modern.component';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';


@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit 
{
  row:any;
  ava = false;
  @ViewChild(EmbeddedPurchaseOrderDecorationModernComponent) embededPODecorationComponent: EmbeddedPurchaseOrderDecorationModernComponent;
  constructor( @Inject(MAT_DIALOG_DATA) private data: any) 
  {
    this.row= data;
  }

  ngOnInit()
   {
    this.embededPODecorationComponent.initializePurchaseOrderDetails(this.row.orderId, this.row.vendor);
   }
    
  onDocumentReady()
  {
      this.ava = true;
  }  

}
