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

import { Rule } from '@angular-devkit/schematics';
import { PackageJson } from '../../../interfaces/package-json.interface';
import { updateJsonInTree } from '../../../utils';

/**
 * @internal
 * Updates all the necessary dependencies for the new major Version 7.
 */
export function updateDependenciesRule(): Rule {
  return updateJsonInTree<PackageJson>('/package.json', (json) => {
    updateDependency(json, '@dynatrace/barista-components', '^7.0.0');
    updateDependency(json, '@dynatrace/barista-icons', '^5.0.0');
    updateDependency(json, 'highcharts', '^7.2.1', false);
    // remove highcharts types as they are shipped now
    updateDependency(json, '@types/highcharts', undefined as any, false);

    json.dependencies['lodash-es'] = '^4.17.15';

    return json;
  });
}

/**
 * @internal
 * updates a dependency inside the package JSON,
 * if it does not exists it will add it
 * @param packageJson The package JSON
 * @param dependencyName The name of the dependency
 * @param version The desired version to be updated
 * @param addIfNotExists Adds the dependency if it does not exists
 */
export function updateDependency(
  packageJson: PackageJson,
  dependencyName: string,
  version: string,
  addIfNotExists: boolean = true,
): PackageJson {
  if (packageJson.dependencies?.hasOwnProperty(dependencyName)) {
    packageJson.dependencies[dependencyName] = version;
  } else if (packageJson.devDependencies?.hasOwnProperty(dependencyName)) {
    packageJson.devDependencies[dependencyName] = version;
  } else if (addIfNotExists) {
    packageJson.dependencies[dependencyName] = version;
  }

  return packageJson;
}
