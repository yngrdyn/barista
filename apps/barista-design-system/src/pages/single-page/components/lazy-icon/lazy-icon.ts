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
  ElementRef,
  Input,
} from '@angular/core';
import { createInViewportStream } from '@dynatrace/barista-components/core';

@Component({
  selector: 'ba-lazy-icon',
  templateUrl: 'lazy-icon.html',
  styleUrls: ['lazy-icon.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaLazyIcon {
  @Input() name: string;
  @Input() title: string;

  /** @internal Whether the icon should be shown. */
  _isVisible$;

  constructor(elementRef: ElementRef) {
    this._isVisible$ = createInViewportStream(elementRef, 0);
  }

  _getIconLink(): string[] {
    return ['/', 'resources', 'icons', this.name];
  }
}
