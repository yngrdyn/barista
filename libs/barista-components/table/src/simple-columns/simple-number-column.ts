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
  ChangeDetectionStrategy,
  Component,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

import { isDefined, isNumber } from '@dynatrace/barista-components/core';
import { formatCount } from '@dynatrace/barista-components/formatters';

import { DtTable } from '../table';
import { DtSimpleColumnBase } from './simple-column-base';

@Component({
  selector: 'dt-simple-number-column',
  templateUrl: 'simple-number-column.html',
  styleUrls: ['./simple-column.scss'],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.Emulated,
  /*
   * Deliberatley set to Default because the embedded view that gets created for the
   * dtColumDef can't handle onPush and results in ChangeAfterChecked error.
   */
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: DtSimpleColumnBase, useExisting: DtSimpleNumberColumn },
  ],
})
export class DtSimpleNumberColumn<T> extends DtSimpleColumnBase<T> {
  // tslint:disable-next-line: no-any
  constructor(@Optional() table: DtTable<T>) {
    super(table);
  }

  /**
   * @internal Get data either returns a data access with the given name or calls the
   * displayAccessor function to get the simpleData for display.
   */
  // tslint:disable-next-line: no-any
  _getData(data: T): any {
    const output = this.displayAccessor
      ? this.displayAccessor(data, this.name)
      : (data as any)[this.name]; // tslint:disable-line:no-any

    if (isNumber(output) && !isDefined(this.formatter)) {
      return formatCount(output);
    }
    return this.formatter ? this.formatter(output) : output;
  }
}
