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
import { CommonModule } from '@angular/common';
import { DtEventChartModule } from '@dynatrace/barista-components/event-chart';
import { DtKeyValueListModule } from '@dynatrace/barista-components/key-value-list';
import { DtButtonModule } from '@dynatrace/barista-components/button';
import { DtExampleEventChartCustomColor } from './event-chart-custom-color-example/event-chart-custom-color-example';
import { DtExampleEventChartDefault } from './event-chart-default-example/event-chart-default-example';
import { DtExampleEventChartLegend } from './event-chart-legend-example/event-chart-legend-example';
import { DtExampleEventChartOverlappingLoad } from './event-chart-overlapping-load-example/event-chart-overlapping-load-example';
import { DtExampleEventChartOverlay } from './event-chart-overlay-example/event-chart-overlay-example';
import { DtExampleEventChartSelection } from './event-chart-selection-example/event-chart-selection-example';
import { DtExampleEventChartSessionReplay } from './event-chart-session-replay-example/event-chart-session-replay-example';
import { DtExampleEventChartComplexSelection } from './event-chart-complex-selection-example/event-chart-complex-selection-example';

@NgModule({
  imports: [
    CommonModule,
    DtEventChartModule,
    DtKeyValueListModule,
    DtButtonModule,
  ],
  declarations: [
    DtExampleEventChartCustomColor,
    DtExampleEventChartDefault,
    DtExampleEventChartLegend,
    DtExampleEventChartOverlappingLoad,
    DtExampleEventChartOverlay,
    DtExampleEventChartSelection,
    DtExampleEventChartSessionReplay,
    DtExampleEventChartComplexSelection,
  ],
})
export class DtEventChartExamplesModule {}
