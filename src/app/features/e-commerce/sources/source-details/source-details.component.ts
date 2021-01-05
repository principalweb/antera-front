import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { SourceDetails } from 'app/models/source';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { ApiService } from 'app/core/services/api.service';
@Component({
  selector: 'app-source-details',
  templateUrl: './source-details.component.html',
  styleUrls: ['./source-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class SourceDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
  @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
  @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
  @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
  @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
  action = 'new';
  awsFileManagerType = 'sourcing';
  sourceDetails = new SourceDetails({});
  routeChanged: Subscription;
  submissions: any;

  constructor(private route: ActivatedRoute, private api: ApiService) {
  }

  ngOnInit() {
    this.routeChanged = this.route.data
      .subscribe(({ data }) => {
          this.action = data[0];
          this.sourceDetails = new SourceDetails(data[1]);
          this.getSourcingSubmissionsVendorDetails(this.sourceDetails.sourcingId).subscribe((res) => {
            this.submissions = res;
          });
      });
  }

  getSourcingSubmissionsVendorDetails(sourcingId) {
    return this.api.getSourcingSubmissionsVendorDetails(sourcingId);
  }

  ngOnDestroy() {
    this.routeChanged.unsubscribe();
  }
}
