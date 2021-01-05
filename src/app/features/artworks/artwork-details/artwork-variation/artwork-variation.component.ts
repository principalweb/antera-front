import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { ArtworksService } from 'app/core/services/artworks.service';
import { ApiService } from 'app/core/services/api.service';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';

@Component({
  selector: 'app-artwork-variation',
  templateUrl: './artwork-variation.component.html',
  styleUrls: ['./artwork-variation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArtworkVariationComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() index = 0;
  @Input() edit = false;
  @Input() designDistId = '';
  @Input() selectable = false;
  @Input() selected = false;
  @Input() accountId = '';
  @Input() designNumber = '';
  @Input() source = '';

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() add = new EventEmitter();
  @Output() select = new EventEmitter();

  @ViewChild(MatCheckbox) checkbox: MatCheckbox;

  design_color_thread_pms: FormArray;

  displayName = displayName;
  fields = [];
  fieldLabel = fieldLabel;
  requiredField = requiredField;
  visibleField = (type, fields) => {
     const isVisible = visibleField(type, fields);
     return isVisible;
  }
  constructor(private artworks: ArtworksService, private api: ApiService) {
  }

  ngOnInit() {
    this.design_color_thread_pms = <FormArray>this.form.get('design_color_thread_pms');
    const artworkModuleFieldParams = 
    {
        offset: 0,
        limit: 1000,
        order: 'module',
        orient: 'asc',
        term: { module : 'Artwork' }
    }
    this.api.getFieldsList(artworkModuleFieldParams)
        .subscribe((res: any[])=> {
            this.fields = res.map(moduleField => new ModuleField(moduleField));
            },() => {});
    this.getVariationTitle();
    if(this.form.get('design_variation_unique_id').value == ''){
        this.edit = true;
    }
  }

  getVariationTitle() {
    if(!this.form.get('design_variation_title').value){
	    this.form.patchValue({
	      design_variation_title: 'Variation '+ (this.index + 1),
	    });        
    }    
  }
  addColor() {
    this.add.emit();
  }

  deleteColorThreadPMS(i) {
    this.design_color_thread_pms.removeAt(i);
  }

  onClose(){
    this.close.emit();
  }

onExit(){
    this.edit = false;
}
  onSave(){
    this.edit = false;
    this.save.emit();
  }

  fileuploadForAws(event) {

    if(event.target.files.length > 0) {
        let file = event.target.files[0];            
        const data = new FormData();
        data.append('artworkFile', file);
        data.append("accountId", this.accountId); 
        data.append("designNumber", this.designNumber); 
        this.api.uploadArtworkToFileManger(data)
        .subscribe((res: any) => {
                console.log(res);
                const image = res.url;
                const itemImageThumbnail = res.thumbnail;
                this.form.patchValue({
                  itemImage: image,
                  itemImageThumbnail: itemImageThumbnail
                });
            }, (err => {

            }));    
    }    

  }
  
  removeVariationImage() {
    this.form.patchValue({
      itemImage: '',
      itemImageThumbnail:''
    });
  }

  change(ev) {
    if (!ev.checked) {
      this.checkbox.toggle();
    }
    this.select.emit();
  }

  GetVariationFilename(url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query ?  query.split('&') : '';
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return this.GetFilenameFromUrl(params['thumbKey']);
  }

GetFilenameFromUrl(url)
{

    if(url !=''){
        var filename = url.substring(url.lastIndexOf('/')+1);
        if(filename!=''){
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

  editVariation(){
  this.edit = true;
  }
}
