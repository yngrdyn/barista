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

/**
 * Custom event implementation that mimics a native change event.
 */
export class FluidCheckboxChangeEvent extends CustomEvent<any> {
  constructor(public checked: boolean) {
    super('change', { bubbles: true, composed: true });
  }
}

/**
 * Custom event implementation for the IndeterminateChange event.
 */
export class FluidCheckboxIndeterminateChangeEvent extends CustomEvent<any> {
  constructor(public checked: boolean) {
    super('indeterminateChange', { bubbles: true, composed: true });
  }
}
