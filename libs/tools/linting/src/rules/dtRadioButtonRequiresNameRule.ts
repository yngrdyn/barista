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
  getElementParent,
  getParentElement,
  isElementWithName,
} from '../utils';

class DtRadioButtonVisitor extends BasicTemplateAstVisitor {
  radioButtonGroups: ParentElement[] = [];

  // Codelyzer in v6 has a dependency to angular 9 and therefore
  // we have to type the element as any, otherwise the installed
  // angular v10 and v9 conflict with their types
  visitElement(element: any, context: any): void {
    this._validateElement(element);
    super.visitElement(element, context);
  }

  private _validateElement(element: ElementAst): any {
    // Check if a radio group is found.
    if (isElementWithName(element, 'dt-radio-group')) {
      const parentElement = getParentElement(
        element,
        'dt-radio-group',
        'dt-radio-button',
      );
      if (parentElement === undefined) {
        return;
      }
      this.radioButtonGroups.push(parentElement);
      // Sort by start line for later checks.
      if (this.radioButtonGroups.length > 1) {
        this.radioButtonGroups.sort((a, b) => a.startLine - b.startLine);
      }
      return;
    }

    if (!isElementWithName(element, 'dt-radio-button')) {
      return;
    }

    // Check if the radio button is part of a radio group.
    if (getElementParent(element, this.radioButtonGroups)) {
      return;
    }

    // If the radio button is not part of a radio group, check for the name attribtue.
    const radioName = getAttribute(element, 'name');
    if (radioName && radioName.value && radioName.value.trim().length > 0) {
      return;
    }

    addFailure(
      this,
      element,
      'When a dt-radio-button is not part of a dt-radio group it must have a name attribute.',
    );
  }
}

/**
 * @deprecated Will be removed with v9.0.0 as tslint is deprecated and won't be supported anymore.
 * There will be no replacement for eslint. Instead take a look on our design system how the
 * component should be used.
 *
 * The dtRadioButtonRequiresNameRule ensures that a radio button has a name when not part of a radio group.
 *
 * The following example passes the lint checks:
 * <dt-radio-group name="group0">
 *   <dt-radio-button value="aberfeldy">Aberfeldy</dt-radio-button>
 *   <dt-radio-button value="dalmore">Dalmore</dt-radio-button>
 * </dt-radio-group>
 *
 * <dt-radio-button value="dalmore" name="group">Dalmore</dt-radio-button>
 *
 * For the following example the linter throws errors:
 * <dt-radio-button value="myValue">Radio button value</dt-radio-button>
 */
export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description:
      'Ensures that a radio button has a name attribute when not part of a radiogroup.',
    // tslint:disable-next-line:no-null-keyword
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'A radio button that is not part of a radio group must have a name attribute.',
    ruleName: 'dt-radio-button-requires-name',
    type: 'maintainability',
    typescriptOnly: true,
  };

  apply(sourceFile: SourceFile): RuleFailure[] {
    const result = this.applyWithWalker(
      new NgWalker(sourceFile, this.getOptions(), {
        templateVisitorCtrl: DtRadioButtonVisitor,
      }),
    );

    return result;
  }
}
