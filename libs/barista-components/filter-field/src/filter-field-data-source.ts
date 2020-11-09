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

import { Observable } from 'rxjs';
import { DtNodeDef } from './types';

export abstract class DtFilterFieldDataSource {
  /**
   * Used by the DtFilterFieldControl. Called when it connects to the data source.
   * Should return a stream of data that will be transformed, filtered and
   * displayed by the DtFilterField and the DtFilterFieldControl.
   */
  abstract connect(): Observable<DtNodeDef | null>;

  /** Used by the DtFilterField. Called when it is destroyed. */
  abstract disconnect(): void;

  /** Whether the provided data object can be transformed into an DtAutocompleteDef. */
  // tslint:disable-next-line: no-any
  abstract isAutocomplete(data: any): boolean;

  /** Whether the provided data object can be transformed into an DtOptionDef. */
  // tslint:disable-next-line: no-any
  abstract isOption(data: any): boolean;

  /** Whether the provided data object can be transformed into an DtGroupDef. */
  // tslint:disable-next-line: no-any
  abstract isGroup(data: any): boolean;

  /** Whether the provided data object can be transformed into an DtFreeTextDef. */
  // tslint:disable-next-line: no-any
  abstract isFreeText(data: any): boolean;

  /** Whether the provided data object can be transformed into an DtRangeDef. */
  // tslint:disable-next-line: no-any
  abstract isRange(data: any): boolean;

  /** Transforms the provided data into a DtNodeDef which contains a DtAutocompleteDef. */
  abstract transformAutocomplete(
    // tslint:disable-next-line: no-any
    data: any,
    parent: DtNodeDef | null,
    existingDef: DtNodeDef | null,
  ): DtNodeDef;

  /** Transforms the provided data into a DtNodeDef which contains a DtOptionDef. */
  abstract transformOption(
    // tslint:disable-next-line: no-any
    data: any,
    parentAutocompleteOrOption: DtNodeDef | null,
    existingDef: DtNodeDef | null,
  ): DtNodeDef;

  /** Transforms the provided data into a DtNodeDef which contains a DtGroupDef. */
  abstract transformGroup(
    // tslint:disable-next-line: no-any
    data: any,
    parentAutocomplete: DtNodeDef | null,
    existingDef: DtNodeDef | null,
  ): DtNodeDef;

  /** Transforms the provided data into a DtNodeDef which contains a DtFreeTextDef. */
  abstract transformFreeText(
    // tslint:disable-next-line: no-any
    data: any,
    parent: DtNodeDef | null,
    existingDef: DtNodeDef | null,
  ): DtNodeDef;

  /** Transforms the provided data into a DtNodeDef which contains a DtRangeDef. */
  abstract transformRange(
    // tslint:disable-next-line: no-any
    data: any,
    parent: DtNodeDef | null,
    existingDef: DtNodeDef | null,
  ): DtNodeDef;

  /** Transforms the provided data into a DtNodeDef. */
  abstract transformObject(
    // tslint:disable-next-line: no-any
    data: any | null,
    parent: DtNodeDef | null,
  ): DtNodeDef | null;

  /** Transforms the provided list of data objects into an array of DtNodeDefs. */
  abstract transformList(
    // tslint:disable-next-line: no-any
    list: any[],
    parent: DtNodeDef | null,
  ): DtNodeDef[];
}
