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
import { Route, RouterModule } from '@angular/router';
import { DtButtonModule } from '@dynatrace/barista-components/button';
import { DtThemingModule } from '@dynatrace/barista-components/theming';
import { BaDecisionGraphPage } from './decision-graph-page';
import { BaPageGuard } from '@dynatrace/shared/data-access-strapi';
import { BaDecisionGraph } from './components/ba-decision-graph/ba-decision-graph';
import {
  BaDecisionGraphNode,
  BaDecisiongraphNodeNavigation,
} from './components/ba-decision-graph/ba-decision-graph-node';
import { BaDecisionGraphStartnode } from './components/ba-decision-graph/ba-decision-graph-start-node';

export const routes: Route[] = [
  {
    path: '',
    component: BaDecisionGraphPage,
    canActivate: [BaPageGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    DtButtonModule,
    DtThemingModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    BaDecisionGraphPage,
    BaDecisionGraph,
    BaDecisionGraphNode,
    BaDecisionGraphStartnode,
    BaDecisiongraphNodeNavigation,
  ],
})
export class DecisionGraphPageModule {}
