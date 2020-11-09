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
import { BaNav as Navigation } from '@dynatrace/shared/barista-definitions';
import { BaPageService } from '../../../shared/services/page.service';

@Component({
  selector: 'ba-nav',
  templateUrl: 'nav.html',
  styleUrls: ['nav.scss'],
  host: {
    class: 'ba-nav',
  },
})
export class BaNav {
  /** @internal Data needed to render the navigation. */
  _navData$ = this._pageService._getPage('nav');

  /** @internal whether the menu is shown in the mobile version */
  _showMenu = false;

  constructor(private _pageService: BaPageService<Navigation>) {}
}
