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

import { addFailure, hasContentApartFrom, isElementWithName } from '../utils';

class DtTagVisitor extends BasicTemplateAstVisitor {
  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    if (!isElementWithName(element, 'dt-tag')) {
      return;
    }

    const tagChildren = ['dt-tag-key'];

    if (hasContentApartFrom(element, tagChildren)) {
      return;
    }

    addFailure(
      this,
      element,
      'A dt-tag must always contain text. Make sure this is the case even if you use nested components to render text.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtTagNoEmptyRule ensures that a tag always has content.
 *
 * The following examples pass the lint checks:
 * <dt-tag>Tag content</dt-tag>
 * <dt-tag><dt-tag-key>[My key]:</dt-tag-key>My value</dt-tag>
 *
 * For the following examples the linter throws errors:
 * <dt-tag> </dt-tag>
 * <dt-tag><dt-tag-key>[My key]:</dt-tag-key></dt-tag>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that a tag is never empty.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'A tag must always contain text or another component that renders text.',
    ruleName: 'dt-tag-no-empty',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtTagVisitor,
      }),
    );
  }
}
