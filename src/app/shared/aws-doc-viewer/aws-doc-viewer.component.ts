import { Component, Input, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
@Component({
  selector: 'app-aws-doc-viewer',
  templateUrl: './aws-doc-viewer.component.html',
  styleUrls: ['./aws-doc-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations    
})
export class AwsDocViewerComponent implements OnInit {

  @Input()
  url : string;
  isDoc = false;
  isVideo = false;
  @Input()
  gallary : any;
  @Input()
  previewFileIndex : any;
  fileName : any;
  src : any;
  downloadUrl: any;
  loading = false;
  isRootDir = true;
  loaded = () => {
      this.loading = false;
  };

  constructor(
        private domSantitizer : DomSanitizer,
        public dialogRefPreview: MatDialogRef<AwsDocViewerComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private router: Router,
        private msg: MessageService    
  ) { 
        this.url = data.url;        
        this.isDoc = data.isDoc;
        this.gallary = data.gallary;
        this.previewFileIndex = data.previewFileIndex;
        this.fileName = this.gallary[this.previewFileIndex].name;  
        this.downloadUrl = this.gallary[this.previewFileIndex].downloadUrl;
        console.log('downloadUrl ' + this.downloadUrl);
  }

  ngOnInit() {
      
      if(this.checkImageUrl(this.gallary[this.previewFileIndex].url)){
         this.isDoc = false;
         this.isVideo = false;
         this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.gallary[this.previewFileIndex].thumbnail + '&width=600');         
      }else if(this.checkVideoUrl(this.gallary[this.previewFileIndex].url)){
         this.isDoc = false;
         this.isVideo = true;
         this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.gallary[this.previewFileIndex].thumbnail + '&width=600');         
      }else{
         this.isDoc = true;
         this.isVideo = false;
         this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.url);
      }       
  }
  preview(){
      this.loading  = true;            
      this.fileName = this.gallary[this.previewFileIndex].name;
      this.url = this.gallary[this.previewFileIndex].url;
      this.downloadUrl = this.gallary[this.previewFileIndex].downloadUrl;
      //this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.url);
      this.loading  = false;
      if(this.checkImageUrl(this.gallary[this.previewFileIndex].url)){
         this.isDoc = false;
         this.isVideo = false;
         this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.gallary[this.previewFileIndex].thumbnail + '&width=600');
      }else if(this.checkVideoUrl(this.gallary[this.previewFileIndex].url)){
         this.isDoc = false;
         this.isVideo = true;
         this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.gallary[this.previewFileIndex].thumbnail + '&width=600');         
      }else{
         this.isDoc = true;
         this.isVideo = false;
         document.querySelector('iframe').src = "https://docs.google.com/gview?url="+encodeURIComponent(this.url)+"&embedded=true";
      }
        
  }
  prev(){
        this.previewFileIndex--;      
        this.preview();
  }
  
  next(){
        this.previewFileIndex++;      
        this.preview();
  }

  checkImageUrl(url){
   var arr = [ "jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG", "svg", "SVG", "ai", "AI", "eps", "EPS", "dst", "DST", "cdr", "CDR", "AFF", "aff", "CCX", "ccx", "CDT", "cdt", "CGM", "cgm", "CMX", "cmx", "DXF", "dxf", "EXP", "exp", "FIG", "fig", "PCS", "pcs", "PES", "pes", "PLT", "plt", "SK", "sk", "SK1", "sk1", "WMF", "wmf", "PSD", "psd" ];
   var ext = url.substring(url.lastIndexOf(".")+1);
   if(arr.indexOf(ext) >= 0){
     return true;
    }
    return false;
  }

  checkVideoUrl(url){
   var arr = [ "mp4", "MP4" ];
   var ext = url.substring(url.lastIndexOf(".")+1);
   if(arr.indexOf(ext) >= 0){
     return true;
    }
    return false;
  }
}
