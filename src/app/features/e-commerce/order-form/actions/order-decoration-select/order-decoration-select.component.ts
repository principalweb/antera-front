import { Component, OnInit, Output, EventEmitter, Input, Optional, Inject, ViewChild } from '@angular/core';
import { ArtworksService } from 'app/core/services/artworks.service';
import { LineItem, MatrixRow, Artwork, OrderDetails, ProductDetails } from 'app/models';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FuseArtworksListComponent } from 'app/features/artworks/artworks-list/artworks-list.component';
import { OrderDecorationNewComponent } from '../order-decoration-new/order-decoration-new.component';
import { switchMap } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-order-decoration-select',
  templateUrl: './order-decoration-select.component.html',
  styleUrls: ['./order-decoration-select.component.scss'],
  providers: [ArtworksService],
})
export class OrderDecorationSelectComponent implements OnInit {

  @Input() order: OrderDetails;
  @Input() item: LineItem;
  @Input() product: ProductDetails;
  @Input() row: MatrixRow;

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();
  @ViewChild(FuseArtworksListComponent) artworkList: FuseArtworksListComponent;
  selectedArtworks: Artwork[];
  designsToModify: any[];
  error: string;
  action: string = 'modify';

  constructor(
    public artworks: ArtworksService,
    protected api: ApiService,
    @Optional() public dialogRef: MatDialogRef<OrderDecorationSelectComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    if(this.data && this.data.customerName){
        this.artworks.payload.term.customerName = this.data.customerName
    }
    this.artworks.changeView('list');
    this.artworks.selection.init([]);
  }

  selectArtwork() {
    const artworks = this.artworks.onArtworksChanged.getValue();
    const selectedIds = this.artworks.selection.selectedIds;

    this.selectedArtworks = artworks.filter((artwork) => {
      return selectedIds.includes(artwork.id);
    });


    this.designsToModify = this.selectedArtworks.map((artwork) => {
      const matrixRows = [this.row.matrixUpdateId];
      return {
        designId: artwork.designId,
        orderId: this.order.id,
        lineItemId: this.item.lineItemUpdateId,
        matrixRowIds: matrixRows,
        variationId: undefined,
        variationToChooseFrom: {},
        color: this.row.color,
        itemNo: this.item.itemNo,
      };
    });
  }

  selectToModify() {

    const artworks = this.artworks.onArtworksChanged.getValue();
    const selectedIds = this.artworks.selection.selectedIds;

    this.selectedArtworks = artworks.filter((artwork) => {
      return selectedIds.includes(artwork.id);
    });

    const _artwork = this.selectedArtworks[0];

    this.artworks.getArtwork(_artwork.id).pipe(
      switchMap((res: any) => {
        const artwork = new Artwork(res);
        artwork.id = '';
        artwork.customerId = this.order.accountId;
        artwork.customerName = this.order.accountName;
        artwork.orderIdentity = this.order.orderIdentity;
        artwork.orderId = this.order.id;
        artwork.designId = '';
        artwork.design.id = '';
        artwork.identity += ' Copy';
        artwork.statusId = '1';
        artwork.statusName = 'Pending';
        artwork.statusLabel = 'Pending';
        return this.api.createArtwork(artwork.toObject());
      }),
      switchMap((res: any) => this.api.getArtworkDetails(res.extra.id))
    ).subscribe((_artwork) => {
      const artwork = new Artwork(_artwork);
      const dialogRef = this.dialog.open(OrderDecorationNewComponent, {
        width: '90vw',
        height: '90vh',
      });
      dialogRef.componentInstance.order = this.order;
      dialogRef.afterOpened().subscribe(() => {
        dialogRef.componentInstance.decoData = ['edit', artwork.toObject()];
        dialogRef.componentInstance.artworkDetails.action = 'edit';
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          console.log('Attach new decoration', res);

          const variation = res.design.variation[0];
          this.designsToModify = [{
            designId: res.designId,
            orderId: this.order.id,
            lineItemId: this.item.lineItemUpdateId,
            matrixRowIds: [this.row.matrixUpdateId],
            variationId: variation.design_variation_unique_id,
            variationToChooseFrom: {},
          }];
        }
      });
    });
  }

  resetSelection() {
    this.selectedArtworks = undefined;
    this.designsToModify = undefined;
    this.artworks.selection.init([]);
  }

  get isValid() {
    return this.designsToModify.every((design) => typeof design.variationId !== 'undefined');
  }

  addToLineItem() {

    if (!this.isValid) {
      this.error = 'Select a variation for each design';
      return;
    }

    const selectedIds = this.artworks.selection.selectedIds;
    const action = {
      type: 'selectArtwork',
      selectedIds: selectedIds,
      artworks: this.selectedArtworks,
      designsToModify: this.designsToModify,
      row: this.row,
      item: this.item,
    };

    this.designsToModify.map((design) => {
      design.matrixRowIds.forEach(mrId => {
        design.variationToChooseFrom[mrId] = design.variationId;
      });
      return design;
    });

    if (this.dialogRef) {
      this.artworks.selection.reset([]);
      this.dialogRef.close(action);
    }

    this.actions.emit(action);
  }

  emitClose() {
    this.close.emit(true);
    if (this.dialogRef) {
      this.artworks.selection.reset([]);
      this.dialogRef.close(false);
    }
  }

  selectVariation(i, event: any) {
    this.designsToModify[i].variationId = event.variationId;
    this.designsToModify[i].design = event.design;
    this.designsToModify[i].error = '';
  }

}
