import { Component, OnChanges, Input, OnInit, Output, ViewEncapsulation, EventEmitter, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
//import { WorkflowStatusComponent } from '../workflow-status/workflow-status.component';
import { workflowProcess } from '../workflow-stats-template';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { WorkflowControlService } from '../workflow-control.service';
// mail stuff
import { EmbeddedPurchaseOrderDecorationModernComponent } from '../../../shared/templates/embedded-purchase-order-decoration-modern/embedded-purchase-order-decoration-modern.component';

import * as html2pdf from 'html2pdf.js';
import { ActionService } from '../../../core/services/action.service';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormDialogComponent } from '../../../shared/activity-form/activity-form.component';
import { ShippingFormDialogComponent } from '../../../shared/shipping-form/shipping-form.component';

@Component({
    selector: 'workflow-process-popover',
    templateUrl: './workflow-process-popover.component.html',
    styleUrls: ['./workflow-process-popover.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowProcessPopoverComponent implements OnChanges, OnInit {

    @Input()
    value: any;

    @Input()
    row: any;

    @Input()
    column: any;

    @Input()
    events: any;

    @Output()
    changed = new EventEmitter();

    @ViewChild(EmbeddedPurchaseOrderDecorationModernComponent) embeddedPODecoration: EmbeddedPurchaseOrderDecorationModernComponent;
//    @ViewChild(WorkflowStatusComponent) listComponent: WorkflowStatusComponent;
    
    loadComponent: boolean = false;
    currentAction:any;
    availableEvents: any = [];
    //dialogRef:any;
    dom2:any;
    loading:boolean = false;
//    selectedRow: any = {};
//    selectedCol: any = {};
    dialogRef: MatDialogRef<ActivityFormDialogComponent>;
    shippingDialogRef: MatDialogRef<ShippingFormDialogComponent>;

    constructor(
        public wcs: WorkflowControlService,
        private router: Router,
        public dialog: MatDialog,
        private actvitiyService: ActivitiesService,
        private actionService: ActionService,
        private cd: ChangeDetectorRef 
    ) {}

    ngOnInit() {
        this.setAvailableEvents();
    }

    ngOnChanges() {
    //this.setAvailableEvents();
    }

    selectEvent(ev, e){
        this.value = ev;
        this.wcs.updateWorkflowEvent(this.row.orderId, this.row.vendorId, ev.group, ev.id);
        this.setAvailableEvents();
        if(this.value.name == "Declined" && this.value.group == 1) {
            this.noteActivity('Note');
        }
        // Shipping Status ready will sent data to ship station
        if(this.value.name == "Ready" && this.value.group == 6) {
          this.createOrderToShipStation({id: this.row.orderId, readyToShip: true});
        }
    }

    setAvailableEvents(){
        this.availableEvents = [];
        for(let ev of this.events){
            if((this.value.id == 0 && ev.id != 0) || (ev.group == this.value.group)) {
                this.availableEvents.push(ev);
            }
        }
        this.cd.markForCheck();
    }

    noteActivity(type = 'Note'){
        this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
          panelClass: 'activity-form-dialog',
          data      : {
              action: 'new',
              type : type,
              service : this.actvitiyService
          }
        });
    }

    createOrderToShipStation(params) {
          this.actionService.createOrderToShipStation(params)
              .subscribe((response:any) => { });
    }

    shippingInfo(params) {
      this.actionService.getShippingInfo({orderId: params.orderId,  vendorId: params.vendorId}).subscribe((shipping: any) => {
        if(typeof shipping !== 'undefined' && shipping.length > 0) {
          this.shippingDialogRef = this.dialog.open(ShippingFormDialogComponent, {
            panelClass: 'shipping-form-dialog',
            data      : {
               action: 'edit',
               orderId: params.orderId,
               vendorId: params.vendorId,
               shipping: shipping[0],
               module: 'workflow'
            }
          });
        } else {
          this.shippingDialogRef = this.dialog.open(ShippingFormDialogComponent, {
            panelClass: 'shipping-form-dialog',
            data      : {
                action: 'new',
                orderId: params.orderId,
                vendorId: params.vendorId,
                inhandsDate: this.row.inhandsDate,
                shipDate: this.row.shipDate,
                module: 'workflow'
            }
          });
        }
      });

    }

    execAction(action, params, event) {
      //console.log(this.row);
              if (action == 'sendpo') {
                var link = '/e-commerce/orders';
                this.actionService.isDecoratorVendor(params.vendorId) 
                  .subscribe(response => { 
                    if(response) {
                      //console.log('vendor',response);
                      params = {orderId: params.orderId, docType: 'decopo', vendorId: params.vendorId, vendor: params.vendor};
                      this.goto(link, params);
                    } else {
                      params = {orderId: params.orderId, docType: 'po', vendorId: params.vendorId, vendor: params.vendor};
                      this.goto(link, params);
                    }
                 });
              }
              if(action == 'viewart') {
                    this.actionService.getArtworkId(params)
                     .subscribe(response => {
                      if (response) {
                      var link = '/artworks/'+response;
                      this.goto(link, params);
                    } else { // id not found
                      var link = '/artworks';
                      this.goto(link, params);
                   }
               });
              }
              if(action == 'receiving') {
                var link = '/receiving';
                this.goto(link, params);
              }
              if(action == 'productions') {
                var link = '/productions';
                this.goto(link, params);
              }
              if(action == 'vouchings') {
                      var link = '/vouchings';
                      this.goto(link, params);
              }
              if(action == 'shipping') {
                if(params.events === 'Pending' || params.events === 'Done') {
                  this.shippingInfo(params);
                } else if(params.events === 'Ready') {
                  console.log(params);
                }

              }
              if(action == 'qc') {
              }
       // }
    }

    goto(link, params) {
    let queryParams = {};
    switch(link)
    {
      case '/e-commerce/orders':
        link = link + '/' + params.orderId;
        queryParams = params;
      break;

      case '/artworks':
      break;

      case '/receiving':
       queryParams = {orderNumber:this.row.poNumber,vendorName: params.vendor};
      break;

      case '/productions':
      break;

      case '/vouchings':
       queryParams = {poNumber:this.row.poNumber,vendor: params.vendor};
      break;

      case '/shipping':
      break;

      case '/qc':
      break;

      default:
      break;
    }
    this.router.navigate([link], {queryParams});
  }


    onDocumentLoadingFailed() {
        this.loading = false;
    }
    
    onDocumentReady() {
       // console.log('hi', this.row);

        var params = {orderId: this.row.orderId, vendorId: this.row.vendorId, vendor: this.row.vendor};
   //     let val =this.listComponent.hasEvent(this.selectedRow,this.selectedCol);    
    //   if(val.action == 'sendpo')
        if(this.currentAction == 'sendpo')
        {
//            let dom2 = document.getElementById(this.row.orderId+this.row.vendorName);
            //.setAttribute("style","visibility : visible;");
            // var dom = document.getElementById(this.selectedRow.orderId+this.selectedRow.vendor);
            var dom = document.getElementsByTagName('embedded-purchase-order-modern');
            this.dom2 = dom[0];
            var filename = "Purchase Order."+this.row.orderNo+".pdf";
            var opt = {
                margin:       [20, 0, 0, 0],
                filename:     filename,
                image:        { type: 'jpeg' },
                html2canvas:  { 
                    scale: 2.0,
                    useCORS: true
                },
                jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
            };

       // console.log('hello', name,this.row.orderNo);
            html2pdf().from(this.dom2).set(opt).output('datauristring').then((res)=>{
              if(res){
                    var data =res.split('base64,')[1];
                    this.loading = false;
                    this.sendPOEmail(this.currentAction,params,data,opt.filename,this.row);
              }

                }).catch(err => {
                    console.log(err);
                });                    

           // this.actionService[this.currentAction](params, filename,'' ,this.row);
        }
        
    }

    sendPOEmail(action,params,data,name,row)
    {
        if (typeof this.actionService[action] === 'function') {    

            this.loading = false;
            this.actionService[action](params,name,data,row);
         
          } 
    }


}
