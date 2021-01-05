import { Component, OnInit, Output, EventEmitter, Input, Optional, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArtworksService } from 'app/core/services/artworks.service';
import { Artwork, OrderDetails } from 'app/models';
import { forkJoin } from 'rxjs';
import { ArtworkDetailsComponent } from 'app/features/artworks/artwork-details/artwork-details.component';

@Component({
  selector: 'app-order-decoration-new',
  templateUrl: './order-decoration-new.component.html',
  styleUrls: ['./order-decoration-new.component.scss']
})
export class OrderDecorationNewComponent implements OnInit {

  @Input() decoData: any;
  @Input() order: OrderDetails;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() create: EventEmitter<any> = new EventEmitter();
  @ViewChild(ArtworkDetailsComponent) artworkDetails: ArtworkDetailsComponent;
  loading: boolean = true;

  constructor(
    @Optional() public dialogRef: MatDialogRef<OrderDecorationNewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private cd: ChangeDetectorRef,
    private artworks: ArtworksService,
  ) { }

  ngOnInit() {
    forkJoin([
      this.artworks.getDesignLocations(),
      this.artworks.getAllDesignTypes(),
      this.artworks.getStatusList(),
      this.artworks.getAllDesignTypesDetailsOptions(),
    ]).subscribe(() => {
      if (!this.decoData) {
        const artwork = new Artwork();
        artwork.customerId = this.order.accountId;
        artwork.customerName = this.order.accountName;
        artwork.orderIdentity = this.order.orderIdentity;
        artwork.orderId = this.order.id;
        this.decoData = ['new', artwork.toObject()];
      }
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  emitCreate(event) {
    if (this.dialogRef) {
      // this.dialogRef.close(event);
      // TODO: Fetch artwork and show edit / add decoration button

      this.artworks.getArtwork(event).subscribe((res) => {
        const artwork = new Artwork(res);
        this.decoData = ['edit', artwork.toObject()];

        // Update artwork details sub component state
        this.artworkDetails.details = artwork;
        this.artworkDetails.action = 'edit';
        this.cd.markForCheck();
      });

    }
  }

  selectDecoration() {
    if (this.artworkDetails && this.artworkDetails.details) {
      const artwork: any = this.artworkDetails.details;
      artwork.variationToChooseFrom = {};
      this.dialogRef.close(this.artworkDetails.details);
    }
  }

  emitClose() {
    this.close.emit(true);
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
  }

}
