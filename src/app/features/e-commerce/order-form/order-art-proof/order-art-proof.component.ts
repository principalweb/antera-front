import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { IDecoVendor } from '../interfaces';
import { ApiService } from 'app/core/services/api.service';
import { ArtProofDocument } from 'app/features/documents/templates';

@Component({
  selector: 'order-art-proof',
  templateUrl: './order-art-proof.component.html',
  styleUrls: ['./order-art-proof.component.css']
})
export class OrderArtProofComponent implements OnInit {
  form: FormGroup;
  deco: IDecoVendor;
  uploading: boolean;
  proof: any;

  statusMap = {
    1: 'PENDING',
    2: 'DECLINED',
    3: 'APPROVED (with changes)',
    4: 'APPROVED'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderArtProofComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.form = this.createForm(this.data.model);
    this.proof = this.data.model;
  }

  save() {
    if (this.form.valid) {
      const id = this.form.get('id').value;
      const data = this.form.value;

      if (!id) {
        this.api.createArtProof(data).subscribe((res) => {
          this.dialogRef.close(res);
        });
      } else {
        this.api.updateArtProof(id, data).subscribe((res) => {
          this.dialogRef.close(res);
        });
      }
    }
  }

  close() {
    this.dialogRef.close(false);
  }


  createForm(data) {
    const form = this.fb.group({
      id: [''],
      account_id: ['', Validators.required],
      product_id: ['', Validators.required],
      order_id: ['', Validators.required],
      artwork_id: ['', Validators.required],
      artwork_variation_id: ['', Validators.required],
      status: [1, Validators.required],
      image_url: ['', Validators.required],
      notes: [''],
    });

    form.patchValue(data);

    return form;
  }

  uploadImage(event) {
    if (event.target.files.length > 0) {
      this.uploading = true;
      let file = event.target.files[0];
      const data = new FormData();
      data.append('File', file);
      this.api.uploadAnyFile(data)
        .subscribe((res: any) => {
          this.uploading = false;
          this.form.patchValue({
            image_url: res.url
          });
        });
    }
  }

  removeImage() {
    this.form.patchValue({
      image_url: '',
    });
  }

}
