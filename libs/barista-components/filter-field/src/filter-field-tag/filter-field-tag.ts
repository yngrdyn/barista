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
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  NgZone,
  OnDestroy,
} from '@angular/core';

import { DtFilterFieldTagData } from '../types';
import { DtOverlayConfig } from '@dynatrace/barista-components/overlay';
import { Platform } from '@angular/cdk/platform';
import { take, takeUntil, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'dt-filter-field-tag',
  exportAs: 'dtFilterFieldTag',
  templateUrl: 'filter-field-tag.html',
  styleUrls: ['filter-field-tag.scss'],
  host: {
    '[attr.role]': `'option'`,
    class: 'dt-filter-field-tag',
    '[class.dt-filter-field-tag-disabled]': '_filterFieldDisabled || disabled',
  },
  encapsulation: ViewEncapsulation.Emulated,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtFilterFieldTag implements OnDestroy {
  /** Destroy subject being fired when the component is being destroyed. */
  private _destroy$ = new Subject<void>();

  /** State changes subject that fires each time a data state changes the component. */
  private _stateChanges$ = new Subject<void>();

  /** Tag data object that contains view values for displaying (like key, value and separator) and the original source. */
  @Input()
  get data(): DtFilterFieldTagData {
    return this._data;
  }
  set data(value: DtFilterFieldTagData) {
    if (value !== this._data) {
      this._stateChanges$.next();
    }
    this._data = value;
  }
  private _data: DtFilterFieldTagData;

  /** Emits when the filter should be removed (usually by clicking the remove button). */
  @Output() readonly remove = new EventEmitter<DtFilterFieldTag>();

  /** Emits when the filter should be made editable (usually by clicking the edit button). */
  @Output() readonly edit = new EventEmitter<DtFilterFieldTag>();

  /** Whether the tag is disabled. */
  // Note: The disabled mixin can not be used here because the CD needs to be triggerd after it has been set
  // to reflect the state when programatically setting the property.
  @Input()
  get disabled(): boolean {
    return !this.editable && !this.deletable;
  }
  set disabled(value: boolean) {
    const coercedValue = coerceBooleanProperty(value);
    this.editable = !coercedValue;
    this.deletable = !coercedValue;
    this._changeDetectorRef.markForCheck();
  }

  @Input()
  get _filterFieldDisabled(): boolean {
    return this._parentFilterFieldDisabled;
  }
  set _filterFieldDisabled(value: boolean) {
    this._parentFilterFieldDisabled = value;
    this._changeDetectorRef.markForCheck();
  }
  private _parentFilterFieldDisabled: boolean = false;

  /** Whether the tag is editable. */
  get editable(): boolean {
    return this.data && this.data.editable;
  }
  set editable(value: boolean) {
    if (this.data) {
      this.data.editable = coerceBooleanProperty(value);
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Whether the tag is deletable. */
  get deletable(): boolean {
    return this.data && this.data.deletable;
  }
  set deletable(value: boolean) {
    if (this.data) {
      this.data.deletable = coerceBooleanProperty(value);
      this._changeDetectorRef.markForCheck();
    }
  }

  /** @internal Element reference to the tag that holds the value. */
  @ViewChild('valueSpan', { read: ElementRef })
  _valueSpan: ElementRef<HTMLSpanElement>;

  /** @internal Configuration object for the tag overlay */
  _overlayConfig: DtOverlayConfig = {
    pinnable: false,
    originY: 'edge',
  };

  /** @internal Flag that determines if the tooltip needs to be shown. */
  _tooltipDisabled = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _platform: Platform,
    _zone: NgZone,
  ) {
    this._stateChanges$
      .pipe(
        switchMap(() => _zone.onStable.pipe(take(1))),
        takeUntil(this._destroy$),
      )
      .subscribe(() => this._updateOverlayState());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._stateChanges$.complete();
  }

  /** @internal Called when the remove button has been clicked. Emits the remove output. */
  _handleRemove(event: MouseEvent): void {
    // Prevent click from bubbling up, so it does not interfere with autocomplete
    event.stopImmediatePropagation();

    if (!this.disabled) {
      this.remove.emit(this);
    }
  }

  /** @internal Called when the edit button has been clicked. Emits the edit output. */
  _handleEdit(event: MouseEvent): void {
    // Prevent click from bubbling up, so it does not interfere with autocomplete
    event.stopImmediatePropagation();

    if (!this.disabled) {
      this.edit.emit(this);
    }
  }

  /**
   * Update the enabled state of the tooltip overlay. The overlay should be enabled
   * if the textvalue of the dt-filter-field-tag-value is being truncated.
   */
  private _updateOverlayState(): void {
    if (this._platform.isBrowser) {
      // If the value is empty, the valuespan will not exist
      // we can early exit with a disabled tooltip here.
      if (!this._valueSpan) {
        this._tooltipDisabled = true;
        this._changeDetectorRef.markForCheck();
        return;
      }
      // Get the css custom property that defines the max-width of the
      // value span.
      const specifiedMaxWidth = getComputedStyle(
        this._valueSpan.nativeElement,
      ).getPropertyValue('--dt-filter-field-max-width');
      // Evaluate if the tooltip should be disabled.
      this._tooltipDisabled =
        this._valueSpan.nativeElement.scrollWidth <
        (parseInt(specifiedMaxWidth) || 300);
      this._changeDetectorRef.markForCheck();
    }
  }
}
