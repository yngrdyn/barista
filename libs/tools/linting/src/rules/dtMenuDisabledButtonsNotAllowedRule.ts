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

import { addFailure, getAttribute, isElementWithName } from '../utils';

class DtMenuAndGroupVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-menu', 'dt-menu-group')) {
      return;
    }

    for (const child of element.children) {
      if (
        child instanceof ElementAst &&
        isElementWithName(child, 'button') &&
        getAttribute(child, 'disabled') !== undefined
      ) {
        addFailure(this, child, 'dt-menu-item must not be disabled.');
      }
    }
  }
}

/**
 * The dtMenuDisabledButtonsNotAllowedRule ensures that that dt-menu-items are never disabled.
 *
 * The following example passes the lint checks:
 * <dt-menu aria-label="Example Menu">
 *   <button dtMenuItem>Menu item</button>
 * </dt-menu>
 *
 * For the following example the linter throws errors:
 * <dt-menu aria-label="Example Menu">
 *   <button disabled dtMenuItem>Disabled menu item</button>
 * </dt-menu>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that dt-menu-items are never disabled.',
    options: null, // tslint:disable-line:no-null-keyword
    optionsDescription: 'Not configurable.',
    rationale: 'There is no intended use case for disabled menu items.',
    ruleName: 'dt-menu-disabled-buttons-not-allowed',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtMenuAndGroupVisitor,
      }),
    );
  }
}
