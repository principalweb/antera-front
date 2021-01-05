import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { MessageService } from './message.service';
import { ContactListItem, Contact } from 'app/models';
import { ApiService } from './api.service';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { map, subscribeOn, take } from 'rxjs/operators';

@Injectable()
export class ContactsService implements Resolve<any> {
  onContactsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onSelectedContactsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onUserDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onSearchTextChanged: Subject<any> = new Subject();
  onFilterChanged: Subject<any> = new Subject();
  onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onRelatedAccountsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onDropdownOptionsForContactChanged: BehaviorSubject<
    any[]
  > = new BehaviorSubject([]);
  onDisplayMenuChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onContactStatsChanged: BehaviorSubject<any> = new BehaviorSubject({});
  onModuleFieldsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

  contacts: ContactListItem[];
  user: any;
  selectedContacts: string[] = [];

  searchText: string;
  filterBy: string;
  accountID: string;
  page: any = {
    pageSize: 50,
    pageIndex: 0,
  };
  sort: any = { active: "dateCreated", direction: "desc" };
  term: any = {};
  viewMyItems = false;
  currentContact: Contact;
  select: string;

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private authService: AuthService
  ) {
    this.onSearchTextChanged.subscribe((searchText) => {
      this.searchText = searchText;

      this.getContactCount().then(console.log);
      this.getContacts().then(console.log);
    });
  }

  /**
   * The Contacts App Main Resolver
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const searchText = route.queryParamMap.get("search");
    this.searchText = searchText ? searchText : "";

    const id = route.paramMap.get("id");

    let list;
    localStorage.getItem("contacts_contactName") !== null
      ? Object.assign(this.term, {
          contactName: localStorage.getItem("contacts_contactName"),
        })
      : "";
    localStorage.getItem("contacts_title") !== null
      ? Object.assign(this.term, {
          title: localStorage.getItem("contacts_title"),
        })
      : "";
    localStorage.getItem("contacts_city") !== null
      ? Object.assign(this.term, {
          city: localStorage.getItem("contacts_city"),
        })
      : "";
    localStorage.getItem("contacts_state") !== null
      ? Object.assign(this.term, {
          state: localStorage.getItem("contacts_state"),
        })
      : "";
    localStorage.getItem("contacts_leadSource") !== null
      ? Object.assign(this.term, {
          leadSource: localStorage.getItem("contacts_leadSource"),
        })
      : "";
    localStorage.getItem("contacts_phone") !== null
      ? Object.assign(this.term, {
          phone: localStorage.getItem("contacts_phone"),
        })
      : "";
    localStorage.getItem("contacts_email") !== null
      ? Object.assign(this.term, {
          email: localStorage.getItem("contacts_email"),
        })
      : "";
    localStorage.getItem("contacts_salesRep") !== null
      ? Object.assign(this.term, {
          salesRep: localStorage.getItem("contacts_salesRep"),
        })
      : "";

    if (this.contacts && this.contacts.length > 0) {
      // Reset settings with first entry
      this.page = {
        pageSize: 50,
        pageIndex: 0,
      };
      this.sort = { active: "dateCreated", direction: "desc" };
      this.term = {};
      localStorage.getItem("contacts_contactName") !== null
        ? Object.assign(this.term, {
            contactName: localStorage.getItem("contacts_contactName"),
          })
        : "";
      localStorage.getItem("contacts_title") !== null
        ? Object.assign(this.term, {
            title: localStorage.getItem("contacts_title"),
          })
        : "";
      localStorage.getItem("contacts_city") !== null
        ? Object.assign(this.term, {
            city: localStorage.getItem("contacts_city"),
          })
        : "";
      localStorage.getItem("contacts_state") !== null
        ? Object.assign(this.term, {
            state: localStorage.getItem("contacts_state"),
          })
        : "";
      localStorage.getItem("contacts_leadSource") !== null
        ? Object.assign(this.term, {
            leadSource: localStorage.getItem("contacts_leadSource"),
          })
        : "";
      localStorage.getItem("contacts_phone") !== null
        ? Object.assign(this.term, {
            phone: localStorage.getItem("contacts_phone"),
          })
        : "";
      localStorage.getItem("contacts_email") !== null
        ? Object.assign(this.term, {
            email: localStorage.getItem("contacts_email"),
          })
        : "";
      localStorage.getItem("contacts_salesRep") !== null
        ? Object.assign(this.term, {
            salesRep: localStorage.getItem("contacts_salesRep"),
          })
        : "";
      console.log("helo");
    }

    list = [this.getContacts(), this.getContactCount()];

    if (id) {
      list.push(this.getContactDetails(id));
    }

    return Promise.all(list);
  }

  getContacts(isFilterRequired = false): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = {};
      if (isFilterRequired) {
        data = {
          offset: this.page.pageIndex,
          limit: this.page.pageSize,
          order: this.sort.active,
          orient: this.sort.direction,
          term: this.term,
          myViewItems: this.viewMyItems,
          permUserId: this.authService.getCurrentUser().userId,
          select: this.select,
        };
      } else {
        data = {
          offset: this.page.pageIndex,
          limit: this.page.pageSize,
          order: this.sort.active,
          orient: this.sort.direction,
          search: this.searchText,
          term: this.term,
          permUserId: this.authService.getCurrentUser().userId,
          select: this.select,
        };
      }

      this.api
        .post("/content/get-contact-list", data)
        .subscribe((response: any) => {
          this.contacts = response;

          this.contacts = this.contacts.map((contact) => {
            return new ContactListItem(contact);
          });

          this.onContactsChanged.next(this.contacts);
          resolve(this.contacts);
        }, reject);
    });
  }

  getContactCount(isFilterRequired = false): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = isFilterRequired
        ? {
            term: this.term,
            permUserId: this.authService.getCurrentUser().userId,
            select: this.select,
          }
        : {
            term: this.term,
            search: this.searchText,
            permUserId: this.authService.getCurrentUser().userId,
            select: this.select,
          };

      this.api
        .post("/content/get-contact-count", data)
        .subscribe((response: any) => {
          this.onTotalCountChanged.next(response.count);

          resolve(response.count);
        }, reject);
    });
  }

  getContactDetails(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api
        .post("/content/get-contact-details", { id })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getModuleFields() {
    const accountModuleFieldParams = {
      offset: 0,
      limit: 200,
      order: "module",
      orient: "asc",
      term: { module: "Contacts" },
      permUserId: "",
    };

    return this.api
      .getFieldsList(accountModuleFieldParams)
      .subscribe((response: any) => {
        this.onModuleFieldsChanged.next(
          response.map((moduleField) => new ModuleField(moduleField))
        );
        return response;
      });
  }

  setCurrentContact(contact) {
    this.currentContact = new Contact(contact);
  }

  /**
   * Toggle selected contact by id
   * @param id
   */
  toggleSelectedContact(id) {
    // First, check if we already have that todo as selected...
    if (this.selectedContacts.length > 0) {
      const index = this.selectedContacts.indexOf(id);

      if (index !== -1) {
        this.selectedContacts.splice(index, 1);

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);

        // Return
        return;
      }
    }

    // If we don't have it, push as selected
    this.selectedContacts.push(id);

    // Trigger the next event
    this.onSelectedContactsChanged.next(this.selectedContacts);
  }

  /**
   * Toggle select all
   */
  toggleSelectAll() {
    if (this.selectedContacts.length === this.contacts.length) {
      this.deselectContacts();
    } else {
      this.selectContacts();
    }
  }

  selectContacts(filterParameter?, filterValue?) {
    this.selectedContacts = [];

    // If there is no filter, select all todos
    if (filterParameter === undefined || filterValue === undefined) {
      this.selectedContacts = [];
      this.contacts.map((contact) => {
        this.selectedContacts.push(contact.id);
      });
    } else {
      /* this.selectedContacts.push(...
                 this.contacts.filter(todo => {
                     return todo[filterParameter] === filterValue;
                 })
             );*/
    }

    // Trigger the next event
    this.onSelectedContactsChanged.next(this.selectedContacts);
  }

  createContact(contact) {
    let req = {
      data: contact,
      permUserId: this.authService.getCurrentUser().userId,
    };

    return this.api.post("/content/create-contact", req);
  }

  updateContact(contact) {
    return this.api.post("/content/update-contact-details", contact);
  }

  deselectContacts() {
    this.selectedContacts = [];

    // Trigger the next event
    this.onSelectedContactsChanged.next(this.selectedContacts);
  }

  deleteContact(contactId) {
    return this.api
      .post("/content/delete-contact", {
        id: contactId,
        permUserId: this.authService.getCurrentUser().userId,
      })
      .pipe(
        map((response: any) => {
          if (response.status === "Success") {
            this.msg.show(
              "This item has been moved to the Recycle Bin",
              "success"
            );
          } else {
            this.msg.show(response.msg, "error");
          }
          return response;
        })
      );
  }

  getRelatedAccounts(contactId): Promise<any> {
    const data = {
      contactId: contactId,
      permUserId: this.authService.getCurrentUser().userId,
    };

    return new Promise((resolve, reject) => {
      this.api
        .post("/content/get-related-accounts", data)
        .subscribe((response: Account[]) => {
          this.onRelatedAccountsChanged.next(response);
          resolve(response);
        });
    });
  }

  updatePortalAccess(data: {
    accountId: string;
    contactId: string;
    portalAccessLevel: string;
    portalAllowedStatus: string[];
    displayWithOthers: string;
  }) {
  console.log('data')
  console.log(data)
    this.api
      .updatePortalAccess(data)
      .pipe(take(1))
      .subscribe(
        (res) => console.log("Update response", res),
        (error) => console.log("Update Portal Access Error", error)
      );
  }

  deleteSelectedContacts(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.deleteContacts(this.selectedContacts).subscribe(
        (response: any) => {
          resolve(response);
        },
        (err) => reject(err)
      );
    });
  }

  autocompleteUsers(name) {
    return this.api.getUserAutocomplete(name);
  }

  autocompleteContacts(name) {
    return this.api.getContactAutocomplete(name);
  }

  autocompleteAccounts(name) {
    return this.api.getAccountAutocomplete(name);
  }

  getContactStats(contactId) {
    const data = { id: contactId };
    return new Promise((resolve, reject) => {
      this.api.post("/content/get-contact-cards", data).subscribe(
        (response: any) => {
          this.onContactStatsChanged.next(response);
          resolve(response);
        },
        (err) => reject(err)
      );
    });
  }

  getDropdownOptionsForContact(options) {
    return new Promise((resolve, reject) => {
      this.api.getDropdownOptions({ dropdown: options }).subscribe(
        (response: any[]) => {
          this.onDropdownOptionsForContactChanged.next(response);
          resolve(response);
        },
        (err) => reject(err)
      );
    });
  }

  getDropdownOptionsForTags(options = {}) {
    const _options = {
      limit: 50,
      offset: 0,
      order: "name",
      orient: "asc",
      term: {},
    };
    return this.api.getContactTagsList({ ..._options, ...options });
  }

  getDisplayMenu(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.get("/content/get-display-menu").subscribe((list: any[]) => {
        this.onDisplayMenuChanged.next(list);
        resolve(list);
      }, reject);
    });
  }
}
