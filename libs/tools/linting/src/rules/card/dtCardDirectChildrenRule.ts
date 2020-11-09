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
  ChildNode,
  addFailure,
  findChild,
  isElementWithName,
} from '../../utils';
import { cardChildren } from './cardUtils';

class DtCardVisitor extends BasicTemplateAstVisitor {
  visitElement(element: ElementAst, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-card')) {
      return;
    }

    let childNodes: ChildNode[] = [];
    cardChildren.forEach(childName => {
      childNodes = childNodes.concat(findChild(element, childName, 0));
    });

    const filteredChildren: string[] = childNodes
      .filter(el => el.level > 1)
      .map(el => el.name);

    if (filteredChildren.length < 1) {
      return;
    }

    const childrenNames = Array.from(new Set(filteredChildren));
    addFailure(
      this,
      element,
      `The following elements must be direct children of a dt-card: ${childrenNames.join(
        ', ',
      )}`,
    );
  }
}

/**
 * The dtCardDirectChildrenRule ensures that the defined elements are always direct children of a dt-card.
 *
 * The following example passes the check:
 * <dt-card>
 *   <dt-card-title>Top 3 JavaScript errors</dt-card-title>
 *   <dt-card-subtitle>Detailed information about JavaScript errors</dt-card-subtitle>
 *   // ...
 * </dt-card>
 *
 * For the following example the linter throws an error:
 * <dt-card>
 *   <dt-card-title>Top 3 JavaScript errors</dt-card-title>
 *   <div>
 *     <dt-card-subtitle>Detailed information about JavaScript errors</dt-card-subtitle>
 *   </div>
 *   // ...
 * </dt-card>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      "Ensures that a card's child components are direct children of a dt-card.",
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      "A card's child components (title, subtitle, actions, ...) must always be direct children of the dt-card.",
    ruleName: 'dt-card-direct-children',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtCardVisitor,
      }),
    );
  }
}
