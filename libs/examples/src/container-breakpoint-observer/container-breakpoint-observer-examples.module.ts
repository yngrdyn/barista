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
import { DtContainerBreakpointObserverModule } from '@dynatrace/barista-components/container-breakpoint-observer';
import { DtExampleContainerBreakpointObserverDefault } from './container-breakpoint-observer-default-example/container-breakpoint-observer-default-example';
import { DtExampleContainerBreakpointObserverIf } from './container-breakpoint-observer-if-example/container-breakpoint-observer-if-example';
import { DtExampleContainerBreakpointObserverIfElse } from './container-breakpoint-observer-if-else-example/container-breakpoint-observer-if-else-example';

@NgModule({
  imports: [DtContainerBreakpointObserverModule],
  declarations: [
    DtExampleContainerBreakpointObserverDefault,
    DtExampleContainerBreakpointObserverIf,
    DtExampleContainerBreakpointObserverIfElse,
  ],
})
export class DtContainerBreakpointObserverExamplesModule {}
