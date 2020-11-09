/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable no-lifecycle-call no-use-before-declare no-magic-numbers
// tslint:disable no-any max-file-line-count no-unbound-method use-component-selector

import { Component } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DtOption, DtOptionModule } from '@dynatrace/barista-components/core';

import { createComponent } from '@dynatrace/testing/browser';

describe('DtOption', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DtOptionModule],
      declarations: [OptionWithDisable],
    }).compileComponents();
  }));

  it('should complete the `stateChanges` stream on destroy', () => {
    const fixture = createComponent(OptionWithDisable);
    const optionInstance: DtOption<string> = fixture.debugElement.query(
      By.directive(DtOption),
    ).componentInstance;
    const completeSpy = jest.fn();
    const subscription = optionInstance._stateChanges.subscribe(
      () => {},
      () => {},
      completeSpy,
    );

    fixture.destroy();
    expect(completeSpy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should not emit to `selectionChange` if selecting an already-selected option', () => {
    const fixture = createComponent(OptionWithDisable);
    const optionInstance: DtOption<string> = fixture.debugElement.query(
      By.directive(DtOption),
    ).componentInstance;

    optionInstance.select();
    expect(optionInstance.selected).toBe(true);

    const spy = jest.fn();
    const subscription = optionInstance.selectionChange.subscribe(spy);

    optionInstance.select();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should not emit to `selectionChange` if deselecting an unselected option', () => {
    const fixture = createComponent(OptionWithDisable);
    const optionInstance: DtOption<string> = fixture.debugElement.query(
      By.directive(DtOption),
    ).componentInstance;

    optionInstance.deselect();
    expect(optionInstance.selected).toBe(false);

    const spy = jest.fn();
    const subscription = optionInstance.selectionChange.subscribe(spy);

    optionInstance.deselect();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(false);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });
});

@Component({
  template: ` <dt-option [disabled]="disabled"></dt-option> `,
})
class OptionWithDisable {
  disabled: boolean;
}
