import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { find } from 'lodash';

import { ApiService } from 'app/core/services/api.service';
import { ArtworksService } from 'app/core/services/artworks.service';
import { MessageService } from 'app/core/services/message.service';
import { EcommerceOrderService } from '../../order.service';
import { Artwork } from 'app/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { switchMap, catchError, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-attach-design-dialog',
  templateUrl: './attach-design-dialog.component.html',
  styleUrls: ['./attach-design-dialog.component.scss']
})
export class AttachDesignDialogComponent implements OnInit {
  designTypes = [];
  form: FormGroup;
  selectedDesignType: any = {};
  featureImage = '';
  identity = '';
  fileName = '';
  folderId = '';
  designDist = null;
  loading = false;
  imgLoading = false;
  statusList: any;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private artworks: ArtworksService,
    private orderService: EcommerceOrderService,
    private msg: MessageService,
    public dialogRef: MatDialogRef<AttachDesignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    /*
        const getSubFolder = (parentId, fname, options = { maxItems: 1000, skipCount: 0 }) => r => {
          const fa = r.list.entries.find( child => child.entry.name === fname);
          if (!fa) {
            
            if (r.list.pagination.hasMoreItems) {
              options.skipCount += options.maxItems;
              return this.nodesApi.getNodeChildren(parentId, options).pipe(
                switchMap(getSubFolder(parentId, fname, options))
              );
            }
    
            return of(null);
          } else {
            return of(fa.entry);
          }
        };
    
        this.nodesApi.getNodeChildren(this.data.parentFolderId, {maxItems: 1000}).pipe(
          switchMap(getSubFolder(this.data.parentFolderId, 'temp')),
          switchMap(
            (folder: any) => {
              if (folder) {
                return of(folder);
              }
    
              return this.nodesApi.createFolder(this.data.parentFolderId, {name: 'temp'});
            }
          )
          .subscribe(folder => {
            this.folderId = folder.id;
          });
    */
    this.form = this.fb.group({
      featureImage: ['', Validators.required],
      notes: [''],
      identity: ['', Validators.required],
      designTypeId: ['', Validators.required],
      designTypeName: ['', Validators.required]
    });
  }

  ngOnInit() {
    forkJoin([
      this.artworks.getAllDesignTypes(),
      this.artworks.getStatusList(),
    ]).subscribe(([list, statusList]) => {
      this.designTypes = list;
      this.statusList = statusList;
    });
  }

  selectDesignType(ev) {
    this.selectedDesignType = find(this.designTypes, { id: ev.value })
    this.form.patchValue({
      designTypeId: this.selectedDesignType.id,
      designTypeName: this.selectedDesignType.name
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const decoType = find(this.artworks.designTypes, { id: this.form.value.designTypeId });

    this.loading = true;
    this.api.getDecoratorVendorsByDecoType({
      decoType: decoType && decoType.code
    }).pipe(
      switchMap((list: any[]) => {
        const st = find(this.artworks.onStatusListChanged.value, { name: 'Done' });
        let vendor = {
          id: null,
          vendor: null,
        };
        if (list.length) {
          vendor = list[0];
        }

        const identity = this.form.value.identity;
        const artwork = new Artwork({
          customerId: this.orderService.order.accountId,
          customerName: this.orderService.order.accountName,
          orderId: this.orderService.order.id,
          orderNum: this.orderService.order.orderNo,
          designTypeId: decoType.id,
          designTypeName: decoType.name,
          identity: identity,
          statusId: st.id,
          statusName: st.name,
          featureImage: this.featureImage,
          image: this.featureImage,
          moveArtworkFromOrder: "1",
          fileName: this.fileName
        });



        artwork.design.update({
          customerId: this.orderService.order.accountId,
          customerName: this.orderService.order.accountName,
          designType: decoType.code,
          name: this.form.value.identity,
          notes: this.form.value.notes,
          decoVendorId: vendor.id,
          decoVendorName: vendor.vendor,
          designImages: [this.form.value.featureImage],
        });
        return this.api.createArtwork(artwork.toObject()).pipe(
          switchMap((_artwork: any) => {
            const artworkToUpdate = new Artwork(_artwork.extra);

            const variation = {
              design_variation_unique_id: "",
              design_variation_title: "",
              itemImage: [artworkToUpdate.featureImage],
              itemImageThumbnail: [artworkToUpdate.thumbnail],
              design_variation_product: identity,
              design_variation_color: '',
              design_variation_location: '',
              design_note: '',
              design_color_thread_pms: []
            };

            artworkToUpdate.design.update({
              variation: [variation]
            });
            return this.api.updateArtwork(artworkToUpdate);
          })
        );
      }),
    ).subscribe((res: any) => {
      this.loading = false;
      this.dialogRef.close(res.extra);
    });

  }

  onFileUploadEventForAws(event) {

    if (event.target.files.length > 0) {
      this.imgLoading = true;
      let file = event.target.files[0];
      const data = new FormData();
      data.append('artworkFile', file);
      data.append("accountId", this.orderService.order.accountId);
      data.append("orderNumber", this.orderService.order.orderNo);
      this.api.uploadArtworkToFileManger(data)
        .subscribe((res: any) => {
          this.imgLoading = false;
          this.featureImage = res.url;
          this.identity = res.name;
          this.fileName = res.fileName;
          this.form.patchValue({
            featureImage: this.featureImage,
            identity: this.identity
          });
        }, (err => {
          this.imgLoading = false;
        }));



    }

  }

  removeFeaturedImage() {
    this.form.patchValue({
      featureImage: ''
    });
  }
}
