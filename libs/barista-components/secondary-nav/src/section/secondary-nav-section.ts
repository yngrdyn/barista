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

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Directive({
  selector: 'dt-secondary-nav-section-title',
  host: {
    class: 'dt-secondary-nav-section-title',
  },
  exportAs: 'dtSecondaryNavSectionTitle',
})
export class DtSecondaryNavSectionTitle {}

@Directive({
  selector: 'dt-secondary-nav-section-description',
  host: {
    class: 'dt-secondary-nav-section-description',
  },
  exportAs: 'dtSecondaryNavSectionDescription',
})
export class DtSecondaryNavSectionDescription {}

@Component({
  selector: 'dt-secondary-nav-section',
  exportAs: 'dtSecondaryNavSection',
  templateUrl: 'secondary-nav-section.html',
  host: {
    class: 'dt-secondary-nav-section',
    '[class.dt-secondary-nav-section-expandable]': 'expandable',
    '[class.dt-secondary-nav-section-active]': 'active',
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtSecondaryNavSection {
  /** The path or url used for navigation. */
  @Input() href: string;

  /** Whether the section is open or closed. */
  @Input()
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    // Only update expanded state if it actually changed.
    if (this._expanded !== newValue) {
      this._expanded = newValue;
      this.expandChange.emit(newValue);
      // Ensures that the animation will run when the value is set outside of an `@Input`.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _expanded = false;

  /** Whether the section is expandable. */
  @Input()
  get expandable(): boolean {
    return this._expandable;
  }
  set expandable(value: boolean) {
    this._expandable = coerceBooleanProperty(value);
  }
  private _expandable = false;

  /** Whether the section is external. */
  @Input()
  get external(): boolean {
    return this._external;
  }
  set external(value: boolean) {
    this._external = coerceBooleanProperty(value);
  }
  private _external = false;

  /** Whether the section is active. */
  @Input()
  get active(): boolean {
    return this._active;
  }
  set active(value: boolean) {
    this._active = coerceBooleanProperty(value);
    if (this._active && this._expandable) {
      this.expanded = true;
    }
  }
  private _active = false;

  /** Event emitted when the section's expandable state changes. */
  @Output() readonly expandChange = new EventEmitter<boolean>();

  /** @internal Event emitted when the section is expanded. */
  @Output('expanded') readonly _sectionExpand: Observable<
    boolean
  > = this.expandChange.pipe(filter((v) => v));

  /** @internal Event emitted when the section is collapsed. */
  @Output('collapsed') readonly _sectionCollapse: Observable<
    boolean
  > = this.expandChange.pipe(filter((v) => !v));

  /** @internal Subject used to communicate programmatic change of section opening and closing */
  _sectionExpandChange$: Subject<DtSecondaryNavSection> = new Subject();

  constructor(private readonly _changeDetectorRef: ChangeDetectorRef) {}

  /** @internal Emit toggle change when section is clicked. */
  _sectionExpanded(): void {
    this._sectionExpandChange$.next(this);
  }
}
