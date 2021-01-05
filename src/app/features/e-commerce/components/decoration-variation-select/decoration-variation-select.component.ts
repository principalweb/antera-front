import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { Design, ArtworkVariation, ColorThread } from 'app/models';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { find } from 'lodash';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-variation-select',
  templateUrl: './decoration-variation-select.component.html',
  styleUrls: ['./decoration-variation-select.component.scss']
})
export class DecorationVariationSelectComponent implements OnInit {

  @Input() data: any = {};
  @Input() parentFolder = '';
  @Input() color = '';
  @Output() onSelect = new EventEmitter();
  @Input() verror = '';

  design: Design;
  variationForms = [];
  editVariations = false;
  designDist = null;
  folderId = '';
  loading = true;
  selectedId = 'None';
  error = '';

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.api.getDesignDetails(this.data.designId)
      .subscribe((res: any) => {
        this.design = new Design(res);

        this.init();
      }, (err) => {
        this.loading = false;
        this.error = 'Error while getting design details';
      });
  }

  init() {
    this.variationForms = this.design.variation.map(v => this.newVariationForm(v));

    if (this.design.variation.length === 0) {
      this.variationForms.push(
        this.newVariationForm(new ArtworkVariation({
          itemImage: [this.design.designImages[0] || ''],
          design_variation_product: this.design.name
        }))
      );
      this.saveVariations();
    }
    this.loading = false;
  }

  addVariation() {
    this.variationForms.push(
      this.newVariationForm(new ArtworkVariation({
        itemImage: [this.design.designImages[0] || ''],
        design_variation_product: this.design.name,
        design_variation_color: this.color
      }))
    );
  }

  newVariationForm(data: ArtworkVariation) {
    const thread_pms = data.design_color_thread_pms.map(
      row => this.newColorThreadPMS(row)
    );
    let itemImage;
    if (data.itemImageThumbnail && data.itemImageThumbnail[0]) {
      itemImage = data.itemImageThumbnail[0];
    } else {
      itemImage = data.itemImage[0];
    }


    return this.fb.group({
      design_variation_unique_id: [data.design_variation_unique_id],
      design_variation_title: [data.design_variation_title],
      itemImage: itemImage,
      itemImageThumbnail:itemImage,
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

  closeVariation(index) {
    this.variationForms.splice(index, 1);
  }
  saveVariation(){
     this.saveVariations();
  }

  toggleEditVariations() {
    this.editVariations = !this.editVariations;
  }

  saveVariations() {
    this.design.variation = this.variationForms.map(vform => 
      new ArtworkVariation({
        ...vform.value,
        itemImage: [vform.value.itemImage]
      })
    );

    this.loading = true;
    this.api.updateDesign(this.design.toObject()).pipe(
      switchMap(() => this.api.getDesignDetails(this.design.id)),
    ).subscribe((design: any) => {
        this.design = new Design(design);
        this.init();

        this.loading = false;
        this.editVariations = false;
      }, (err) => {
        this.error = 'Cannot update variations. Try again.'
        this.loading = false;
    });
  }

  cancelEditVariations() {
    this.editVariations = false;
    this.init();
  }

  select(i, ev) {
    this.selectedId = this.variationForms[i].value.design_variation_unique_id;

    this.onSelect.emit({
      variationId: this.variationForms[i].value.design_variation_unique_id,
      design: this.design
    });
  }
}
