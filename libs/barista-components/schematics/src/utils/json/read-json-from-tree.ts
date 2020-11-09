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

import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { readFileFromTree } from '../read-file-from-tree';
import { SchematicsException } from '@angular-devkit/schematics';

/**
 * This method is specifically for reading JSON files in a Tree
 * @param tree The tree tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
export function readJsonFromTree<T = {}>(tree: Tree, path: string): T {
  const content = readFileFromTree(tree, path);
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new SchematicsException(`Cannot parse ${path}: ${e.message}`);
  }
}
