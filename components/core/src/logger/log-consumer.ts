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

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DtLogEntry } from './log-entry';

const LOG_BUS = new Subject<DtLogEntry>();

@Injectable({ providedIn: 'root' })
export class DtLogConsumer {
  /** Emits when a new log entry is emitted. */
  consume(): Observable<DtLogEntry> {
    return LOG_BUS.asObservable();
  }

  /** Emits a new log entry. */
  log(logEntry: DtLogEntry): void {
    LOG_BUS.next(logEntry);
  }
}

export const DT_STATIC_LOG_CONSUMER = new DtLogConsumer();
