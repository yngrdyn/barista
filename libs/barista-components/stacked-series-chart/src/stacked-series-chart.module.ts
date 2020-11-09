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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DtStackedSeriesChart } from './stacked-series-chart';
import { DtStackedSeriesChartOverlay } from './stacked-series-chart-overlay.directive';
import {
  DtFormattersModule,
  DtCount,
} from '@dynatrace/barista-components/formatters';
import { DtLegendModule } from '@dynatrace/barista-components/legend';
import { DtOverlayModule } from '@dynatrace/barista-components/overlay';

@NgModule({
  imports: [CommonModule, DtFormattersModule, DtLegendModule, DtOverlayModule],
  exports: [DtStackedSeriesChart, DtStackedSeriesChartOverlay],
  declarations: [DtStackedSeriesChart, DtStackedSeriesChartOverlay],
  providers: [DtCount],
})
export class DtStackedSeriesChartModule {}
