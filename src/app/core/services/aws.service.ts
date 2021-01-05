import {
    Injectable
} from '@angular/core';
//import * as AWS from 'aws-sdk/global';
//import * as S3 from 'aws-sdk/clients/s3';
import {
    Observable
,  BehaviorSubject ,  Subject } from 'rxjs';

import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { findIndex, find } from 'lodash';
import { ApiService } from '../../core/services/api.service';
import { MessageService } from './message.service';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';


@Injectable()
export class AwsFileManagerService {

    FOLDER = 'bmrefactor.anterasoftware.com/';
    NEWFOLDER = '';
    BUCKET = 'sites001.antera';
    ROOT = '';
    isUploading = false;
    id: string;
    name: string;
    type: string;
    url: string;
    icon: string;
    author: string;
    dateCreated: string;
    dateModified: string;
    size: string;
    permission: string;
    assigneeFilter = [];
    params = {
        offset: 0,
        limit: 5,
        path: "",
        orient: "asc",
        term: {
            'name': '',
        }
    }

    constructor(
        private api: ApiService,
        private msg: MessageService,
        private authService: AuthService
    ) {
        const signedUser = this.authService.getCurrentUser();
        this.assigneeFilter.push({
            id: signedUser.userId,
            name: `${signedUser.firstName} ${signedUser.lastName}`
        });    
    }

    private getS3Bucket(): any {
    
    /*
        const bucket = new S3({
            accessKeyId: 'AKIAISQBXDRUKPNQ6GQA',
            secretAccessKey: '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',
            region: 'us-east-1'
        });
*/
        return false;
    }

    uploadfile(file) {
        this.isUploading = true;

        const params = {
            Bucket: this.BUCKET,
            Key: this.FOLDER + '/' + file.name,
            Body: file,
            ACL: 'public-read'
        };

        this.getS3Bucket().upload(params, function(err, data) {

            if (err) {
                console.log('There was an error uploading your file: ', err);
                return false;
            }

            console.log('Successfully uploaded file.', data);
            return true;
        });
    }

    getFiles(params) {        
        const tableData = [];
        this.getS3Bucket().listObjects(params, function(err, data) {
            if (err) {
                console.log('There was an error getting your files: ' + err);
                return;
            }

            console.log('Successfully get files.', data);

            const fileDatas = data.Contents;
            var arr = [ "jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG" ];            
            fileDatas.forEach(function(file) {
                const prefix = params.Prefix + "/";
                if (prefix == file.Key) {
                    return;
                }
                var fileKey = file.Key;
                fileKey = fileKey.replace(prefix, "");
                const count = (fileKey.match(/\//g) || []).length;

                if (count > 1) {
                    return;
                }
                var lastChar = fileKey[fileKey.length - 1];
                if (count == 1 && lastChar != '/') {
                    return;
                }
                const name = fileKey.replace("/", "");
                if (count == 1) {
                    var type = "folder";
                    var icon = "folder";
                } else {
                    var type = "file";
                    var icon = "insert_drive_file";
                }
                const url = file.Key;
                const imgUrl = file.Key;
                var ext = imgUrl.substring(imgUrl.lastIndexOf(".")+1);
                var isImage = false;
		if(arr.indexOf(ext) >= 0){
		    isImage = true;
		}                
                var author = file.Owner.DisplayName;
                if(author == 'mmatos2'){
                    author = 'Antera Support';
                }
                const dateCreated = "";
                const dateModified = file.LastModified;
                const size = file.Size;
                const permission = "";
                const newRow = {
                    id: url,
                    name: name,
                    type: type,
                    isImage: isImage,
                    //url: "https://s3.amazonaws.com/"+params.Bucket+"/"+file.Key,
                    url: "http://bmrefactor.anterasoftware.com/protected/content/preview-file-manager-url?previewKey="+file.Key,
                    icon: icon,
                    author: author,
                    dateCreated: dateCreated,
                    dateModified: dateModified,
                    size: size,
                    permission: permission
                }
                tableData.push(newRow);

            });
        });
        return tableData;
    }

  checkImageUrl(url){
   var arr = [ "jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG" ];
   var ext = url.substring(url.lastIndexOf(".")+1);
   if(arr.indexOf(ext) >= 0){
     return true;
    }
    return false;
  }
}