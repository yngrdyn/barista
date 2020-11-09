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
import { DtCheckboxModule } from '@dynatrace/barista-components/checkbox';
import { DtThemingModule } from '@dynatrace/barista-components/theming';
import { DtExampleCheckboxDark } from './checkbox-dark-example/checkbox-dark-example';
import { DtExampleCheckboxDefault } from './checkbox-default-example/checkbox-default-example';
import { DtExampleCheckboxIndeterminate } from './checkbox-indeterminate-example/checkbox-indeterminate-example';
import { DtExampleCheckboxResponsive } from './checkbox-responsive-example/checkbox-responsive-example';

@NgModule({
  imports: [CommonModule, DtThemingModule, DtCheckboxModule],
  declarations: [
    DtExampleCheckboxDark,
    DtExampleCheckboxDefault,
    DtExampleCheckboxIndeterminate,
    DtExampleCheckboxResponsive,
  ],
})
export class DtCheckboxExamplesModule {}
