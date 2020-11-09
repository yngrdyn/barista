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

import { addFailure, hasContent, isElementWithName } from '../utils';

class DtLoadingDistractorVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (
      !isElementWithName(element, 'dt-loading-distractor') ||
      hasContent(element)
    ) {
      return;
    }

    addFailure(
      this,
      element,
      'A dt-loading-distractor must always contain text. Make sure this is the case even if you use nested components to render text.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtLoadingDistractorNoEmptyRule ensures that a dt-loading-distractor always contains content.
 *
 * The following example passes the check:
 * <dt-loading-distractor>Loading …</dt-loading-distractor>
 *
 * For the following example the linter throws an error:
 * <dt-loading-distractor> </dt-loading-distractor>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that a dt-loading-distractor always contains content.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'A dt-loading-distractor must always contain content.',
    ruleName: 'dt-loading-distractor-no-empty',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtLoadingDistractorVisitor,
      }),
    );
  }
}
