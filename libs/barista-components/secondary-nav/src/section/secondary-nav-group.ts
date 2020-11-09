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
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Input,
} from '@angular/core';

@Component({
  selector: 'dt-secondary-nav-group',
  exportAs: 'dtSecondaryNavGroup',
  template: `
    <div class="dt-secondary-nav-group-title">{{ label }}</div>
    <ng-content></ng-content>
  `,
  host: {
    class: 'dt-secondary-nav-group',
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtSecondaryNavGroup {
  /** The text value of the group header. */
  @Input() label: string;
}
