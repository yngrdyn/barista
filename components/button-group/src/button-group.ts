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

import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';

import {
  CanColor,
  CanDisable,
  Constructor,
  HasTabIndex,
  mixinColor,
  mixinTabIndex,
  _readKeyCode,
} from '@dynatrace/barista-components/core';

export class DtButtonGroupBase {
  disabled: boolean;
}
export const _DtButtonGroup = mixinTabIndex(DtButtonGroupBase);

@Component({
  selector: 'dt-button-group',
  exportAs: 'dtButtonGroup',
  template: '<ng-content></ng-content>',
  styleUrls: ['button-group.scss'],
  inputs: ['tabIndex'],
  host: {
    class: 'dt-button-group',
    '[attr.aria-disabled]': 'disabled.toString()',
    role: 'radiogroup',
  },
  encapsulation: ViewEncapsulation.Emulated,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtButtonGroup<T> extends _DtButtonGroup
  implements CanDisable, HasTabIndex, AfterContentInit {
  private _value: T | null = null;
  private _disabled = false;

  // tslint:disable-next-line: no-use-before-declare no-forward-ref
  @ContentChildren(
    forwardRef(() => DtButtonGroupItem),
    { descendants: true },
  )
  private _items: QueryList<DtButtonGroupItem<T>>;

  /** Emits a stream when the value changes. */
  @Output() readonly valueChange = new EventEmitter<T | null>();

  /** The value of the button group. */
  @Input()
  get value(): T | null {
    return !this.disabled ? this._value : null;
  }
  set value(newValue: T | null) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._updateSelectedItemFromValue();
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Whether the radio group is disabled */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._markItemsForCheck();
  }

  /** Sets the focus to the first button in the buttongroup. */
  focus(): void {
    if (this._items && this._items.first) {
      this._items.first.focus();
    }
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngAfterContentInit(): void {
    if (this._items && this._items.length > 0) {
      // find if there is a selection
      // defer to next CD run - this is needed because we cannot update the item right away when there is no value set
      Promise.resolve().then(() => {
        const selected = this._items.find(item => item.selected);
        if (this.value === null) {
          this.value = selected ? selected.value : this._items.first.value;
        } else {
          this._updateSelectedItemFromValue();
        }
      });
    }
  }

  /** @internal Dispatch change event with current selection and group value. */
  _emitChangeEvent(): void {
    this.valueChange.emit(this._value);
  }

  /** trigger change detection for items */
  private _markItemsForCheck(): void {
    if (this._items) {
      this._items.forEach(item => {
        item._markForCheck();
      });
    }
  }

  /** Updates the `selected` state of each item button based on the groups value. */
  private _updateSelectedItemFromValue(): void {
    if (this._items) {
      this._items.forEach(item => {
        item.selected = this.value === item.value;
      });
    }
  }
}

/** Change event object emitted by DtRadioButton */
export interface DtButtonGroupItemSelectionChange<T> {
  source: DtButtonGroupItem<T>;
  value: T | null;
}

export type DtButtonGroupThemePalette = 'main' | 'error';
export class DtButtonGroupItemBase {
  /** Whether the button group item is disabled. */
  disabled: boolean;
  constructor(public _elementRef: ElementRef) {}
}
export const _DtButtonGroupItem = mixinTabIndex(
  mixinColor<Constructor<DtButtonGroupItemBase>, DtButtonGroupThemePalette>(
    DtButtonGroupItemBase,
    'main',
  ),
);

@Component({
  selector: 'dt-button-group-item',
  template: `
    <ng-content></ng-content>
  `,
  exportAs: 'dtButtonGroupItem',
  host: {
    role: 'radio',
    class: 'dt-button-group-item',
    '[attr.aria-selected]': 'selected',
    '[class.dt-button-group-item-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled',
    '[class.dt-button-group-item-disabled]': 'disabled',
    '[attr.tabindex]': 'tabIndex',
    '(click)': '_onSelect($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  styleUrls: ['button-group-item.scss'],
  inputs: ['color'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtButtonGroupItem<T> extends _DtButtonGroupItem
  implements
    CanDisable,
    CanColor<DtButtonGroupThemePalette>,
    HasTabIndex,
    AfterContentInit,
    OnDestroy {
  private _selected = false;
  private _value: T;
  private _disabled = false;

  /** Emits a stream when this item is selected or deselected. */
  @Output() readonly selectionChange = new EventEmitter<
    DtButtonGroupItemSelectionChange<T>
  >();

  /** Whether the button-group item is selected. */
  @Input()
  get selected(): boolean {
    return this._selected && !this.disabled;
  }
  set selected(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    if (this._selected !== newValue) {
      this._selected = newValue;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Whether the button-group item is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this._buttonGroup && this._buttonGroup.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    if (this._disabled && this._selected) {
      this._selected = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** The bound value. */
  @Input()
  get value(): T {
    return this._value;
  }
  set value(newValue: T) {
    this._value = newValue;
  }

  /** Sets the focus on the element */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  constructor(
    private _buttonGroup: DtButtonGroup<T>,
    private _changeDetectorRef: ChangeDetectorRef,
    _elementRef: ElementRef,
    private _focusMonitor: FocusMonitor,
  ) {
    super(_elementRef);
    this._focusMonitor.monitor(_elementRef);
  }

  ngAfterContentInit(): void {
    if (this.value === undefined && this._elementRef) {
      this._value = this._elementRef.nativeElement.textContent;
    }
  }

  ngOnDestroy(): void {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** @internal Selects this item. */
  _onSelect(event: Event): void {
    event.stopPropagation();
    const groupValueChanged =
      this._buttonGroup && this.value !== this._buttonGroup.value;
    this.selectionChange.emit({ source: this, value: this.value });

    if (this._buttonGroup && groupValueChanged) {
      this._buttonGroup.value = this.value;
      this._buttonGroup._emitChangeEvent();
    }
  }

  /** @internal Ensures the option is selected when activated from the keyboard. */
  _handleKeydown(event: KeyboardEvent): void {
    const keyCode = _readKeyCode(event);
    if (keyCode === ENTER || keyCode === SPACE) {
      this._onSelect(event);

      // Prevent the page from scrolling down and form submits.
      event.preventDefault();
    }
  }

  /** @internal Marks this item to be checked on the next CD cycle. */
  _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
