import { DocumentImageManager } from './document-image-manager';
import { IDocument } from './document.interface';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export class DocumentFactory {

    imageManager: DocumentImageManager;

    constructor() {
        this.imageManager = new DocumentImageManager();
    }

    defaultStyles: {
        header: {
            fontSize: 18,
            bold: true
        },
        bigger: {
            fontSize: 15,
            italics: true,
        }
    };

    defaultStyle: {
        fontSize: 10,
        columnGap: 20,
    };

    public create(document: IDocument) {
        return forkJoin([
            this.getDocumentDefinition(document),
            this.loadImages(document),
        ]).pipe(
            map(([definition, images]: [any, any]) => {
                definition.images = this.imageManager.imageMap;
                return of(definition);
            })
        );

        return this.getDocumentDefinition(document).pipe(
            switchMap((definition) => {
                return this.loadImages(document).pipe((images) => {
                    definition.images = images;
                    return of(definition);
                });
            })
        );
    }

    loadImages(document: IDocument) {
        if (typeof document.getImages === 'function') {
            const images = document.getImages();
            return this.imageManager.loadImages(images);
        }
        return of([]);
    }

    getDocumentDefinition(document: IDocument): Observable<any> {
        return Observable.create(observable => {
            const definition: any = {
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    },
                    bigger: {
                        fontSize: 15,
                        italics: true,
                    }
                },
                defaultStyle: {
                    fontSize: 10,
                    columnGap: 20,
                },
                images: this.imageManager.imageMap
            };
            if (document.header) {
                definition.header = document.header();
            }
            if (document.footer) {
                definition.footer = document.footer();
            }
            if (document.content) {
                definition.content = document.content();
            }

            observable.next(definition);
            observable.complete();
        });
    }

}