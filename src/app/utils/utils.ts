import { includes, find } from 'lodash';
import { environment } from 'environments/environment';
import { ModuleField } from 'app/models/module-field';


export const displayName = (val: any) => {
    if (!val) {
        return '';
    } else if (typeof val === 'string') {
        return val;
    }

    return val.name;
}

export const priorityValue = p => p ? p.value : '';

export const fx2Str = val => Number(val).toFixed(2);

export const fx2N = n => Math.round(n*100)/100;

export const fx2K = val => {
    if (!val)
        return '0';
    return val > 999 ? (val / 1000).toFixed(1) + 'K' : val;
}

export const checkEmpty = (obj) => {
    if (!obj) return true;
    return Object.keys(obj).reduce( (a,k) => a && obj[k].length === 0, true)
}

export const exportImageUrlForPDF = (url) => {
    if (!url) { 
        return '';
    }
    const whitelist = ['anterasaas.com', 'anterasoftware.com', 'amazonaws.com'];

    if (whitelist.some((match) => url.includes(match))) {
        return url;
    }

    return `${environment.baseUrl}/content/get-image?url=` + url;
}

export const fieldLabel = (val: string, fields: ModuleField[]) => {
    if (!val) {
        return '';
    } 
    const field = find(fields,{fieldName: val});
    if (!field) {
        return '';
    }
    return field.labelName;
}

export const visibleField = (val: string, fields: ModuleField[]) => {
    if (!val) {
        return false;
    } 
    const field = find(fields,{fieldName: val});
    if (!field) {
        return false;
    }
    return field.isVisible;
}

export const requiredField = (val: string, fields: ModuleField[]) => {
    if (!val) {
        return false;
    } 
    const field = find(fields,{fieldName: val});
    if (!field) {
        return false;
    }
    return field.required;
}

export const fieldType = (val: string, fields: ModuleField[]) => {
    if (!val) {
        return false;
    } 
    const field = find(fields,{fieldName: val});
    if (!field) {
        return false;
    }
    return field.fieldType;
}

export function flatten(arr){
    var flatArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array) {
            flatArr = flatArr.concat(flatten(arr[i]));
        } else {
            flatArr.push(arr[i]);
        }
    }
    return flatArr;
}

export const b64toBlob = (b64Data: string, contentType: string, sliceSize: number) => {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
  
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);
  
        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
  
        let byteArray = new Uint8Array(byteNumbers);
  
        byteArrays.push(byteArray);
    }
  
    let blob = new Blob(byteArrays, {type: contentType});
    return blob;
}