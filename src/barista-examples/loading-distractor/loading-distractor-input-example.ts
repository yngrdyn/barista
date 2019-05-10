import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  template: `
    <dt-form-field>
      <input type="text" dtInput placeholder="Please insert something" aria-label="Please insert something"/>
      <dt-loading-spinner dtPrefix></dt-loading-spinner>
    </dt-form-field>
  `,
})
export class InputLoadingDistractorExampleComponent { }
