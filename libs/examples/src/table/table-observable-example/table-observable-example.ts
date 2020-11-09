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

import { Component } from '@angular/core';
import { BehaviorSubject, Subscription, interval, Subject } from 'rxjs';
import { take, takeUntil, finalize } from 'rxjs/operators';

const MAX_ROWS = 5;

@Component({
  selector: 'dt-example-table-observable',
  styleUrls: ['./table-observable-example.scss'],
  templateUrl: './table-observable-example.html',
})
export class DtExampleTableObservable {
  dataSource = new BehaviorSubject<object[]>([]);
  cancelSubscriptionSource = new Subject<void>();

  // tslint:disable-next-line:no-magic-numbers
  private source = interval(1000);
  subscription: Subscription;
  isSubscribed = false;

  startSubscription(): void {
    this.isSubscribed = true;
    this.subscription = this.source
      .pipe(
        take(MAX_ROWS),
        takeUntil(this.cancelSubscriptionSource),
        finalize(() => {
          this.isSubscribed = false;
        }),
      )
      .subscribe((): void => {
        this.getAnotherRow();
      });
  }

  cancelSubscription(): void {
    this.cancelSubscriptionSource.next();
  }

  clearRows(): void {
    this.dataSource.next([]);
  }

  getAnotherRow(): void {
    // tslint:disable
    this.dataSource.next([
      ...this.dataSource.value,
      {
        host: 'et-demo-2-win4',
        cpu: `${(Math.random() * 10).toFixed(2)} %`,
        memory: `${(Math.random() * 10).toFixed(2)} % of ${(
          Math.random() * 40
        ).toFixed(2)} GB`,
        traffic: `${(Math.random() * 100).toFixed(2)} Mbit/s`,
      },
    ]);
    // tslint:enable
  }
}
