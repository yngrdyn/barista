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
  DtFilterFieldDataSource,
  DtNodeDef,
} from '@dynatrace/barista-components/filter-field';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Action, ActionType, updateDataSource } from './actions';
import { QuickFilterState } from './store';

/** Type for an effect */
export type Effect = (
  action$: Observable<Action>,
  state$?: Observable<QuickFilterState>,
) => Observable<Action>;

/** Operator to filter actions */
export const ofType = <T>(
  ...types: ActionType[]
): MonoTypeOperatorFunction<Action<T>> =>
  filter((action: Action) => types.indexOf(action.type) > -1);

/** Connects to a new Data dataSource */
export const switchDataSourceEffect: Effect = (action$: Observable<Action>) =>
  action$.pipe(
    ofType<DtFilterFieldDataSource<any>>(ActionType.SWITCH_DATA_SOURCE),
    switchMap((action) => action.payload!.connect()),
    map((nodeDef: DtNodeDef) => updateDataSource(nodeDef)),
  );
