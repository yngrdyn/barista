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

// tslint:disable no-lifecycle-call no-use-before-declare no-magic-numbers
// tslint:disable no-any max-file-line-count no-unbound-method use-component-selector
import { Component, EventEmitter } from '@angular/core';

/**
 * Examples:
 * MockComponent('some-component');
 * MockComponent('some-component', {inputs: ['some-input', 'some-other-input']});
 */
export function MockComponent(
  selector: string,
  options: Component & { identifier?: any },
): Component {
  const metadata: Component & { identifier: any } = {
    selector,
    identifier: options.identifier,
    template: options.template || '',
    inputs: options.inputs,
    outputs: options.outputs || [],
    exportAs: options.exportAs || '',
  };

  class Mock {}

  metadata.outputs!.forEach((method) => {
    Mock.prototype[method] = new EventEmitter<any>();
  });

  if (options.identifier) {
    metadata.providers = [{ provide: options.identifier, useClass: Mock }];
  }

  return Component(metadata)(Mock as any);
}
