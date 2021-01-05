import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs';
import { Location } from '../../../../models';
import { AccountsService } from '../../accounts.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Account } from '../../../../models';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class LocationListComponent implements OnInit {
  @Input() checkbox = false;
  @Output() selectRow = new EventEmitter();
  @Output() addLocation = new EventEmitter();
  @Output() selectLocation = new EventEmitter();
  @Output() removeLocation = new EventEmitter();
  @Output() reloadLocations = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: LocationsDataSource;
  displayColumns = ['companyName', 'locationName', 'deliverycontact', 'phoneOffice', 'shipping', 'locationType', 'buttons'];
  loading = false;
  account: Account;
  locationsCount = 0;
  selectedRow = -1;

  locationName = new FormControl('');
  phone = new FormControl('');
  email = new FormControl('');
  salesRep = new FormControl('');
  title = new FormControl('');

  terms = {
    locationName: '',
    phone: '',
    email: '',
    salesRep: '',
    title: ''
  };


  constructor(
    private accountsService: AccountsService,
    private dialog: MatDialog
  ) {
    this.dataSource = new LocationsDataSource(this.accountsService);
    this.account = this.accountsService.currentAccount;
    this.accountsService.onLocationsCountChanged
      .subscribe((count: number) => {
        this.locationsCount = count;
        this.loading = false;

        //Reset filter form values because 2 places use this component
        // this.locationName.setValue(this.accountsService.locationTerm.locationName);
        // this.phone.setValue(this.accountsService.locationTerm.phone);
        // this.email.setValue(this.accountsService.locationTerm.email);
        // this.salesRep.setValue(this.accountsService.locationTerm.salesRep);
        // this.title.setValue(this.accountsService.locationTerm.title);
      });
  }

  ngOnInit() {
    this.reloadLocations.emit(true);
    if (this.checkbox) {
      this.displayColumns.splice(6, 1);
      this.displayColumns.splice(0, 0, 'checkbox');
    }
  }

  formattedShippingAddress(location) {
    let formatted = location.shippingAddressStreet;

    if (location.shippingAddressStreet2) {
      formatted += '\n' + location.shippingAddressStreet2;
    }
    if (location.shippingAddressCity) {
      formatted += '\n' + location.shippingAddressCity;
    }
    if (location.shippingAddressState) {
      formatted += '\n' + location.shippingAddressState;
    }
    if (location.shippingAddressPostalcode) {
      formatted += '\n' + location.shippingAddressPostalcode;
    }
    if (location.shippingAddressCountry) {
      formatted += '\n' + location.shippingAddressCountry;
    }
    return formatted;
  }

  sortChange(ev) {
    if (this.loading) {
      return;
    }

    // let column = ev.active;
    // switch(ev.active) {
    //   case 'name':
    //     column = 'locationName';
    //     break;
    //   case 'sales':
    //     column = 'salesRep';
    //     break;
    // }

    this.loading = true;
    this.accountsService.getLocations(
      this.account.id,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      ev.active,
      ev.direction
    )
      .then(() => this.loading = false)
      .catch(() => this.loading = false);
  }


  paginate(ev) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    this.accountsService
      .getLocations(
        this.account.id,
        ev.pageIndex,
        ev.pageSize
      )
      .then(() => this.loading = false)
      .catch(() => this.loading = false);
  }

  filterLocations(field, ev, forceFetch = false) {
    if (!this.loading && (forceFetch || this.terms[field] !== ev.target.value)) {
      this.terms[field] = ev.target.value;
      this.loading = true;

      this.accountsService.locationTerm = this.terms;
      Promise.all([
        this.accountsService.getLocationsCount(this.account.id),
        this.accountsService.getLocations(this.account.id)
      ])
        .then(data => {
          this.loading = false;
          this.paginator.firstPage();
        });
    }
  }

  onSelectedChange(c) {
    this.selectedRow = c.id;
    this.selectRow.next(c);
  }


  newLocation() {
    this.addLocation.next();
  }

  selectLocations() {
    this.selectLocation.next();
  }

  deleteLocation(c) {
    this.removeLocation.next(c);
  }

}

export class LocationsDataSource extends DataSource<Location>
{
  empty = false;

  constructor(private accountsService: AccountsService) {
    super();
  }

  connect(): Observable<Location[]> {
    return this.accountsService.onLocationsChanged.pipe(
      map(locations => {
        setTimeout(() => {
          if (locations.length === 0) {
            this.empty = true;
          } else {
            this.empty = false;
          }
        }, 300);
        return locations;
      })
    );
  }

  disconnect() { }
}
