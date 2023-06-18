import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryMainComponent } from './binary-main.component';

describe('BinaryMainComponent', () => {
  let component: BinaryMainComponent;
  let fixture: ComponentFixture<BinaryMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BinaryMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
