import { Observable, from, of, forkJoin } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';


export interface DocumentImageThumbnail {
    src: string;
    width: string;
}

export class DocumentImageManager {
    imageMap: any = {};
    pipeline: Observable<any>;

    constructor() {
        this.setPlaceholder();
        this.setLocationPlaceholder();
    }

    public setPlaceholder() {
        this.imageMap['placeholder'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAytJREFUeNrsmctPE1EUxjvNkFha+tr0xULazp1p1WiIxPgnmOjGFy5cuIBYkQUhmhgTjS7cuTAxGo1x58aFO0OIGhcaFxpjdCGdR1GEtkhFaLFYWwr4QWOtKS2FGZm76FncpL2Z29+cc+45371llpeXDfSZ0UClNbGaWDVtdja9sLCw6cdZrTgWFxfHvoyLkiyKsijLMzOzZnPrhfOD4ZCwidUYNQUil8uJkiIpiggcZTSfz5enTKZtudyvXTvDVy5d3ApvTU9/HwGFpIBkfCK+tLRUnvJ6PQJPQjzhCWezWU/1nJHkWLFYZFlWe6xSdOANcERFCdEpT7W0tHDBACAQKZ4ErVZr5YPtPt9EPP7p8xjhgtpgFQoFEEQlGV5RYjGEozxlsViAIPDcCkjAD7JaSwsCARZW0AYrkUhevnotncn8jY7HTQgHjwDF5/UwDNPI0gLhnj57HpWkQwcPaIA1NPwETO3tvs49u8HB85zdZttE2uJZjAi9NilvMpkw7t/XdeL4UTUlw+122e22dDozOfnV43GrxSIkWOct373/cPvOPVTLxn+jf+Bc9ZcOh70v0ouANFrlkRMYZSWGPVg9u1GmOm0AS23AW9jnqEDJ5CTqQsDfUb0cxkcPH6jEOtJ9ss7rGetlqygbdLK1sUKrWNjbdGGp2dv/EQv7GRmG2KdS3yjCQh0v7Ue9HFZTBqK4r6SXKNGFhQ6IEcKBLix/x3aoAyiq+fmfFGGBCboF2hXShq4jBl/Kej3Sqx5WSChVL+q8RVApYqOja/Zs3bDa2izo2fl8AXocH6emUi9evtoaLHZdhQkN/Xho+ONIVBM9o82putSz0YLAhHbUtbeTFm+thC+VunnjundV+EIn6e+tUs/OZOaMRmYrU3794yvKxOs3b1Em3C5XpbbU+cZGF+21vrf+1Pp/sDTR8qqwcMpAf4wnEtlsNp2Zo8VbLMsSLoi6FekfqLyM0Dm3YN3HDpvNrWDCmZMWb8F2hEP37976kc06HQ4q6lal/AITRTux+u4AjUgTn9ntNrXeKlvf6Z46yzVuTqfjbKS31izT/M+nidXEosB+CzAAzFNSxLde2rIAAAAASUVORK5CYII=';
    }

    public setLocationPlaceholder() {
        this.imageMap['locationPlaceholder'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAADaCAIAAABcqIt4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUJGNTU3OEIzMjAwMTFFQTg0MTBGMTRGM0Y5NjRDRkYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUJGNTU3OEMzMjAwMTFFQTg0MTBGMTRGM0Y5NjRDRkYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QkY1NTc4OTMyMDAxMUVBODQxMEYxNEYzRjk2NENGRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QkY1NTc4QTMyMDAxMUVBODQxMEYxNEYzRjk2NENGRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqBqWBEAAAlnSURBVHja7J37UhpJ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';
    }
    
    public loadImages(images: DocumentImageThumbnail[]) {
        this.setPlaceholder();
        this.setLocationPlaceholder();
        const imagesToLoad = images
            .filter((image, index, self) => self.indexOf(image) === index)
            .filter((image) => !this.imageMap.hasOwnProperty(image.src))
            .map((image: DocumentImageThumbnail) => this.loadImage(image));
        return forkJoin(imagesToLoad);
    }

    private loadImage(image: DocumentImageThumbnail): Observable<any> {
        const operations = encodeURI(JSON.stringify([
            {
                'operation': 'thumbnail',
                'params': {
                    'width': image.width ? image.width : 100,
                    'background': '255,255,255',
                    'type': 'jpeg',
                    'quality': 100,
                    
                }
            },
            {
                'operation': 'convert',
                'params': {
                    'type': 'jpeg',
                    'quality': 100,
                }
            }
        ]));
        // Proxy external requests to imaginary thumbnail pipeline
        let proxiedSrc = image.src;
        let noImageAvail = 'https://s3.amazonaws.com/images.anterasoftware.com/no-image-avail.png';
        const whitelist = [
            'anterasaas.com',
            'thumbKey',
            'previewKey',
            //'anterasoftware.com',
            // 'api.asicentral',
            // 'media.asicdn.com',
        ];

        const whitelisted = whitelist.some((host) => {
            return image.src.indexOf(host) !== -1;
        });

        if (!whitelisted) {
            if(proxiedSrc.startsWith('/protected/content/')){            
                proxiedSrc = image.src;
            }else if(image.src.indexOf('anteracloud') > 0 && image.src.indexOf('alfresco') > 0){
                proxiedSrc = `https://h4x0rt3hp74n37L4vv7.anterasaas.com/api/v1/imaginary/pipeline?url=${encodeURIComponent(noImageAvail)}&operations=${operations}`;
            }else{
                proxiedSrc = `https://h4x0rt3hp74n37L4vv7.anterasaas.com/api/v1/imaginary/pipeline?url=${encodeURIComponent(image.src)}&operations=${operations}`;
            }
                //console.log(proxiedSrc);
        } else {

            // Force mimic png extension 
            if (!proxiedSrc.endsWith('.png')) {
                proxiedSrc = proxiedSrc + '&type=.png';
            }
        }

        // Ensure https
        proxiedSrc = proxiedSrc.replace('http:', 'https:');

        return from(fetch(proxiedSrc, { mode: 'cors' })).pipe(
            switchMap((res) => from(res.blob())),
            switchMap((_blob: Blob) => {
                return Observable.create(observable => {
                    if (_blob.type.indexOf('image') === -1 || _blob.size === 0) {
                        observable.throwError('Invalid image type');
                    }
                    const reader = new FileReader();
                    reader.addEventListener('load', function () {
                        observable.next(reader.result);
                        observable.complete();
                    }, false);
                    reader.onerror = (err) => {
                        return observable.throwError(err);
                    };
                    reader.readAsDataURL(_blob);
                });
            }),
            tap((base64Image) => {
                this.imageMap[image.src] = base64Image;
            }),
            catchError((err) => {
                proxiedSrc
                  var n = proxiedSrc.includes("/locations/");
                  if(n){
                    this.imageMap[image.src] = this.imageMap['locationPlaceholder'];  
                  }else{
                    this.imageMap[image.src] = this.imageMap['placeholder'];  
                  }
                // Could not fetch image, apply placeholder image instead
                
                return of(false);
            }));
    }
}
