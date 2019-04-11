import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBzLayerComponent } from './load-bz-layer.component';

describe('LoadBzLayerComponent', () => {
  let component: LoadBzLayerComponent;
  let fixture: ComponentFixture<LoadBzLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadBzLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadBzLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
