import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Account, Contact } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { AccountsService } from '../accounts.service';
import { MessageService } from 'app/core/services/message.service';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { BalanceInfoComponent } from '../components/balance-info/balance-info.component';
import { VendorDecorationPriceStrategyComponent } from '../components/vendor-decoration-price-strategy/vendor-decoration-price-strategy.component';
import { FuseArtworksListComponent } from 'app/features/artworks/artworks-list/artworks-list.component';
//import { ArtworksService } from 'app/core/services/artworks.service';

@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
//  providers: [ArtworksService]
})
export class AccountDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
  @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
  @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
  @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
  @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
  @ViewChild(BalanceInfoComponent) balanceinfocomponent: BalanceInfoComponent;
  @ViewChild(VendorDecorationPriceStrategyComponent) vendorDecorationPriceStrategyComponent: VendorDecorationPriceStrategyComponent;
  @ViewChild(FuseArtworksListComponent) artworkList: FuseArtworksListComponent;
  account: Account;
  awsFileManagerType = 'accounts';
  team: Contact[] = [];
  ttCount = 0;
  totalAccounts = 0;
  topRank = 10;

  loading = false;
  existingRouteReuseStrategy: any;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private accountsService: AccountsService,
    private msg: MessageService,
    //private artworks: ArtworksService,
    private router: Router,
  ) {
    this.account = new Account();
  }

  ngOnInit() {

    this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;;

    const data = this.route.snapshot.data.data;
    this.account = data[0];

    //this.artworks.payload.term.customerName = this.account.accountName;
    //this.artworks.payload.limit = 50;

    this.team = data[1];
    this.ttCount = data[2];
    this.totalAccounts = data[3] ? data[3] : 1;
    this.topRank = Math.ceil((this.account.ranking / this.totalAccounts) * 100);
    if (this.topRank > 1 && this.topRank <= 15) {
      this.topRank = 10;
    }
    else if (this.topRank > 15 && this.topRank <= 25) {
      this.topRank = 25;
    }
    else if (this.topRank > 25 && this.topRank <= 50) {
      this.topRank = 50;
    }
    else if (this.topRank > 50 && this.topRank <= 75) {
      this.topRank = 75;
    }
    else if (this.topRank > 75) {
      this.topRank = 100;
    }

  }

  ngOnDestroy(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
  }

  editAccount(event) {

    this.loading = true;
    let data = {
      id: this.account.id,
      ...event.dataForm.getRawValue(),
    };
    if (event.type == "AdditionalInfo") {

      data = {
        ...data,
        firstOrderDate: event.dataForm.get('firstOrderDate') ? moment(event.dataForm.get('firstOrderDate').value).format('YYYY-MM-DD') : null,
        logo: event.logo,
        salesRepId: this.account.salesRepId,
        salesRep: this.account.salesRep,
      };
    }

    this.accountsService
      .updateAccount(data)
      .subscribe((response) => {
        // Temporarily call account detail api , update api call response should be same with account detail response.
        this.accountsService.getAccountDetail(this.account.id).then((data) => {
          this.loading = false;
          this.account = new Account(data);
          this.msg.show('Account Updated successfully.', 'success');
          if(event.type == "PriceStrategy"){
              this.vendorDecorationPriceStrategyComponent.getPriceStrategyPerAccount();
          }
          if(event.type == "BalanceInfo"){
              this.balanceinfocomponent.getCreditPerAccount();
              this.balanceinfocomponent.getCurrentCreditAmount();          
          }

        });
      }, (err) => {
        this.loading = false;
        this.msg.show('Error occured while updating the account', 'error');
      });
  }

}
