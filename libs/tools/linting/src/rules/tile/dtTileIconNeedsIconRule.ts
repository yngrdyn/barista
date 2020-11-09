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
  hasOnlyDtIconChildren,
  isElementWithName,
} from '../../utils';

class DtTileVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-tile-icon')) {
      return;
    }

    if (!hasContent(element)) {
      addFailure(
        this,
        element,
        'A dt-tile-icon must not be empty, but must contain a dt-icon element.',
      );
    }

    if (hasOnlyDtIconChildren(element)) {
      return;
    }

    addFailure(
      this,
      element,
      'A dt-tile-icon must contain dt-icon elements only. No other nested elements are allowed.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtTileIconNeedsIconRule ensures that a tile icon only contains dt-icon elements.
 *
 * The following example passes the lint checks:
 * <dt-tile-icon><dt-icon name="agent"></dt-icon></dt-tile-icon>
 *
 * For the following examples the linter throws an error:
 * <dt-tile-icon>some text</dt-tile-icon>
 * <dt-tile-icon> </dt-tile-icon>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that a tile icon contains only dt-icon components.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'A tile icon must only contain dt-icon components.',
    ruleName: 'dt-tile-icon-needs-icon',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtTileVisitor,
      }),
    );
  }
}
