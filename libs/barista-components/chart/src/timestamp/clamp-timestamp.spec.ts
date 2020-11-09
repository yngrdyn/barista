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

// tslint:disable no-lifecycle-call no-use-before-declare no-magic-numbers
// tslint:disable no-any max-file-line-count no-unbound-method use-component-selector

import { clampTimestamp } from './clamp-timestamp';

describe('DtChartTimestamp clamp timestamp', () => {
  it('should clamp the timestamp to 0 if no min is provided', () => {
    expect(clampTimestamp(-100, 200)).toBe(0);
  });

  it('should clamp the timestamp to min if min is provided', () => {
    expect(clampTimestamp(-100, 200, 10)).toBe(10);
  });

  it('should clamp the timestamp to max value', () => {
    expect(clampTimestamp(400, 200)).toBe(200);
  });

  it('should not clamp the value if it is inside the range', () => {
    expect(clampTimestamp(100, 200)).toBe(100);
  });
});
