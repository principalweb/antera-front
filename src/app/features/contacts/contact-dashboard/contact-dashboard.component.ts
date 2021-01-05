import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Contact } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ContactsService } from 'app/core/services/contacts.service';

@Component({
  selector: 'app-contact-dashboard',
  templateUrl: './contact-dashboard.component.html',
  styleUrls: ['./contact-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ContactDashboardComponent implements OnInit, OnDestroy {

  contact: Contact;

  loading = false;
  existingRouteReuseStrategy: any;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private msg: MessageService,
    public contactsService: ContactsService,
    private router: Router,
  ) {
    this.contact = new Contact({});
  }

  ngOnInit() {
    this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.data.subscribe((data: any) => {
      this.contact = new Contact(data.contacts[0]);
    })
  }

  ngOnDestroy(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
  }

  ngAfterViewInit() {

  }

  updateContact(ev) {
    this.loading = true;
    const data = {
      id: this.contact.id,
      ...ev.dataForm.getRawValue(),
    };
    this.contactsService
      .updateContact(data)
      .subscribe(() => {
        this.contactsService.getContactDetails(this.contact.id).then((data) => {
          this.loading = false;
          this.contact = new Contact(data);
          this.msg.show('Contact Updated successfully.','success');
        });
      }, () => {
          this.loading = false;
          this.msg.show('Error occured while updating the contact','error');
      });
  }
}
