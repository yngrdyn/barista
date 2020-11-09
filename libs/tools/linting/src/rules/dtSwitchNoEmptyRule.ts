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

class DtSwitchVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-switch')) {
      return;
    }

    if (hasContent(element) || hasTextContentAlternative(element)) {
      return;
    }

    addFailure(
      this,
      element,
      'When a dt-switch does not contain any content it must have an aria-label or an aria-labelledby attribute.',
    );
  }
}

/**
 * The dtSwitchNoEmptyRule ensures that a switch always has a text or an aria-label as alternative.
 *
 * The following example passes the lint checks:
 * <dt-switch>Subscribe to newsletter</dt-switch>
 * <dt-switch aria-label="When checked you agree to subscribe to our newsletter."></dt-switch>
 *
 * For the following example the linter throws errors:
 * <dt-switch></dt-switch>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that a switch always contains content or an aria-label as alternative.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'A switch without content must have an aria-label or aria-labelledby attribute.',
    ruleName: 'dt-switch-no-empty',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtSwitchVisitor,
      }),
    );
  }
}
