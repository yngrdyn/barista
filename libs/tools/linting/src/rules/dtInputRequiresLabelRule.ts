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
  ParentElement,
  addFailure,
  getAttribute,
  getParentElement,
  hasFormFieldParentWithLabel,
  hasTextContentAlternative,
  isElementWithName,
} from '../utils';

class DtInputVisitor extends BasicTemplateAstVisitor {
  formFields: ParentElement[] = [];

  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    // If the element is a form field, remember it.
    if (isElementWithName(element, 'dt-form-field')) {
      const parentElement = getParentElement(element, element.name);
      if (parentElement === undefined) {
        return;
      }
      this.formFields.push(parentElement);
      // Sort by start line for later checks.
      if (this.formFields.length > 1) {
        this.formFields.sort((a, b) => a.startLine - b.startLine);
      }
      return;
    }

    if (getAttribute(element, 'dtInput') === undefined) {
      return;
    }

    // If the input has a form field parent element with a label, return.
    if (hasFormFieldParentWithLabel(element, this.formFields)) {
      return;
    }

    // If the input has no form field wrapper or a wrapper without label check for an aria-label.
    if (hasTextContentAlternative(element)) {
      return;
    }

    addFailure(
      this,
      element,
      'A dtInput requires a wrapping form field with a dt-label or an aria-label or aria-labelledby attribute.',
    );
  }
}

/**
 * The dtInputRequiresLabelRule ensures that a label or text alternatives are given for a dtInput.
 *
 * The following example passes the lint checks:
 * <dt-form-field>
 *   <dt-label>Some text</dt-label>
 *   <input type="text" dtInput placeholder="Please insert text"/>
 * </dt-form-field>
 *
 * <input type="text" dtInput placeholder="Please insert text" aria-label="Please insert text"/>
 *
 * For the following example the linter throws errors:
 * <input type="text" dtInput placeholder="Please insert text"/>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that a label or text alternatives are given for a dtInput.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'A dtInput must have a label when used with the form field component or an aria-label or aria-labelledby attribute.',
    ruleName: 'dt-input-requires-label',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtInputVisitor,
      }),
    );
  }
}
