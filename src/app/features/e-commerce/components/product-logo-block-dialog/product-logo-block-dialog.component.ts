import { Component, OnInit, ViewEncapsulation, Inject, Renderer2, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductDetails } from 'app/models';
import { ApiService } from 'app/core/services/api.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import * as d3 from 'd3';
import { select } from '@ngrx/store';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';


function responsivefy(svg) {
  // get container + svg aspect ratio
  const container = d3.select(svg.node().parentNode);
  const width = parseInt(svg.style('width'));
  const height = parseInt(svg.style('height'));
  const aspect = width / height;
  //console.log('Image height', height, 'Image Width', width);
  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid')
    .call(resize);

  // to register multiple listeners for same event type, 
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on('resize.' + container.attr('id'), resize);

  // get width of container and resize svg to fit it
  function resize() {
    const targetWidth = parseInt(container.style('width'));
    //console.log('target Height',  Math.round(targetWidth / aspect), 'Image Width', targetWidth);
    svg.attr('width', targetWidth);
    svg.attr('height', Math.round(targetWidth / aspect));
  }
}

function bbox() {
  // All those are initialized to default further down using the setters.
  let xextent = null;
  let yextent = null;
  let handlesize = null;
  let dirs = null;
  let curs = null;
  const cbs = {
    dragstart: null,
    dragmove: null,
    dragend: null,
    resizestart: null,
    resizemove: null,
    resizeend: null
  };

  function my(selection) {
    const drag = d3.drag()
      .subject(function (d) { return d == null ? { x: this.getAttribute('x'), y: this.getAttribute('y') } : d; })
      .on('drag', dragmove)
      .on('start', dragstart)
      .on('end', dragend);
    selection.call(drag);
    selection.on('mousemove.lbbbox', move);
    selection.on('mouseleave.lbbbox', leave);

    return selection;
  }

  function clamp(x, extent) { return Math.max(extent[0], Math.min(x, extent[1])); }
  function inside(x, extent) { return extent[0] < x && x < extent[1]; }

  // Will return w, nw, n, ne, e, se, s, sw for the eight borders,
  // M for inside, or "" when current location not in `dirs`.
  function whichborder(xy, elem) {
    let border = '';
    const x = +elem.getAttribute('x');
    const y = +elem.getAttribute('y');
    const w = +elem.getAttribute('width');
    const h = +elem.getAttribute('height');

    if (xy[1] < y + handlesize.n) { border += 'n'; }
    else if (xy[1] > y + h - handlesize.s) { border += 's'; }

    if (xy[0] < x + handlesize.w) { border += 'w'; }
    else if (xy[0] > x + w - handlesize.e) { border += 'e'; }


    if (border === '' && (dirs.indexOf('x') > -1 || dirs.indexOf('y') > -1)) {
      border = 'M';
    }
    else if (dirs.indexOf(border) === -1) {
      border = '';
    }

    return border;
  }

  function move(d, i) {
    // Don't do anything if we're currently dragging.
    // Otherwise, the cursor might jump horribly!
    // Also don't do anything if no cursors.
    if (this.__resize_action__ !== undefined || !curs) {
      return;
    }

    const b = whichborder(d3.mouse(this), this);

    const x = dirs.indexOf('x');
    const y = dirs.indexOf('y');
    // Bwahahahaha this works even when one is at index 0.
    if (b == 'M' && 1 / (x * y) < 0) {
      document.body.style.cursor = x >= 0 ? curs.x : curs.y;
    }
    else {
      document.body.style.cursor = curs[b] || null;
    }
  }

  function leave(d, i) {
    // Only unset cursor if we're not dragging,
    // otherwise we get horrible cursor-flipping action.
    // Also only unset it if we actually did set it!
    if (this.__resize_action__ === undefined && curs) {
      document.body.style.cursor = null;
    }
  }

  function dragstart(d, i) {
    this.__resize_action__ = whichborder(d3.mouse(this), this);
    this.__ow__ = +this.getAttribute('width');
    this.__oh__ = +this.getAttribute('height');

    if (this.__resize_action__ == 'M') {
      if (cbs.dragstart) { cbs.dragstart.call(this, d, i); }
    } else if (this.__resize_action__.length) {
      if (cbs.resizestart) { cbs.resizestart.call(this, d, i); }
    }
  }

  function dragend(d, i) {
    if (this.__resize_action__ == 'M') {
      if (cbs.dragend) { cbs.dragend.call(this, d, i); }
    } else if (this.__resize_action__.length) {
      if (cbs.resizeend) { cbs.resizeend.call(this, d, i); }
    }

    delete this.__resize_action__;
    delete this.__ow__;
    delete this.__oh__;

    // Still need to unset here, in case the user stop dragging
    // while the mouse isn't on the element anymore (e.g. off-limits).
    if (curs) {
      document.body.style.cursor = null;
    }
  }

  function dragmove(d, i) {
    if (this.__resize_action__ == 'M') {
      if (cbs.dragmove) {
        if (false === cbs.dragmove.call(this, d, i)) {
          return;
        }
      }
    } else if (this.__resize_action__.length) {
      if (cbs.resizemove) {
        if (false === cbs.resizemove.call(this, d, i)) {
          return;
        }
      }
    }

    // Potentially dynamically determine the allowed space.
    const xext = typeof xextent === 'function' ? xextent.call(this, d, i) : xextent;
    const yext = typeof yextent === 'function' ? yextent.call(this, d, i) : yextent;

    // Handle moving around first, more easily.
    if (this.__resize_action__ == 'M') {
      if (dirs.indexOf('x') > -1 && d3.event.dx != 0) {
        // This is so that even moving the mouse super-fast, this still "sticks" to the extent.
        const newX = clamp(clamp(d3.event.x, xext) + this.__ow__, xext) - this.__ow__;
        console.log(newX);
        this.setAttribute('x', newX);
      }
      if (dirs.indexOf('y') > -1 && d3.event.dy != 0) {
        const newY = clamp(clamp(d3.event.y, yext) + this.__oh__, yext) - this.__oh__;
        // console.log(newY);
        this.setAttribute('y', newY);
      }
      // Now check for all possible resizes.
    } else {
      const x = +this.getAttribute('x');
      const y = +this.getAttribute('y');

      // First, check for vertical resizes,
      if (/^n/.test(this.__resize_action__)) {
        const b = y + +this.getAttribute('height');
        const newy = clamp(clamp(d3.event.y, yext), [-Infinity, b - 1]);
        this.setAttribute('y', newy);
        this.setAttribute('height', b - newy);
      //  console.log(newy,b - newy,b);
        } else if (/^s/.test(this.__resize_action__)) {
        const b = clamp(d3.event.y + this.__oh__, yext);
        this.setAttribute('height', clamp(b - y, [1, Infinity]));
        // console.log(b);
      }

      // and then for horizontal ones. Note both may happen.
      if (/w$/.test(this.__resize_action__)) {
        const r = x + +this.getAttribute('width');
        const newx = clamp(clamp(d3.event.x, xext), [-Infinity, r - 1]);
        this.setAttribute('x', newx);
        this.setAttribute('width', r - newx);
      //  console.log(newx,r - newx,r);
      } else if (/e$/.test(this.__resize_action__)) {
        const r = clamp(d3.event.x + this.__ow__, xext);
        this.setAttribute('width', clamp(r - x, [1, Infinity]));
        // console.log(r);
      }
    }
  }




  // @ts-ignore
  my.xextent = function (_) {
    if (!arguments.length) { return xextent; }
    xextent = _ !== false ? _ : [-Infinity, +Infinity];
    return my;
  };
  // @ts-ignore
  my.xextent(false);

  // @ts-ignore
  my.yextent = function (_) {
    if (!arguments.length) { return yextent; }
    yextent = _ !== false ? _ : [-Infinity, +Infinity];
    return my;
  };
  // @ts-ignore
  my.yextent(false);

  // @ts-ignore
  my.handlesize = function (_) {
    if (!arguments.length) { return handlesize; }
    handlesize = !+_ ? _ : { 'w': _, 'n': _, 'e': _, 's': _ };  // coolface
    return my;
  };
  // @ts-ignore
  my.handlesize(3);

  // @ts-ignore
  my.cursors = function (_) {
    if (!arguments.length) { return curs; }
    curs = _ !== true ? _ : {
      M: 'move',
      x: 'col-resize',
      y: 'row-resize',
      n: 'n-resize',
      e: 'e-resize',
      s: 's-resize',
      w: 'w-resize',
      nw: 'nw-resize',
      ne: 'ne-resize',
      se: 'se-resize',
      sw: 'sw-resize'
    };
    return my;
  };
  // @ts-ignore
  my.cursors(true);

  // @ts-ignore
  my.directions = function (_) {
    if (!arguments.length) { return dirs; }
    dirs = _ !== true ? _ : ['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw', 'x', 'y'];
    return my;
  };
  // @ts-ignore
  my.directions(true);

  // @ts-ignore
  my.on = function (name, cb) {
    if (cb === undefined) { return cbs[name]; }
    cbs[name] = cb;
    return my;
  };

  // @ts-ignore
  my.infect = function (selection) {
    selection.call(my);
    return my;
  };

  // @ts-ignore
  my.disinfect = function (selection) {
    selection.on('.drag', null);
    selection.on('.lbbbox', null);
    return my;
  };

  return my;
}

@Component({
  selector: 'app-product-logo-block-dialog',
  templateUrl: './product-logo-block-dialog.component.html',
  styleUrls: ['./product-logo-block-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductLogoBlockDialogComponent implements OnInit, AfterViewInit {
  imageIndex: number;
  product: ProductDetails;
  logoBlockDetails: Object;
  logoBlockMap: any;
  @ViewChild('editorOverlay') editorOverlay: ElementRef;
  @ViewChild('editor') editor: ElementRef;
  selectedImageUrl: any;
  dragBehavior: any;
  resizedImageUrl: any;
  designLocations: Object;
  designLocationId: any;
  selectedBlockIndex: any;
  primarySelected: boolean;
  imageDimensions: { height: number; width: number; };

  constructor(
    public dialogRef: MatDialogRef<ProductLogoBlockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private msg: MessageService,
  ) { }

  ngOnInit() {
    this.imageIndex = this.data.imageIndex;
    this.product = this.data.product;
//    this.resizedImageUrl =  this.resizeUrlImage(this.product.MediaContent[this.imageIndex].url);
   // console.log(this.resizedImageUrl);
    this.api.getDesignLocations().subscribe((res) => {
      this.designLocations = res;
    });

    this.api.getProductLogoDetails(this.product.id).subscribe((res: any[]) => {
      this.logoBlockDetails = res;
      this.logoBlockMap = res.reduce((results, item, index) => {
        if (!results[item.image]) {
          results[item.image] = item;
        }
        return results;
      }, {});
      if (this.imageIndex > -1) {
        //this.selectedImageUrl = this.resizedImageUrl;
        //this.product.MediaContent[this.imageIndex].url = this.resizedImageUrl;
        this.selectedImageUrl = this.product.MediaContent[this.imageIndex].url;
      }
      this.resetRectangles();
      this.cd.markForCheck();
    });
  }

  resizeUrlImage(url) {
    const operations = encodeURI(JSON.stringify([
      {
          'operation': 'resize',
          'params': {
              'width': 800,
              'height':800,
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
    let proxiedSrc = `https://h4x0rt3hp74n37L4vv7.anterasaas.com/api/v1/imaginary/pipeline?url=${encodeURIComponent(url)}&operations=${operations}`;
    return proxiedSrc;
  }
  getImageDimensions(event) {
     const expected = 800;
    // let finalHeight = expected;
    // let finalWidth = expected;
    // console.log('Getting image dimensions', event);
    const img: HTMLImageElement = event.currentTarget;
    if (img.naturalWidth) {
      const orgHeight = img.naturalHeight;
      const orgWidth = img.naturalWidth;
      //let proportion=(expected*100)/orgWidth;
      let proportion=orgWidth/orgHeight;
      if(orgWidth > expected || orgHeight > expected) {
       
        if(orgWidth > orgHeight) {
          proportion=orgHeight/orgWidth;
          // let p = (expected*100)/orgWidth;
          // let h = Math.round((orgHeight*p)/100);
          // if(proportion > 0.72) {
          //   this.dialogRef.updateSize('900px',h+'px');
          // } else {
          //   this.dialogRef.updateSize('800px',h+'px');
          // }
        } 
        // else {
          if(proportion > 0.72) {
            this.dialogRef.updateSize('900px','auto');
          } else {
            this.dialogRef.updateSize('800px','auto');
          }
        // }
        
        console.log('Getting image scale', proportion);
      //   if (orgWidth > expected && orgHeight < expected){//too wide, height is OK
      //       finalWidth = expected;
      //       finalHeight=Math.round((orgHeight*proportion)/100);
      //   }
      //   else if (orgWidth<=expected && orgHeight>expected){//too high, width is OK
      //     proportion=(expected*100)/orgHeight;
      //     finalHeight=expected;
      //     finalWidth=Math.round((orgWidth*proportion)/100);
      //   } else {//too high and too wide
      //     if (orgWidth/expected > orgHeight/expected){//width is the bigger problem
      //         proportion=(expected*100)/orgWidth;
      //         finalWidth=expected;
      //         finalHeight=Math.round((orgHeight*proportion)/100);
      //     } else {//height is the bigger problem
      //         proportion=(expected*100)/orgHeight;
      //         finalHeight=expected;
      //         finalWidth=Math.round((orgWidth*proportion)/100);
      //     }
      //   }
      // } else {
      //   finalHeight = orgHeight;
      //   finalWidth = orgWidth;
      }
      // this.imageDimensions =  {
      //   height: finalHeight,
      //   width: finalWidth,
      // };
       this.imageDimensions =  {
         height: img.naturalHeight,
         width: img.naturalWidth,
       };
     // console.log('Image dimensions', img.height,img.width);
      console.log('Image dimensions 800', this.imageDimensions);
      
    } else {
      //this.dialogRef.updateSize('100vw','auto');
      this.imageDimensions =  {
        height: img.height,
        width: img.width,
      };
      //console.log('Image dimensions', this.imageDimensions);
    }
    console.log('Image dimensions', this.imageDimensions);
  }

  addBlock() {
    if (this.selectedImageUrl && this.logoBlockMap[this.selectedImageUrl]) {
      const primary = this.logoBlockMap[this.selectedImageUrl];

      if (!this.imageDimensions) {
        this.imageDimensions = {
          height: 600,
          width: 600
        };
      }

      const data = {
        'logo': '',
        'type': 0,
        'x': 150,
        'y': 150,
        'w': 100,
        'h': 50,
        'o': 1,
        'location': null,
        'ih': this.imageDimensions.height,
        'iw': this.imageDimensions.width,
      };

      primary.extra_logo.push(data);
    } else {
      const data = {
        'image': this.selectedImageUrl,
        'extra_logo': [],
        'logo': '',
        'type': 0,
        'x': 150,
        'y': 150,
        'w': 100,
        'h': 50,
        'o': 1,
        'location': null,
        'ih': this.imageDimensions.height,
        'iw': this.imageDimensions.width,
      };

      this.logoBlockMap[this.selectedImageUrl] = data;
    }

    this.resetRectangles();
    this.cd.markForCheck();
  }

  removeBlock(i, child = false) {
    const selected = this.logoBlockMap[this.selectedImageUrl];
    if (child) {
      selected.extra_logo.splice(i, 1);
    } else {

      // Extra handling to promote the extra logo when removing the main block
      if (selected.extra_logo && selected.extra_logo.length) {
        const promoted = selected.extra_logo.shift();
        selected.x = promoted.x;
        selected.y = promoted.y;
        selected.h = promoted.w;
        selected.location = promoted.location;
      } else {
        delete this.logoBlockMap[this.selectedImageUrl];
      }
    }
    this.resetRectangles();
    this.cd.markForCheck();
  }

  updateLocation(event, i) {
    if (typeof i === 'undefined') {
      this.logoBlockMap[this.selectedImageUrl].location = event.value;
    } else {
      this.logoBlockMap[this.selectedImageUrl].extra_logo[i].location = event.value;
    }
   // this.locationSelected(event);
  }
  locationSelected(): void {
    //const location = event.value;
    
    
    if (!this.product.id){
        this.product.LocationArray.Location = [];
    }
    //const pLoc = this.product.LocationArray.Location.find(loc => loc.locationId ==  this.designLocationId);
    //if (pLoc && pLoc.locationId) {
    //  return;
   // }
   //this.product.LocationArray.Location = [];
    this.api.getProductDecorationLocations(this.product.id).subscribe((res) => {
//      console.log(res);
      this.product.LocationArray.Location.length = 0;
      this.product.LocationArray.Location.push.apply(this.product.LocationArray.Location,res);
      //this.product.LocationArray = res;
      // this.product.LocationArray.Location.push({
      //   locationName: location,
      //   locationId: this.designLocationId,
      //   source: 0,
      //   defaultLocation: '0',
      //   id: '',
      //   locationRank: '1',
      //   maxDecoration: '',
      //   minDecoration: '',
      //   sourceId: ""
      // });

    });
     
    //console.log('this.product.LocationArray.Location',location,this.designLocationId);
    console.log(this.product.LocationArray.Location);
      // if (this.locationInput){
      //     this.locationInput.nativeElement.value = '';
      // }
  }

  save() {
    const data = Object.keys(this.logoBlockMap).map((key) => {
      return {
        ...this.logoBlockMap[key],
      };
    });
//console.log(data);
    this.api.setProductLogoDetails(this.product.id, data).subscribe((res) => {
      this.locationSelected();
      this.dialogRef.close('saved');
    });
  }

  responsify() {
    const element = this.editorOverlay.nativeElement;
    d3.select(element)
      .call(responsivefy);
  }

  ngAfterViewInit(): void {
    const component = this;

    const updateComponentForm = (el) => {

      const extraIndex = el.getAttribute('data-index');

      if (!extraIndex) {
        // Update the main block for this image
        // Update logo block
        const data = {
          ...this.logoBlockMap[this.selectedImageUrl],
          x: el.getAttribute('x'),
          y: el.getAttribute('y'),
          w: el.getAttribute('width'),
          h: el.getAttribute('height'),
        };
console.log(data);
        this.logoBlockMap[this.selectedImageUrl] = data;
        
      } else {
        const data = {
          ...this.logoBlockMap[this.selectedImageUrl].extra_logo[extraIndex],
          x: el.getAttribute('x'),
          y: el.getAttribute('y'),
          w: el.getAttribute('width'),
          h: el.getAttribute('height'),
        };
        
        this.logoBlockMap[this.selectedImageUrl].extra_logo[extraIndex] = data;
      }
    };

    const minX = 10;
    const maxX = 300;

    this.dragBehavior = bbox()
      // @ts-ignore
      .xextent([minX, maxX])
      // @ts-ignore
      .yextent([10, 450])
      // @ts-ignore
      .on('dragstart', function (a, b, c) {
        const index = this.getAttribute('data-index');

        this.parentNode.childNodes.forEach(node => {
          component.renderer.removeClass(node, 'active');
        });

        component.renderer.addClass(this, 'active');


        if (!index) {
          component.primarySelected = true;
        } else {
          component.primarySelected = false;
          component.selectedBlockIndex = index;
        }
        component.cd.markForCheck();
      })
      // @ts-ignore
      .on('dragend', function (el, d, i) {
        updateComponentForm(this);
      })
      // @ts-ignore
      .on('resizeend', function (el, d, i) {
        updateComponentForm(this);
      });
  }

  reset() {
    d3.selectAll('rect').call(this.dragBehavior);
  }

  next() {
    if (this.imageIndex === this.product.MediaContent.length - 1) {
      this.imageIndex = 0;
    } else {
      this.imageIndex++;
    }
    //this.selectedImageUrl = this.resizeUrlImage(this.product.MediaContent[this.imageIndex].url);
    this.selectedImageUrl = this.product.MediaContent[this.imageIndex].url;
    this.resetRectangles();
  }

  previous() {
    if (this.imageIndex === 0) {
      this.imageIndex = 0;
      this.imageIndex = this.product.MediaContent.length - 1;
    } else {
      this.imageIndex--;
    }
    //this.selectedImageUrl = this.resizeUrlImage(this.product.MediaContent[this.imageIndex].url);
    this.selectedImageUrl = this.product.MediaContent[this.imageIndex].url;
    this.resetRectangles();
  }

  resetSelection() {
    this.primarySelected = false;
    this.selectedBlockIndex = undefined;
  }

  resetRectangles() {
    const selectedBlock = this.logoBlockMap[this.selectedImageUrl];
    const svg = this.editorOverlay.nativeElement;
    this.resetSelection();

    // Clear svg
    const childElements = svg.childNodes;
    for (const child of childElements) {
      this.renderer.removeChild(svg, child);
    }

    if (selectedBlock) {
      const width = selectedBlock.iw;
      const height = selectedBlock.ih;

      // Update drag constraints

      // @ts-ignore
      this.dragBehavior.xextent([0, width]);
      // @ts-ignore
      this.dragBehavior.yextent([0, height]);

      let rect = this.renderer.createElement('rect', 'svg');
      rect.setAttribute('x', selectedBlock.x);
      rect.setAttribute('y', selectedBlock.y);
      rect.setAttribute('width', selectedBlock.w);
      rect.setAttribute('height', selectedBlock.h);
      rect.setAttribute('fill', 'red');

      this.renderer.appendChild(svg, rect);

      if (selectedBlock.extra_logo.length) {

        svg.setAttribute('data-width', selectedBlock.iw);
        svg.setAttribute('data-height', selectedBlock.ih);
        selectedBlock.extra_logo.forEach((extra, idx) => {
          rect = this.renderer.createElement('rect', 'svg');
          rect.setAttribute('x', extra.x);
          rect.setAttribute('y', extra.y);
          rect.setAttribute('width', extra.w);
          rect.setAttribute('height', extra.h);
          rect.setAttribute('fill', 'red');
          rect.setAttribute('data-index', idx);
          this.renderer.appendChild(svg, rect);
        });
      }
      // this.responsify();
      this.reset();
    }
  }

  applyToAll() {
    // TODO: Show additional screen to select images to apply to...

    // Get selected block

  const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you would replace blocks on all images?';

    confirmDialogRef.afterClosed().subscribe(result => {

      const selectedBlock = this.logoBlockMap[this.selectedImageUrl];

      // NOTE needs to match by location
      if (selectedBlock) {
          const keys = Object.keys(this.logoBlockMap).filter((key) => key !== this.selectedImageUrl);
          // Iterate through all blocks and replace with source 
          keys.forEach((key) => {
            const item = this.logoBlockMap[key];
            item.x = selectedBlock.x;
            item.y = selectedBlock.y;
            item.w = selectedBlock.w;
            item.h = selectedBlock.h;
            item.location = selectedBlock.location;
            item.extra_logo = [...selectedBlock.extra_logo];
          });
          this.msg.show('Logo blocks replaced on images.', 'success');
      }
    });

  }
}
