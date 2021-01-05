import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SourceDetails } from 'app/models/source';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { catchError } from 'rxjs/operators';
import { SourceFactoryResponseComponent } from 'app/shared/templates/source-factory-response/source-factory-response.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-source-submission-tab',
  templateUrl: './submission-tab.component.html',
  styleUrls: ['./submission-tab.component.scss']
})
export class SubmissionTabComponent implements OnInit {

  @Input() sourceDetails: SourceDetails;
  @Input() submission: any;
  @ViewChild(SourceFactoryResponseComponent) documentRef: SourceFactoryResponseComponent;
  submissionDetails: any;

  constructor(
    private api: ApiService, 
    private msg: MessageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.api.getSourcingSubmissionsDetails(this.submission.id).subscribe((details: any) => {
      this.submissionDetails = { ...details };
    });
  }

  toPdf() {
    this.documentRef.toPdf();
  }

  convertToQuote() {
    this.api.convertSourcingSubmissionToQuote(this.submissionDetails.id)
      .subscribe((res: any) => {
        if (res.status === 'success') {
          this.msg.show(res.msg, 'success');
          this.router.navigate(['/e-commerce', 'quotes', res.QuoteDetails.id]);
        } else {
          this.msg.show(res.msg, 'error');
        }
      });
  }

  onSubmit(event) {
    this.api.updateSourcingSubmission(event).subscribe((res: any) => {
      if (res.status === 'success') {
        this.msg.show('Submission updated successfully', 'success');
      }
    });
  }

  onFormChange(event) {
    this.submissionDetails = { ...event };
  }

}
