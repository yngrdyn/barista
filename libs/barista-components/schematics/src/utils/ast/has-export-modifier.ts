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

import * as ts from 'typescript';

/**
 * Check if the node has an export modifier – we only need
 * exported nodes (types, interfaces, classes, etc…)
 *
 * Look if the `export` keyword exist on node
 * @example
 * ```typescript
 * export class SampleClassname { … }
 * ```
 * @param {ts.Node} node Node to check
 * @returns {boolean}
 */
export function hasExportModifier(node: ts.Declaration): boolean {
  // tslint:disable-next-line: no-bitwise
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}
