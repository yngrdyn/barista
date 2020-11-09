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

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DtThemingModule } from '@dynatrace/barista-components/theming';

import { DtConfirmationDialog } from './confirmation-dialog';
import { DtConfirmationDialogActions } from './confirmation-dialog-actions';
import { DtConfirmationDialogState } from './confirmation-dialog-state/confirmation-dialog-state';

@NgModule({
  imports: [OverlayModule, DtThemingModule, CommonModule],
  exports: [
    DtConfirmationDialog,
    DtConfirmationDialogState,
    DtConfirmationDialogActions,
  ],
  declarations: [
    DtConfirmationDialog,
    DtConfirmationDialogState,
    DtConfirmationDialogActions,
  ],
})
export class DtConfirmationDialogModule {}
