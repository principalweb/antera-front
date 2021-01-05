import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector     : 'fuse-knowledge-base-article',
    templateUrl  : './article.component.html',
    styleUrls    : ['./article.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseKnowledgeBaseArticleComponent
{
    article: any;
    isPdf = false;
    pdfUrl : any;

    constructor(
        public dialogRef: MatDialogRef<FuseKnowledgeBaseArticleComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private domSantitizer : DomSanitizer,
    )
    {
        if(data.article.isPdf){
            //data.article.content = this.domSantitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/gview?url='+data.article.content+'&embedded=true');
            this.pdfUrl = this.domSantitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/gview?url='+data.article.content+'&embedded=true');;
            this.isPdf = true;
        }
    }
}
