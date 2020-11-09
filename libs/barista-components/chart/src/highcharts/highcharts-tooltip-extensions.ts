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
  DtChartTooltipData,
  DtChartTooltipEvent,
} from './highcharts-tooltip-types';

// tslint:disable-next-line: no-any
declare var require: any;
// tslint:disable-next-line: no-require-imports no-var-requires
const highcharts = require('highcharts');

export interface DtHcTooltipEventPayload {
  data: DtChartTooltipData;
}

/** Function that gets the arguments from highcharts and extracts the tooltip data the same way highcharts does it internally */
export function prepareTooltipData(
  pointOrPoints: any | any[], // tslint:disable-line:no-any
): DtChartTooltipData {
  let data: DtChartTooltipData;
  if (Array.isArray(pointOrPoints)) {
    // tslint:disable-next-line:no-any
    const pointConfig: any[] = [];
    // tslint:disable-next-line:no-any
    let hoveredIndex: number = -1;

    highcharts.each(pointOrPoints, function(item: any, index: number): void {
      const labelConfig = item.getLabelConfig();
      if (labelConfig.series.state === 'hover') {
        hoveredIndex = index;
      }
      pointConfig.push(labelConfig);
    });
    data = {
      x: pointOrPoints[0].category,
      y: pointOrPoints[0].y,
      points: pointConfig,
      hoveredIndex,
    };
  } else {
    const label = pointOrPoints.getLabelConfig();
    data = {
      x: label.x,
      y: label.y,
      point: label,
    };
  }
  return data;
}

/**
 * Wraps the reset function of the pointer class to have events that we can listen to
 */
export function addTooltipEvents(): boolean {
  highcharts.wrap(highcharts.Pointer.prototype, 'reset', function(
    proceed: any, // tslint:disable-line:no-any
  ): void {
    /**
     * Now apply the original function with the original arguments,
     * which are sliced off this function's arguments
     */
    const args = Array.prototype.slice.call(arguments, 1);
    proceed.apply(this, args);
    highcharts.fireEvent(this.chart, 'tooltipClosed');
  });

  highcharts.wrap(highcharts.Tooltip.prototype, 'refresh', function(
    proceed: any, // tslint:disable-line:no-any
  ): void {
    const args = Array.prototype.slice.call(arguments, 1);
    proceed.apply(this, args);
    /**
     * Extract data that would be passed to the formatter function due to a
     * weird issue that highcharts reuses the bound context to the formatter function
     */
    const pointOrPoints = args[0];

    const data = prepareTooltipData(pointOrPoints);

    const eventPayload: DtHcTooltipEventPayload = { data };
    highcharts.fireEvent(this.chart, 'tooltipRefreshed', eventPayload);
  });

  // this has to return something otherwise when running a build with the prod flag enabled
  // uglify throws away this code because it does not produce sideeffects
  return true;
}

/**
 * Compares two tooltip events if they differ.
 * Can be used as custom comparator function of a `distinctUntilChanged`
 */
export function compareTooltipEventChanged(
  a: DtChartTooltipEvent,
  b: DtChartTooltipEvent,
): boolean {
  if (a && b) {
    return (
      a.data.x === b.data.x &&
      a.data.y === b.data.y &&
      a.data.hoveredIndex === b.data.hoveredIndex
    );
  }
  return false;
}
