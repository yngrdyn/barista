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

import { ElementAst } from '@angular/compiler';
import { BasicTemplateAstVisitor, NgWalker } from 'codelyzer';
import { IRuleMetadata, RuleFailure, Rules } from 'tslint';
import { SourceFile } from 'typescript';

import {
  addFailure,
  hasTextContentAlternative,
  isElementWithName,
} from '../utils';

class DtSelectionAreaVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-selection-area')) {
      return;
    }

    if (
      hasTextContentAlternative(element, 'aria-label-selected-area') &&
      hasTextContentAlternative(element, 'aria-label-left-handle') &&
      hasTextContentAlternative(element, 'aria-label-right-handle') &&
      hasTextContentAlternative(element, 'aria-label-close-button')
    ) {
      return;
    }

    addFailure(
      this,
      element,
      'A selection area must provide alternative texts for both handles, the selected area and the close button.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtSelectionAreaAltTextRule ensures that text alternatives are given for the
 * selection area's handles, close button and area.
 *
 * The following example passes the lint checks:
 * <dt-selection-area #area="dtSelectionArea"
 *   (changed)="handleChange($event)"
 *   aria-label-selected-area="Text that describes the content of the selection area."
 *   aria-label-left-handle="Resize selection area to the left."
 *   aria-label-right-handle="Resize selection area to the right."
 *   aria-label-close-button="Close the selection area."
 * >
 *   // selection area content
 * </dt-selection-area>
 *
 * For the following example the linter throws errors:
 * <dt-selection-area #area="dtSelectionArea" (changed)="handleChange($event)">
 *   // selection area content
 * </dt-selection-area>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that text alternatives are given for handles, the close button and the area of the selection area.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'Handles, the close button and the area of the selection area need additional attributes to provide text alternatives.',
    ruleName: 'dt-selection-area-alt-text',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtSelectionAreaVisitor,
      }),
    );
  }
}
