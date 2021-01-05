import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ArtProofDocument } from 'app/features/documents/templates';
import { of, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MyCustomHttpUrlEncodingCodec } from 'app/features/e-commerce/order-form/store/order-form.effects';
import { MatDialog } from '@angular/material/dialog';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';

@Component({
  selector: 'review-order-proofs',
  templateUrl: './review-order-proofs.component.html',
  styleUrls: ['./review-order-proofs.component.css']
})
export class ReviewOrderProofsComponent implements OnInit {
  data: any;
  routeParams: any;
  document: any;
  documentDefinition: any;
  proofs: any;
  form: FormGroup;
  source = 'order';
  proofStatus = 0;
  loading: boolean;
  pageEvent: any = {
    'pageIndex': 0,
    'pageSize': 1
  };
  selectedProof: any;
  @ViewChild('formTemplate') formTemplate: TemplateRef<any>;
  formTemplateDialog: any;

  constructor(private route: ActivatedRoute,
    private api: ApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private documentHelper: DocumentHelpersService
    ) { }

  ngOnInit() {
    this.routeParams = this.route.snapshot.params;
    this.data = this.route.snapshot.data.data;
    this.proofs = this.data[1].data;
    this.route.queryParams.subscribe((queryParams: Params) => {
      if(queryParams.source && queryParams.source === 'artwork') {
        this.source = queryParams.source;
      }
    });
    
    // Show initial proof (or selected proof from params)
    this.selectedProof = this.proofs[this.pageEvent.pageIndex];
    this.makePdf();
    this.form = this.createForm();
  }

  makePdf() {
    this.document = new ArtProofDocument({
      order: this.data[0],
      resolve: this.data[1],
      disableApprovalButtons: true,
      directCustomerProof: this.selectedProof.source_type == 'artwork' ? true : false,
      onlyShowProofsById: [this.selectedProof.id],
    });
    
    this.document.setFormatter(this.documentHelper);
    this.loading = true;

    this.document.getDocumentDefinition().subscribe((definition) => {
      this.documentDefinition = definition;
      this.loading = false;
    });
  }

  refresh() {
    this.loading = true;
    return forkJoin(
      this.getOrder(),
      this.getProofs()
    ).subscribe((data) => {
      this.data = data;
      this.makePdf();
    });

  }
  getOrder() {
    return this.api.getOrderDetails(this.routeParams.id);
  }

  getProofs() {
    let params: HttpParams = new HttpParams({
      encoder: new MyCustomHttpUrlEncodingCodec()
    });
    params = params.append('filter[order_id]', this.routeParams.id);
    params = params.append('expand', 'transitions');
    params = params.append('filter[source_type]', this.source);
    return this.api.getArtProofs({
      params: params
    });
  }

  createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      action: [''],
      notes: [''],
    });
  }

  doTransition(proof) {
    const data = this.form.value;
    this.api.transitionArtProof(proof.id, data).subscribe((res) => {
              let status = this.proofStatus;
              if(status === 2){
                status = 3;
              }
              if(status === 3 || status === 4){
                status = 5;
              }
              this.api.updateArtworkStatusByDesignId(proof.artwork_id, status, data.name, data.notes).subscribe((res) => {
                      this.resetForm();
                      this.formTemplateDialog.close();
                      this.refresh();          
              })      
    });
  }

  private resetForm() {
    this.form.patchValue({
      name: [''],
      action: [''],
      notes: ['']
    });
  }

  transitionProof(proof, status) {
    proof.status = status;
    this.proofStatus = status;
    this.form.patchValue({
      action: status
    });

    this.formTemplateDialog = this.dialog.open(this.formTemplate);
    // this.api.updateArtProof(proof.id, proof).subscribe((res) => {
    //   this.refresh();
    // });
  }

  cancelTransition() {
    this.formTemplateDialog.close();
  }

  handlePageEvent(event) {
    this.pageEvent = event;
    this.selectedProof = this.proofs[event.pageIndex];
    this.makePdf();
  }
}
