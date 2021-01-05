import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { find } from 'lodash';
import { Artwork } from 'app/models';
import * as moment from 'moment';
import { DesignPreviewPopupComponent } from '../design-preview-popup/design-preview-popup.component';
import { OrderDetailDialogComponent } from 'app/shared/order-detail-dialog/order-detail-dialog.component';
import { displayName } from '../../utils';
import { ArtworksService } from 'app/core/services/artworks.service';
import { ApiService } from 'app/core/services/api.service';
import { Subscription, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
import { ArtworkVariation, ArtworkDescription, ColorThread } from 'app/models';
import { details } from '../../constants';
import { MessageService } from 'app/core/services/message.service';
import { ArtworkDetailsComponent } from '../artwork-details.component';
import { UpdateArtworkVariationToOrderComponent } from '../update-artwork-variation-to-order/update-artwork-variation-to-order.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CustomValidators } from 'app/shared/validators/validators';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import * as html2pdf from 'html2pdf.js';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-artwork-design-tab',
  templateUrl: './design-tab.component.html',
  styleUrls: ['./design-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DesignTabComponent implements OnInit {
  @Input() action = 'new';
  @Input() embedded = false;
  @Input() artwork: Artwork;
  @Output() afterCreate = new EventEmitter();
  @ViewChild(ArtworkDetailsComponent) artworkdetailscomponent: ArtworkDetailsComponent;
  @ViewChild('printArea') printArea: ElementRef;
  orderDetailDlgRef: MatDialogRef<OrderDetailDialogComponent>;
  variationUpdateToOroderDlgRef: MatDialogRef<UpdateArtworkVariationToOrderComponent>;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  excludeInvalidControls = ['customerId', 'assignedId', 'decoVendorId', 'artworkContactId', 'salesRepId'];
  displayName = displayName;
  displayedColumns = ['actions', 'filename', 'size', 'purpose', 'notes'];
  allowedFieldForNewArtwork = ['customerName', 'identity', 'designTypeName', 'decoVendorName', 'priority', 'notes'];
  loading: boolean = false;
  sourceType: string = 'artwork';
  amountTypeList = [{
    label: 'Percentage (%)',
    value: 'P'
  },
  {
    label: 'Amount ($)',
    value: 'A'
  }];
  usageStatusList = [{
    label: 'Active',
    value: 'A'
  },
  {
    label: 'Inactive',
    value: 'I'
  }];
  filteredCustomers: Observable<any[]>;
  filteredAssignees: Observable<any[]>;
  filteredContacts: Observable<any[]>;
  filteredVendors = [];
  designTypes = [];
  designTypesDetailsOptions = [];
  designLocations = [];
  artCardDecoDetails = [];
  //displayedDecoDetailsColumns: string[] = ['decoProductItemNo', 'decoProductName', 'decoProductSize', 'decoProductColor', 'decoProductQty', 'decoLocation'];
  displayedDecoDetailsColumns: string[] = ['decoProductSize'];
  filteredUsers: any;
  featureImage = '';
  thumbnail = '';

  form: FormGroup;
  edit = false;
  statusList = this.service.onStatusListChanged;
  priorities = [];
  editDescriptions = false;
  editVariations = false;
  designTypeTouched = false;
  selectedDesignType: any;
  printing: boolean;
  featuredImageForPrinting: boolean;
  fields = [];
  fieldLabel = fieldLabel;
  requiredField = requiredField;
  visibleField = (type, fields) => {
    const isVisible = visibleField(type, fields);
    return isVisible;
  }

 artworkVariation: any;;
 orderVariation: any;

  constructor(
    private service: ArtworksService,
    private dialog: MatDialog,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private msg: MessageService,
    private elRef: ElementRef,
    private zone: NgZone,
  ) {
    this.designTypes = this.service.designTypes;
    this.designTypesDetailsOptions = this.service.designTypesDetailsOptions;
    this.api.getDropdownOptions({ dropdown: ['sys_artwork_priorities_list'] })
      .subscribe((res: any[]) => {
        this.priorities = find(res, { name: 'sys_artwork_priorities_list' }).options;
      });
  }

  ngOnInit() {
    if (this.action !== 'edit') {
      this.edit = true;
    }
    this.designLocations = this.service.designLocations;


    const artworkModuleFieldParams =
    {
      offset: 0,
      limit: 1000,
      order: 'module',
      orient: 'asc',
      term: { module: 'Artwork' }
    }
    this.loading = true;
    this.api.getFieldsList(artworkModuleFieldParams)
      .subscribe((res: any[]) => {
        this.fields = res.map(moduleField => new ModuleField(moduleField));
        //console.log(this.fields);
        this.loading = false;
        this.initForm();
      }, () => { this.loading = false; });
  }

  selectSalesRep(ev) {
    const assignee = ev.option.value;
    this.form.get('salesRep').setValue(assignee.name);
    this.form.get('salesRepId').setValue(assignee.id);
  }

  clearSaleRep() {
    this.form.patchValue({
      salesRep: '',
      salesRepId: ''
    });
  }

  downloadPDF() {
    this.printing = true;
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.featuredImageForPrinting = true
        const element = this.printArea.nativeElement;
        const filename = `artwork-${this.artwork.designNo}.pdf`;
        const opt = this.getPdfOptions(filename);
        html2pdf(element, opt).output('datauristring').then((val) => {
          this.zone.run(() => {
            this.featuredImageForPrinting = false;
            this.loading = false;
            this.printing = false;
            this.msg.show(`Exported ${filename} successfully`, 'success');
          });
        });
      }, 50);
    });
  }

  private getPdfOptions(filename: string) {
    const scale = 2;
    const dpi = 144;

    return {
      margin: [20, 20, 20, 20],
      filename: filename,
      image: { type: 'jpeg' },
      enableLinks: true,
      pagebreak: {
        mode: ['css'],
        before: ['.section--variations'],
        after: ['.page-break'],
        avoid: ['tr', 'img']
      },
      html2canvas: {
        scale: scale,
        dpi: dpi,
        logging: false,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };
  }

  initForm() {

    const descriptions = this.artwork.design.designDescriptionStitches
      .map(desc => this.newDescriptionForm(desc));

    const variations = this.artwork.design.variation
      .map(variation => this.newVariationForm(variation));

   

    if (!this.artwork.statusId) {
      const st = find(this.statusList.value, { name: 'Pending' });
      this.artwork.statusId = st.id;
      this.artwork.statusName = st.name;
    }

    if (!this.artwork.priority) {
      this.artwork.priority = 'Low';
    }
    let dueDate = this.artwork.dueDate ? moment(this.artwork.dueDate, 'MM/DD/YYYY').add(1, 'd').toDate() : null;
    let dateApproved = null;
    

    if(this.artwork.id){
        dueDate = this.artwork.dueDate ? moment(this.artwork.dueDate, 'MM/DD/YYYY').toDate() : null;
        
        console.log('this.artwork.dateApproved')
        console.log(this.artwork.dateApproved)

        dateApproved = (this.artwork.dateApproved && this.artwork.dateApproved != '0000-00-00 00:00:00') ? moment(this.artwork.dateApproved).toDate() : null;
        console.log('dateApproved')
        console.log(dateApproved)
        
    }

    this.form = this.fb.group({
      identity: (requiredField('identity', this.fields) && this.isRequiredForNewArtwork('identity')) ? [this.artwork.identity, Validators.required] : [this.artwork.identity],
      designNo: (requiredField('designNo', this.fields) && this.isRequiredForNewArtwork('designNo')) ? [this.artwork.designNo, Validators.required] : [this.artwork.designNo],
      customerId: (requiredField('customerId', this.fields) && this.isRequiredForNewArtwork('customerName')) ? [this.artwork.customerId, Validators.required] : [this.artwork.customerId],
      customerName: (requiredField('customerName', this.fields) && this.isRequiredForNewArtwork('customerName')) ? [this.artwork.customerName, Validators.required] : [this.artwork.customerName],
      orderId: (requiredField('orderId', this.fields) && this.isRequiredForNewArtwork('orderId')) ? [this.artwork.orderId, Validators.required] : [this.artwork.orderId],
      orderNum: (requiredField('orderNum', this.fields) && this.isRequiredForNewArtwork('orderNum')) ? [this.artwork.orderNum, Validators.required] : [this.artwork.orderNum],
      orderIdentity: (requiredField('orderIdentity', this.fields) && this.isRequiredForNewArtwork('orderIdentity')) ? [this.artwork.orderIdentity, Validators.required] : [this.artwork.orderIdentity],
      designTypeId: (requiredField('designTypeId', this.fields) && this.isRequiredForNewArtwork('designTypeName')) ? [this.artwork.designTypeId, Validators.required] : [this.artwork.designTypeId],
      designTypeName: (requiredField('designTypeName', this.fields) && this.isRequiredForNewArtwork('designTypeName')) ? [this.artwork.designTypeName, Validators.required] : [this.artwork.designTypeName],
      category: (requiredField('category', this.fields) && this.isRequiredForNewArtwork('category')) ? [this.artwork.category, Validators.required] : [this.artwork.category],
      color: (requiredField('color', this.fields) && this.isRequiredForNewArtwork('color')) ? [this.artwork.color, Validators.required] : [this.artwork.color],
      statusId: (requiredField('statusId', this.fields) && this.isRequiredForNewArtwork('statusId')) ? [this.artwork.statusId, Validators.required] : [this.artwork.statusId],
      statusName: (requiredField('statusName', this.fields) && this.isRequiredForNewArtwork('statusName')) ? [this.artwork.statusName, Validators.required] : [this.artwork.statusName],
      usageStatus: (requiredField('usageStatus', this.fields) && this.isRequiredForNewArtwork('usageStatus')) ? [this.artwork.usageStatus, Validators.required] : [this.artwork.usageStatus],
      statusLabel: (requiredField('statusLabel', this.fields) && this.isRequiredForNewArtwork('statusLabel')) ? [this.artwork.statusLabel, Validators.required] : [this.artwork.statusLabel],
      estimated: (requiredField('estimated', this.fields) && this.isRequiredForNewArtwork('estimated')) ? [this.artwork.estimated, Validators.required] : [this.artwork.estimated],
      notes: (requiredField('notes', this.fields) && this.isRequiredForNewArtwork('notes')) ? [this.artwork.notes, Validators.required] : [this.artwork.notes],
      salesRep: (requiredField('salesRep', this.fields) && this.isRequiredForNewArtwork('notes')) ? [this.artwork.salesRep, Validators.required] : [this.artwork.salesRep],
      salesRepId: (requiredField('salesRepId', this.fields) && this.isRequiredForNewArtwork('salesRepId')) ? [this.artwork.salesRepId, Validators.required] : [this.artwork.salesRepId],
      assignee: (requiredField('assignee', this.fields) && this.isRequiredForNewArtwork('assignee')) ? [this.artwork.assignee, Validators.required] : [this.artwork.assignee],
      assignedId: (requiredField('assignedId', this.fields) && this.isRequiredForNewArtwork('assignedId')) ? [this.artwork.assignedId, Validators.required] : [this.artwork.assignedId],
      priority: (requiredField('priority', this.fields) && this.isRequiredForNewArtwork('priority')) ? [this.artwork.priority, Validators.required] : [this.artwork.priority],
      url: (requiredField('url', this.fields) && this.isRequiredForNewArtwork('url')) ? [this.artwork.url, Validators.required] : [this.artwork.url],
      size: (requiredField('size', this.fields) && this.isRequiredForNewArtwork('size')) ? [this.artwork.design.size, Validators.required] : [this.artwork.design.size],
      dueDate: (requiredField('dueDate', this.fields) && this.isRequiredForNewArtwork('dueDate')) ? [dueDate, Validators.required] : [dueDate],
      createdDate: (requiredField('createdDate', this.fields) && this.isRequiredForNewArtwork('createdDate')) ? [this.artwork.createdDate, Validators.required] : [this.artwork.createdDate],
      artworkContactId: (requiredField('artworkContactId', this.fields) && this.isRequiredForNewArtwork('artworkContactId')) ? [this.artwork.artworkContactId, Validators.required] : [this.artwork.artworkContactId],
      artworkContactName: (requiredField('artworkContactName', this.fields) && this.isRequiredForNewArtwork('artworkContactName')) ? [this.artwork.artworkContactName, Validators.required] : [this.artwork.artworkContactName],
      artworkContactEmail: (requiredField('artworkContactEmail', this.fields) && this.isRequiredForNewArtwork('artworkContactEmail')) ? [this.artwork.artworkContactEmail, Validators.required] : [this.artwork.artworkContactEmail],      
      approvedBy: (requiredField('approvedBy', this.fields) && this.isRequiredForNewArtwork('approvedBy')) ? [this.artwork.approvedBy, Validators.required] : [this.artwork.approvedBy],
      dateApproved: (requiredField('dateApproved', this.fields) && this.isRequiredForNewArtwork('dateApproved')) ? [dateApproved, Validators.required] : [dateApproved],
      royaltyRetail: (requiredField('royaltyRetail', this.fields) && this.isRequiredForNewArtwork('royaltyRetail')) ? [this.artwork.royaltyRetail, Validators.required] : [this.artwork.royaltyRetail],
      royaltyRetailAmountType: (requiredField('royaltyRetailAmountType', this.fields) && this.isRequiredForNewArtwork('royaltyRetailAmountType')) ? [this.artwork.royaltyRetailAmountType, Validators.required] : [this.artwork.royaltyRetailAmountType],
      royaltyWholesale: (requiredField('royaltyWholesale', this.fields) && this.isRequiredForNewArtwork('royaltyWholesale')) ? [this.artwork.royaltyWholesale, Validators.required] : [this.artwork.royaltyWholesale],
      royaltyWholesaleAmountType: (requiredField('royaltyWholesaleAmountType', this.fields) && this.isRequiredForNewArtwork('royaltyWholesaleAmountType')) ? [this.artwork.royaltyWholesaleAmountType, Validators.required] : [this.artwork.royaltyWholesaleAmountType],
      decoVendorId: [this.artwork.design.decoVendorId, Validators.required],
      decoVendorName: [{
        value: this.artwork.design.decoVendorName,
        disabled: true
      }],
      detail: (requiredField('stitchCount', this.fields) && this.isRequiredForNewArtwork('stitchCount')) ? [this.artwork.design.stitchCount, Validators.required] : [this.artwork.design.stitchCount],
      designDescriptionStitches: this.fb.array(descriptions),
      variation: this.fb.array(variations),
      featureImage: [this.artwork.featureImage],
      thumbnail: [this.artwork.thumbnail],
    }, {
        validator: [
          CustomValidators.requiredTogether('decoVendorId', 'decoVendorName'),
        ]
      }
    );
    
     this.form.get('salesRep').valueChanges.pipe(
        map(val => displayName(val).trim().toLowerCase()),
        debounceTime(400),
        distinctUntilChanged()
    ).subscribe(keyword => {
        if (keyword.length >= 3) {
            this.service.autocompleteUsers(keyword).subscribe(res => {
              console.log("res",res)
                this.filteredUsers = res;
            });
        }
    });
    this.filteredCustomers =
      this.autoCompleteWith('customerName', val =>
        this.api.getCustomerAutocomplete(val)
      );

    this.filteredAssignees =
      this.autoCompleteWith('assignee', val =>
        this.api.getUserAutocomplete(val)
      );

    this.filteredContacts =
      this.autoCompleteWith('artworkContactName', val =>
        this.api.getContactAutocomplete(val, true)
      );


    this.selectedDesignType = find(this.designTypes, { id: this.artwork.designTypeId });
    this.getDecoVendors();
    if(this.artwork.id){
        this.getArtCardDecoDetails(this.artwork.id);
    }
  }

  get details() {
    if (!this.selectedDesignType) {
      return [];
    }
    //return details[this.selectedDesignType.code] || [];
    return this.selectedDesignType.detailOptions || [];
  }


  get detailLabel() {
    if (!this.selectedDesignType) {
      return 'Details';
    }

    return 'Details - ' + this.selectedDesignType.detailName;
  }

  getDecoVendors() {
    const decoType = find(this.service.designTypes, { id: this.form.value.designTypeId });
    this.api.getDecoratorVendorsByDecoType({
      decoType: decoType && decoType.code
    }).subscribe((list: any[]) => {
      this.designTypeTouched = true;
      if (list.length === 0) {
        this.form.get('decoVendorName').disable();
        this.form.patchValue({
          decoVendorId: '',
          decoVendorName: ''
        })
      } else {
        const vendor = find(list, { id: this.form.value.decoVendorId });
        if (!vendor) {
          this.form.patchValue({
            decoVendorId: '',
            decoVendorName: ''
          });
        }
        this.form.get('decoVendorName').enable();
      }

      this.filteredVendors = list;
    });
  }
  getArtCardDecoDetails(id){
    this.api.getDecoDetailsForArtCard(id).subscribe((list: any[]) => {
      this.artCardDecoDetails = list;
      console.log('this.artCardDecoDetails');
      console.log(this.artCardDecoDetails);
      this.loading = false;
    });  
  }
  addDescription() {
    const descriptionsControl = <FormArray>this.form.get('designDescriptionStitches');
    descriptionsControl.push(
      this.newDescriptionForm(new ArtworkDescription({
        No: descriptionsControl.length + 1
      }))
    );
  }

  newDescriptionForm(data: ArtworkDescription) {
    return this.fb.group({
      No: [data.No],
      Description: [data.Description],
      Stitches: [data.Stitches]
    });
  }

  closeVariation(index) {
    let variationsControl = <FormArray>this.form.get('variation');
    variationsControl.removeAt(index);
  }

  saveVariation() {
     this.saveVariations();
  }
  
  addVariation() {
    const variationsControl = <FormArray>this.form.get('variation');
    variationsControl.push(
      this.newVariationForm(new ArtworkVariation({
        itemImage: [this.form.value.featureImage],
        itemImageThumbnail: [this.form.value.thumbnail]
      }))
    );
  }

  newVariationForm(data: ArtworkVariation) {

    const thread_pms = data.design_color_thread_pms.map(
      row => this.newColorThreadPMS(row)
    );
    return this.fb.group({
      design_variation_unique_id: [data.design_variation_unique_id],
      design_variation_title: [data.design_variation_title],
      itemImage: [data.itemImage[0]],
      itemImageThumbnail: [data.itemImageThumbnail[0]],
      design_variation_product: [data.design_variation_product],
      design_variation_color: [data.design_variation_color],
      design_color_thread_pms: this.fb.array(thread_pms),
      design_note: [data.design_note]
    });
  }

  addColorThreadPMS(form: FormGroup) {
    const colorThreadPMS = <FormArray>form.get('design_color_thread_pms');
    colorThreadPMS.push(
      this.newColorThreadPMS(new ColorThread({
        No: colorThreadPMS.length + 1
      }))
    );
  }

  newColorThreadPMS(data: ColorThread) {
    return this.fb.group({
      No: [data.No],
      Color: [data.Color],
      ThreadPMS: [data.ThreadPMS],
      Description: [data.Description]
    });
  }

  toggleEditDescriptions() {
    this.editDescriptions = !this.editDescriptions;
  }

  saveDescriptions() {
    this.artwork.design.update({
      designDescriptionStitches: this.form.value.designDescriptionStitches
    });

    this.loading = true;
    this.api.updateArtwork(this.artwork.toObject())
      .subscribe(() => {
        this.loading = false;
        this.editDescriptions = false;
      }, () => {
        this.loading = false;
      });
  }

  cancelEditDescriptions() {
    this.editDescriptions = false;

    const descriptions = this.artwork.design.designDescriptionStitches
      .map(desc => this.newDescriptionForm(desc));

    this.form.setControl('designDescriptionStitches', this.fb.array(descriptions));
  }

  deleteDescription(i) {
    let designDescriptionStitches = <FormArray>this.form.get('designDescriptionStitches');
    designDescriptionStitches.removeAt(i);
  }

  toggleEditVariations() {
    this.editVariations = !this.editVariations;
  }

  saveVariations() {
    this.artwork.design.update({
      variation: this.form.value.variation.map(v => ({
        ...v,
        itemImage: [v.itemImage]
      }))
    });

    this.loading = true;
    this.api.updateArtwork(this.artwork.toObject())
      .subscribe(() => {
        this.loading = false;
        this.editVariations = false;
      }, () => {
        this.loading = false;
      });
  }

  cancelEditVariations() {
    this.editVariations = false;

    const variations = this.artwork.design.variation
      .map(v => this.newVariationForm(v));

    this.form.setControl('variation', this.fb.array(variations));
  }

  selectDesignType(ev) {
    this.selectedDesignType = find(this.designTypes, { id: ev.value })
    this.form.patchValue({
      designTypeId: this.selectedDesignType.id,
      designTypeName: this.selectedDesignType.name
    });

    this.getDecoVendors();
  }

  selectCustomer(ev) {
    const customer = ev.option.value;
    this.form.patchValue({
      customerId: customer.id,
      customerName: customer.name
    });
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.form.patchValue({
      assignedId: assignee.id,
      assignee: assignee.name
    });
  }

  selectDecoVendor(ev) {
    const vendor = ev.option.value;
    this.form.patchValue({
      decoVendorId: vendor.id,
      decoVendorName: vendor.vendor
    });
  }

  selectArtworkContact(ev) {
    const contact = ev.option.value;
    this.form.patchValue({
      artworkContactId: contact.id,
      artworkContactName: contact.name,
      artworkContactEmail: contact.email
    });
  }


  onFileUploadEventForAws(event) {

    if (event.target.files.length > 0) {
      this.loading = true;
      let file = event.target.files[0];
      const data = new FormData();
      data.append('artworkFile', file);
      data.append("accountId", this.artwork.design.customerId);
      data.append("designNumber", this.artwork.designNo);
      this.api.uploadArtworkToFileManger(data)
        .subscribe((res: any) => {
          this.loading = false;
          this.featureImage = res.url;
          this.thumbnail = res.thumbnail;
          this.form.patchValue({
            featureImage: this.featureImage,
            thumbnail: this.thumbnail
          });
          this.saveInfo();
          //this.artworkdetailscomponent.reloadAwsFiles();
        }, (err => {
          this.loading = false;
        }));



    }

  }

  removeFeaturedImage() {
    if (this.form.invalid) {
      this.showValidation('update');
      return;
    }
    this.form.patchValue({
      featureImage: '',
      thumbnail: ''
    });
    this.saveInfo();
  }

  showPreview(id) {

    this.dialog.open(DesignPreviewPopupComponent, {
      data: id,
      panelClass: 'design-preview-popup'
    });

  }

  changeArtworkStatus(id, name, label) {
    this.loading = true;
    this.form.patchValue({
      statusId: id,
      statusName: name,
      statusLabel: label
    });
    //this.saveInfo();
    this.artwork.update(this.form.value);

    this.api.updateArtwork(this.artwork.toObject())
      .subscribe(() => {
        this.loading = false;
      });

  }

  changeStatus(ev) {
    const status = find(this.statusList.value, { name: ev.value });
    this.form.patchValue({
      statusId: status.id,
      statusName: status.name,
      statusLabel: status.label
    });
  }

  toggleEdit() {
    this.edit = !this.edit;
  }

  saveInfo() {
    if (this.form.invalid) {
      this.showValidation('update');
      //this.msg.show('Please complete the form first', 'error');
      return;
    }
    if(this.artwork.id && this.artwork.designNo !=this.form.value.designNo){

    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });
    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to change the '+this.fieldLabel('designNo', this.fields)+' to '+this.form.value.designNo+', it may break associations with orders and cannot be undone ?';

            confirmDialogRef.afterClosed().subscribe(result => {
              if (result) {
                  this.saveInfoExtended();
              }
            });
    }else{
        this.saveInfoExtended();
    }
    
  }
  saveInfoExtended(){
    this.artwork.update(this.form.value);
    const dtype = find(this.designTypes, { id: this.form.value.designTypeId });
    this.artwork.design.update({
      customerId: this.form.value.customerId,
      customerName: this.form.value.customerName,
      designType: dtype.code,
      location: this.form.value.location,
      name: this.form.value.identity,
      size: this.form.value.size,
      notes: this.form.value.notes,
      stitchCount: this.form.value.detail,
      decoVendorId: this.form.value.decoVendorId,
      decoVendorName: this.form.value.decoVendorName
    });

    if (this.form.value.featureImage) {
      this.artwork.design.designImages = [this.form.value.featureImage];
    } else {
      this.artwork.design.designImages = [];
    }

    this.loading = true;
    this.api.updateArtwork(this.artwork.toObject())
      .subscribe(() => {
        this.loading = false;
      });

    this.edit = false;
  }

  create() {
    
    if (this.form.invalid) {
      this.showValidation('new');
      //this.msg.show('Please complete the form first', 'error');
      return;
    }
    const dtype = find(this.designTypes, { id: this.form.value.designTypeId });

    this.artwork.updateBasics(this.form.value);
    this.artwork.design.update({
      customerId: this.form.value.customerId,
      customerName: this.form.value.customerName,
      designType: dtype.code,
      location: this.form.value.location,
      name: this.form.value.identity,
      size: this.form.value.size,
      notes: this.form.value.notes,
      stitchCount: this.form.value.detail,
      decoVendorId: this.form.value.decoVendorId,
      docoVendorName: this.form.value.decoVendorName
    });

    this.loading = true;
    this.api.createArtwork(this.artwork.toObject())
      .subscribe((res: any) => {
        if (res.status) {
          this.loading = false;
          if (this.embedded) {
            this.afterCreate.emit(res.extra.id);
          } else {
            this.router.navigate(['/artworks', res.extra.id]);
          }
        }
      });                                                                                     
  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.form.get(field).valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(func)
    )
  }

  openOrderDetailDialog() {
      if(this.artwork.relatedOrders[0].orderId){
          if(typeof this.artwork.relatedOrders[0].orderType !=='undefined' && this.artwork.relatedOrders[0].orderType == 'Quote'){
             this.router.navigate(['/e-commerce/quotes', this.artwork.relatedOrders[0].orderId]); 
          }else{
             this.router.navigate(['/e-commerce/orders', this.artwork.relatedOrders[0].orderId]);
          }
          
      }
      
    /*
    this.orderDetailDlgRef = this.dialog.open(OrderDetailDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        orderId: this.artwork.orderId,
        designId: this.artwork.designId,
        showBasicOrderDetails: true,
        showBillingShippingDetails: true,
        showProducts: true,
      }
    });
    */
  }

  openRelatedOrderDetailDialog(orderId) {
    this.orderDetailDlgRef = this.dialog.open(OrderDetailDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        orderId: orderId,
        designId: this.artwork.designId,
        showBasicOrderDetails: true,
        showBillingShippingDetails: true,
        showProducts: true,
      }
    });
  }
  
  GetVariationFilename(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query ? query.split('&') : '';
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return this.GetFilenameFromUrl(params['thumbKey']);
  }

  GetFilenameFromUrl(url) {

    if (url != '') {
      var filename = url.substring(url.lastIndexOf('/') + 1);
      if (filename != '') {
        return filename;
      }
    }

    /*
       if (url)
       {
          var m = url.toString().match(/.*\/(.+?)\./);
          if (m && m.length > 1)
          {
             return m[1];
          }
       }
    */
    return "";

  }

  showValidation(action){
      this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
        panelClass: 'app-form-validation',
        data: {
          action: action,
          moduleForm: this.form,
          fields: this.fields,
          excludeInvalidControls: this.excludeInvalidControls
        }
      });
  
      this.formValidationDlgRef.afterClosed().subscribe(data => {
        if (data) {
          data.invalidControls.forEach((control) => {
            this.form.get(control).markAsTouched();
          });
        }
        this.formValidationDlgRef = null;
      });    
  }
  clearCustomer() {
    this.form.patchValue({
     customerName: '',
     customerId: ''
    });
  }
  clearAssignee() {
    this.form.patchValue({
     assignee: '',
     assignedId: ''
    });
  }

  clearDecoVendor() {
    this.form.patchValue({
     decoVendorName: '',
     decoVendorId: ''
    });
  }

  clearArtworkContact() {
    this.form.patchValue({
     artworkContactName: '',
     artworkContactId: ''
    });
  }
  



    dropVariation(event: CdkDragDrop<any>, dropedOn: any) {
        if (event.previousContainer === event.container) {
          //  moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
        /*
            transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);
                            */

    this.artworkVariation = event.item.data.value;
    this.orderVariation = dropedOn;
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to update this variation to order ?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        //console.log(this.artworkVariation);
        //console.log(this.orderVariation);        

            this.api.updateArtworkVariationToOrder(this.artworkVariation, this.orderVariation).subscribe((res: any) => {
                    if (res.status === 'success') {
                        this.getArtCardDecoDetails(this.artwork.id);
                    }else{
                        this.loading = false;
                    }
            });  

      }
    });
                            
        //this.openUpdateVariationToOrderDialog();

        }
    }
  openUpdateVariationToOrderDialog() {
    this.variationUpdateToOroderDlgRef = this.dialog.open(UpdateArtworkVariationToOrderComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        artworkVariation: this.artworkVariation,
        orderVariation: this.orderVariation,
      }
    });

      this.variationUpdateToOroderDlgRef.afterClosed().subscribe(data => {
        if (data) {
            console.log(data);
        }
        this.variationUpdateToOroderDlgRef = null;
      });    
  }
  revertVariation(data){

    this.orderVariation = data;
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to revert this variation from order ?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
            this.api.revertArtworkVariationFromOrder(this.orderVariation).subscribe((res: any) => {
                    if (res.status === 'success') {
                        this.getArtCardDecoDetails(this.artwork.id);
                    }else{
                        this.loading = false;
                    }
            });  

      }
    });
     
  }
  isRequiredForNewArtwork(field){
      if(this.action === 'edit'){
        return true;
      }else{
        return (this.allowedFieldForNewArtwork.indexOf(field) > -1);
      }
      return true;
  }
}
