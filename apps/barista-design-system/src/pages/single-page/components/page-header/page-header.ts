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

import { Component, Input } from '@angular/core';

import { BaSinglePageContent } from '@dynatrace/shared/barista-definitions';

@Component({
  selector: 'ba-page-header',
  templateUrl: 'page-header.html',
  styleUrls: ['page-header.scss'],
  host: {
    class: 'ba-page-header',
  },
})
export class BaPageHeader {
  /** The page's content */
  @Input() content: BaSinglePageContent;

  /** Whether the page is the icon overview page */
  @Input() isIconOverviewPage: boolean;

  /** @internal Whether there are contributors to show in the page header */
  get _showContributors(): boolean {
    return Boolean(
      (this.content.contributors?.dev !== undefined &&
        this.content.contributors?.dev.length > 0) ||
        (this.content.contributors?.ux !== undefined &&
          this.content.contributors?.ux.length > 0),
    );
  }
}
