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
  hasContent,
  hasTextContentAlternative,
  isElementWithName,
} from '../utils';

class DtCheckboxVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-checkbox')) {
      return;
    }

    if (hasContent(element) || hasTextContentAlternative(element)) {
      return;
    }

    addFailure(
      this,
      element,
      'When a dt-checkbox does not contain any content it must have an aria-label or an aria-labelledby attribute.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtCheckboxNoEmptyRule ensures that a checkbox always has a text or an aria-label as alternative.
 *
 * The following example passes the lint checks:
 * <dt-checkbox>Subscribe to newsletter</dt-checkbox>
 * <dt-checkbox aria-label="When checked you agree to subscribe to our newsletter."></dt-checkbox>
 *
 * For the following example the linter throws errors:
 * <dt-checkbox></dt-checkbox>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that a checkbox always contains content or an aria-label as alternative.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'A checkbox without content must have an aria-label or aria-labelledby attribute.',
    ruleName: 'dt-checkbox-no-empty',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtCheckboxVisitor,
      }),
    );
  }
}
