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

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { Constructor, mixinColor } from '@dynatrace/barista-components/core';

import { DtBreadcrumbsItem2 } from './breadcrumbs-item';
import { DtBreadcrumbsItem } from './item/breadcrumbs-item';

export type DtBreadcrumbThemePalette = 'main' | 'error' | 'neutral';

// Boilerplate for applying mixins to DtBreadcrumb.
export class DtBreadcrumbBase {
  constructor(public _elementRef: ElementRef) {}
}

export const _DtBreadcrumbMixinBase = mixinColor<
  Constructor<DtBreadcrumbBase>,
  DtBreadcrumbThemePalette
>(DtBreadcrumbBase, 'main');
@Component({
  selector: 'dt-breadcrumbs',
  exportAs: 'dtBreadcrumbs',
  templateUrl: 'breadcrumbs.html',
  styleUrls: ['breadcrumbs.scss'],
  host: {
    class: 'dt-breadcrumbs',
    '[attr.aria-label]': 'ariaLabel',
  },
  inputs: ['color'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtBreadcrumbs extends _DtBreadcrumbMixinBase
  implements AfterContentInit, OnDestroy {
  /**
   * Aria label for the breadcrumbs
   * @deprecated use the native aria-label for strings and if you need a binding use [attr.aria-label]
   * @breaking-change to be removed in 6.0.0
   */
  @Input('aria-label') ariaLabel: string;
  // tslint:disable:deprecation
  @ContentChildren(DtBreadcrumbsItem)
  private _items: QueryList<DtBreadcrumbsItem>;
  // tslint:enable:deprecation

  @ContentChildren(DtBreadcrumbsItem2) private _items2: QueryList<
    DtBreadcrumbsItem2
  >;

  private _destroy$ = new Subject<void>();

  constructor(elementRef: ElementRef) {
    super(elementRef);
  }

  ngAfterContentInit(): void {
    this._items.changes
      .pipe(startWith(null), takeUntil(this._destroy$))
      .subscribe(() => {
        // We need to notify the items whether they are the last one in the list,
        // because they use this information to determine their active state.
        this._items.forEach((item, index) => {
          item._lastItem = this._items.length - 1 === index;
        });
      });
    this._items2.changes
      .pipe(startWith(null), takeUntil(this._destroy$))
      .subscribe(() => {
        this._items2.forEach((item, index) => {
          item._setCurrent(this._items2.length - 1 === index);
        });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
