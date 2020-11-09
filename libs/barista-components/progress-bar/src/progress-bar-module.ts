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

import { NgModule } from '@angular/core';
import { DtIndicatorModule } from '@dynatrace/barista-components/core';

import { DtProgressBar } from './progress-bar';
import { DtProgressBarCount } from './progress-bar-count';
import { DtProgressBarDescription } from './progress-bar-description';

@NgModule({
  exports: [
    DtProgressBar,
    DtProgressBarDescription,
    DtProgressBarCount,
    // @breaking-change Remove export in 6.0.0 (Issue #214 has to be solved first)
    DtIndicatorModule,
  ],
  declarations: [DtProgressBar, DtProgressBarDescription, DtProgressBarCount],
})
export class DtProgressBarModule {}
