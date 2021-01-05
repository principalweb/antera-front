import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SourceResponseService } from 'app/core/services/source-response.service';
import { fuseAnimations } from '@fuse/animations';
import { SourceFactoryResponseComponent } from 'app/shared/templates/source-factory-response/source-factory-response.component';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { map, tap, catchError, last, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-factory-inquiry',
  templateUrl: './factory-inquiry.component.html',
  styleUrls: ['./factory-inquiry.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FactoryInquiryComponent implements OnInit {
  sourceForm: any;
  sourceDetails: any = {};
  submissionDetails: any;;
  @ViewChild(SourceFactoryResponseComponent) documentRef: SourceFactoryResponseComponent;
  loading: boolean;
  success: boolean;
  factoryId: any;
  logo: any;
  factoryDetails: any;

  constructor(
    private route: ActivatedRoute,
    private service: SourceResponseService,
    private msg: MessageService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    let data = this.route.snapshot.data[0];
    if (data) {
      this.logo = data[0];
      this.factoryDetails = data[1];
      this.sourceDetails = data[2];
    }

    this.getSourcingSubmissionsVendorDetails(this.sourceDetails.sourcingId).pipe(
      switchMap((res: any[]) => {
        const submission = res.find((item) => item.vendorId === this.factoryDetails.id);
        if (!submission) {
          return of({
            itemName: this.sourceDetails.itemName,
            itemNumber: this.sourceDetails.itemNumber,
            vendorId: this.factoryDetails.id,
            sourcingId: this.sourceDetails.sourcingId,
            quantity1: this.sourceDetails.quantity1,
            quantity2: this.sourceDetails.quantity2,
            quantity3: this.sourceDetails.quantity3,
            quantity4: this.sourceDetails.quantity4,
            quantity5: this.sourceDetails.quantity5,
          });
        }
        return this.api.getSourcingSubmissionsDetails(submission.id);
      }),
    ).subscribe((submission) => {
      this.submissionDetails = submission;
    });

  }

  getSourcingSubmissionsVendorDetails(sourcingId) {
    return this.api.getSourcingSubmissionsVendorDetails(sourcingId);
  }

  toPdf() {
    this.documentRef.toPdf();
  }

  onSubmit(event) {
    let request;
    if (event.id) {
      request = this.service.updateSourcingSubmission(event);
    } else {
      request = this.service.createSourcingSubmission(event);
    }

    request.pipe(
      catchError(() => {
        this.loading = false;
        return of(false);
      })
    ).subscribe((res: any) => {
      this.loading = false;
      if (res.status === 'success') {
        this.success = true;
        this.scrollToTop();
      }
      if (res.status === 'error') {
        this.success = false;
        this.msg.show(res.msg, 'error');
      }
    });

  }

  scrollToTop() {
    const container = document.getElementById('external');
    container.scrollTop = 0;
  }

  onFormChange(event) {
    this.submissionDetails = { ...this.submissionDetails, ...event };
  }
}
