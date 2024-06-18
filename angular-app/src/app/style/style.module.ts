import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WrapperComponent } from './wrapper/wrapper.component';

@NgModule({
  declarations: [
    WrapperComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WrapperComponent
  ]
})
export class StyleModule { }
