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

import { Theme } from '@dynatrace/design-tokens-ui/shared';
import { PaletteSourceService } from '../../services/palette';
import { Observable } from 'rxjs';

@Component({
  selector: 'design-tokens-ui-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss'],
})
export class ThemesComponent {
  _themes$: Observable<Theme[]> = this._paletteSourceService.themes$;

  constructor(private _paletteSourceService: PaletteSourceService) {}

  /** @internal Export palette as YAML */
  _yamlExport(): void {
    this._paletteSourceService.exportYaml();
  }
}
