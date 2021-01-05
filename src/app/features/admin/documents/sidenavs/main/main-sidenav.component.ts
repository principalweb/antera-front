import { Component, OnDestroy, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { DefaultOptionsComponent } from '../default-options/default-options.component';

@Component({
    selector   : 'documents-main-sidenav',
    templateUrl: './main-sidenav.component.html',
    styleUrls  : ['./main-sidenav.component.scss'],
    animations   : fuseAnimations
})
export class DocumentsMainSidenavComponent implements OnInit, OnDestroy
{
    @Input() docOptions: any[];
    @Input() selectedDocument: any;
    @Output() optionChanged = new EventEmitter();
    @Output() documentChanged = new EventEmitter();

    //selectedDocument = "Invoice";
    documents = ['Invoice', 'Proforma Invoice', 'Order Confirmation', 'Quote', 'Multi Quote', 'Purchase Order', 'Work Order', 'Order Recap', 'Credit Memo', 'Packing List', 'Pick List'];
    allowDefaultValues = ['Footer Note'];
    defaultOptionsDialogRef: MatDialogRef<DefaultOptionsComponent>;
    loading = false;
    
    constructor(
        public dialog: MatDialog,
        private msg: MessageService,
        private api: ApiService
    )
    {
    }

    ngOnInit()
    {

    }

    ngOnDestroy()
    {
    }

    sliderToggled(option, ev){
        option.value = ev.checked;
        const updateItem  = this.docOptions.find(x => x.name === option.name);
        let index = this.docOptions.indexOf(updateItem);
        this.docOptions[index] = option;
        this.optionChanged.emit(this.docOptions);
    }
    isDefaultAllowed(name){
        return this.allowDefaultValues.includes(name);
    }
    addDefaultOption(name){
        const data = {
            name: name,
            type : this.selectedDocument,
        }
        this.loading = true;
	this.api.getDocsDefaultOptions(data)
	    .subscribe((res : any) => {
	        this.loading = false;
		this.defaultOptionsDialogRef = this.dialog.open(DefaultOptionsComponent, {
		    panelClass: 'default-options',
		    data      : {
			name: res.name,
			type : res.type,
			description : res.description
		    }
		});

		    this.defaultOptionsDialogRef.afterClosed()
			.subscribe((res) => {
			    this.loading = true;
			    if (res){
				this.api.updateDocsDefaultOptions(res)
				    .subscribe((res) => {
					 this.loading = false;
					 this.msg.show("entry updated", 'success');
				    },(err) => {               
					 this.loading = false;
				    });         
			    }else{
			        this.loading = false;
			    }
			});

	    },(err) => {               
		 this.loading = false;
	    });


    }
    orderConfirmSelected()
    {
        this.selectedDocument ="Order Confirmation";
        this.documentChanged.emit(this.selectedDocument);
    }

    invoiceSelected()
    {
        this.selectedDocument ="Invoice";
        this.documentChanged.emit(this.selectedDocument);
    }

    purchaseOrderSelected()
    {
        this.selectedDocument ="Purchase Order";
        this.documentChanged.emit(this.selectedDocument);
    }
    quoteSelected()
    {
        this.selectedDocument ="Quote";
        this.documentChanged.emit(this.selectedDocument);
    }
    multiQuoteSelected()
    {
        this.selectedDocument ="Multi Quote";
        this.documentChanged.emit(this.selectedDocument);
    }

    changeDocument(ev){
        this.documentChanged.emit(ev.value);
    }
}
