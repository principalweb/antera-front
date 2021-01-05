import { Component, OnInit, Input,Inject, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { Faq } from 'app/models/faq';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
@Component({
  selector: 'app-faq-form',
  templateUrl: './faq-form.component.html',
  styleUrls: ['./faq-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FaqFormComponent implements OnInit 
{
  // @Input() form: FormGroup;
  dialogTitle: string;
  faqForm: FormGroup;
  action: string;
  faq: Faq;
  imageContent = [];

  constructor(
      public dialogRef: MatDialogRef<FaqFormComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private msg: MessageService,
      private authService: AuthService,
      private api: ApiService
  ) 
  { 
    this.action = data.action;

    if ( this.action === 'edit' )
    {
            this.dialogTitle = 'Edit Question and Answer';
            if(data.faq.imageContent!='' && typeof(data.faq.imageContent)!="object" ){
              this.imageContent = JSON.parse(data.faq.imageContent);            
            }else if(data.faq.imageContent!='' && typeof(data.faq.imageContent)=="object"){
              this.imageContent = data.faq.imageContent;            
            }
            this.faq = data.faq;
    }
    else
    {
        this.dialogTitle = 'New Question';
        this.faq = new Faq();
        this.faq.assignedUser = `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`;
        this.faq.assignedUserId = this.authService.getCurrentUser().userId;
    }
    this.faqForm = this.createFaqForm();
  }

  createFaqForm()
  {
      return this.formBuilder.group({
        id                  : [this.faq.id],
        question            : [this.faq.question],
        answer              : [this.faq.answer],
        link                : [this.faq.link],
        status              : this.action == 'edit' ? [this.faq.status] : 'Pending',
        publish             : this.faq.status=="Approved"?true:false,
        assignedUserId      : [this.faq.assignedUserId],
        assignedUser        : [this.faq.assignedUser]
     });
  }

  ngOnInit() {

  }

  create() {
    if (this.faqForm.invalid) {
        this.msg.show('Please complete the form first', 'error');
        return;
    }
    this.faq.setData(this.faqForm.value);
    this.dialogRef.close(this.faq);
  }
  onSelectedChange(){
    
  }
   fileuploadForAws(event) {

        if(event.target.files.length > 0) {
            let file = event.target.files[0];            
            const data = new FormData();
            data.append('file', file);
            data.append("faqid",this.faq.id);              
            this.api.uploadFaqToFileManger(data)
            .subscribe((res: any) => {
                    console.log(res);
                    if(typeof(res)=="object"){
                      console.log(typeof(res))
                      this.imageContent.push(res);                      
                    }               
                }, (err => {
    
                }));    
        }    
    
      }
  deleteImage(index){
    this.imageContent=this.imageContent.filter((f,i)=>{
      if(index==i){
        return false;
      }
      return f;
    })
    console.log(this.imageContent);
  }
  update() {
    if (this.faqForm.invalid) {
        this.msg.show('Please complete the form first', 'error');
        return;
    }
    let status="Pending";
    if(this.faqForm.value.answer!=''){
      status=this.faqForm.value.publish?'Approved':"Pending"
    }
    this.faq.setData({
        ...this.faqForm.value,
        imageContent:this.imageContent,
        status:status 
    }); 
    this.dialogRef.close(this.faq);
  }
}
