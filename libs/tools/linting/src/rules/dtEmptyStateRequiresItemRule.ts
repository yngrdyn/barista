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

import { addFailure, isElementWithName } from '../utils';

class DtEmptyStateItemVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-empty-state')) {
      return;
    }

    for (const child of element.children) {
      if (isElementWithName(child, 'dt-empty-state-item')) {
        return;
      }
    }

    addFailure(
      this,
      element,
      'dt-empty-state does not contain any dt-empty-state-items.',
    );
  }
}

/**
 * The dtEmptyStateRequiresItemRule ensures that each dt-empty-state
 * component has at least one dt-empty-state-item.
 *
 * The following example passes the lint checks:
 * <dt-empty-state>
 *   <dt-empty-state-item>
 *     <dt-empty-state-item-img>
 *       <img src="/assets/cta-noagent.svg" alt="No agent" />
 *     </dt-empty-state-item-img>
 *     <dt-empty-state-item-title>Some Heading</dt-empty-state-item-title>
 *     Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
 *   </dt-empty-state-item>
 * </dt-empty-state>
 *
 * For the following example the linter throws errors:
 * <dt-empty-state></dt-empty-state>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that each dt-empty-state component has at least one dt-empty-state-item.',
    options: null, // tslint:disable-line:no-null-keyword
    optionsDescription: 'Not configurable.',
    rationale: 'There is no use case for empty empty-state components.',
    ruleName: 'dt-empty-state-requires-item',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtEmptyStateItemVisitor,
      }),
    );
  }
}
