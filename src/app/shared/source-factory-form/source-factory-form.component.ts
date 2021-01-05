import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { SourceFactoryResponseComponent } from '../templates/source-factory-response/source-factory-response.component';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SourceResponseService } from 'app/core/services/source-response.service';
import { MessageService } from 'app/core/services/message.service';
import { map, tap, catchError, last } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpEvent, HttpEventType, HttpClient, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-source-factory-form',
  templateUrl: './source-factory-form.component.html',
  styleUrls: ['./source-factory-form.component.scss']
})
export class SourceFactoryFormComponent implements OnInit {

  sourceForm: any;
  @Input() submission: any = {};
  @Input() source: any = {};
  @Input() vendorId: string = '';
  @Output() onSubmit = new EventEmitter();
  @Output() changed = new EventEmitter();
  @ViewChild(SourceFactoryResponseComponent) documentRef: SourceFactoryResponseComponent;
  loading: boolean;
  success: boolean;
  selectedFiles: any;
  factoryId: any;
  logo: any;
  factoryDetails: any;
  files: Set<File> = new Set();
  progress: any = {};
  submitText: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private msg: MessageService,
  ) { }


  ngOnInit() {
    this.sourceForm = this.createForm();
    this.hydrateSavedImages();

    if (this.sourceForm.get('id').value) {
      this.submitText = 'Update Submission';
    } else {
      this.submitText = 'Submit Response';
    }

    // Sync changes with doc
    this.sourceForm.valueChanges.subscribe((changes) => {
      this.submission = { ...this.submission, ...changes };
      this.changed.emit(this.submission);
    });
  }

  createForm() {

    const quoteValidThrough = this.submission.quoteValidThrough ? new Date(this.submission.quoteValidThrough) : null;
    return this.fb.group({
      id: [this.submission.id],
      sourcingId: [this.submission.sourcingId, Validators.required],
      vendorId: [this.vendorId, Validators.required],
      itemName: [this.submission.itemName, Validators.required],
      itemNumber: [this.submission.itemNumber],
      artCharge: [this.submission.artCharge],
      toolingCharge: [this.submission.toolingCharge],
      toolingTime: [this.submission.toolingTime],
      sampleCost: [this.submission.sampleCost],
      sampleTime: [this.submission.sampleTime],
      productionLeadTime: [this.submission.productionLeadTime],
      packaging: [this.submission.packaging],
      masterCartonWidth: [this.submission.masterCartonWidth],
      masterCartonHeight: [this.submission.masterCartonHeight],
      masterCartonDepth: [this.submission.masterCartonDepth],
      masterCartonWeight: [this.submission.masterCartonWeight],
      fobChinaPort: [this.submission.fobChinaPort],
      factoryTerms: [this.submission.factoryTerms],
      factoryRemarks: [this.submission.factoryRemarks],
      certificates: [this.submission.certificates],
      quoteValidThrough: [quoteValidThrough, Validators.required],

      imagesFromFactory: this.fb.array([]),

      quantity1: [this.submission.quantity1],
      pricePerQty1: [this.submission.pricePerQty1],
      quantity2: [this.submission.quantity2],
      pricePerQty2: [this.submission.pricePerQty2],
      quantity3: [this.submission.quantity3],
      pricePerQty3: [this.submission.pricePerQty3],
      quantity4: [this.submission.quantity4],
      pricePerQty4: [this.submission.pricePerQty4],
      quantity5: [this.submission.quantity5],
      pricePerQty5: [this.submission.pricePerQty5],
    });
  }


  private hydrateSavedImages() {
    if (this.submission && this.submission.imagesFromFactory) {
      this.submission.imagesFromFactory.forEach(url => {
        this.addImageFromFactory(url);
      });
    }
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('sourcingFile', file);
    formData.append('sourcingId', this.source.sourcingId);
    formData.append('accountId', this.source.accountId);

    const request = new HttpRequest(
      'POST',
      '/protected/content/upload-file-to-sourcing-submissions',
      formData,
      { reportProgress: true }
    );

    return this.http.request(request).pipe(
      map(event => this.updateProgress(event, file)),
      tap(message => { console.log('Progress', message); }),
      last(), // return last (completed) message to caller
      catchError(this.handleError)
    );
  }

  handleError(file) {
    console.log('Upload error', file);
    return of(false);
  }

  removeImageFromFactory(index) {
    this.imagesFromFactory.removeAt(index);
  }

  filesSelected(e) {
    this.selectedFiles = e.target.files;

    const files: { [key: string]: File } = e.target.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }

    for (var i = 0; i < e.target.files.length; i++) {
      this.uploadFile(e.target.files[i]).subscribe((res) => console.log('Upload', res));
    }
    e.target.value = '';
  }
  get imagesFromFactory() {
    return this.sourceForm.get('imagesFromFactory') as FormArray;
  }

  addImageFromFactory(url) {
    this.imagesFromFactory.push(this.fb.control(url));
  }

  sendResponse() {
    if (this.sourceForm.invalid) {
      this.msg.show('Please complete the form.', 'error');
      return;
    }
    const formData = this.sourceForm.value;
    const data = { ...this.submission, ...formData };

    this.onSubmit.emit(data);
  }

  private updateProgress(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.Sent:
        this.progress[file.name] = 0;
        return event;

      case HttpEventType.UploadProgress:
        const percentDone = Math.round(100 * event.loaded / event.total);
        this.progress[file.name] = percentDone;
        return event;

      case HttpEventType.Response:
        this.addImageFromFactory(event.body.url);
        this.progress[file.name] = undefined;
        this.files.delete(file);

        return event;

      default:
        return event;
    }
  }

}
