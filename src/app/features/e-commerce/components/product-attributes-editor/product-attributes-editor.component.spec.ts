import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAttributesEditorComponent } from './product-attributes-editor.component';

describe('ProductAttributesEditorComponent', () => {
  let component: ProductAttributesEditorComponent;
  let fixture: ComponentFixture<ProductAttributesEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductAttributesEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAttributesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
