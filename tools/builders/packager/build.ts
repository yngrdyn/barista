/**
 * @license
 * Copyright 2019 Dynatrace LLC
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

import {
  BuilderOutput,
  BuilderContext,
  Target,
} from '@angular-devkit/architect';

import { writeFileSync } from 'fs';
import { join } from 'path';
import { NgPackagrBuilderOptions } from '@angular-devkit/build-ng-packagr';
import {
  tryJsonParse,
  NgPackagerJson,
  AngularJson,
  PackageJson,
} from '../util/json-utils';
import { syncPeerDependencyPlaceholder } from './sync-dependencies';
import { PackagerOptions } from './schema';
import { copyStyles, copyAssets } from './copy-assets';

export async function packager(
  userOptions: PackagerOptions,
  context: BuilderContext,
): Promise<BuilderOutput> {
  const options: PackagerOptions = {
    releasePackageJson: 'package.json',
    placeholder: '0.0.0-NG',
    styleFolders: ['style'],
    assetFolders: ['assets'],
    ...userOptions,
  };

  const project = context.target !== undefined ? context.target!.project : '';
  context.logger.info(`Packaging ${project}...`);
  const target: Target = {
    target: 'build',
    project,
  };

  // Read the options of the build target options set up with the ng-packagr builder
  const ngPackagrBuilderOptions = ((await context.getTargetOptions(
    target,
  )) as unknown) as NgPackagrBuilderOptions;

  if (
    ngPackagrBuilderOptions === undefined ||
    ngPackagrBuilderOptions.project === undefined
  ) {
    // If we cannot find the project set for the ng-packagr we cannot continue
    context.logger.error(
      'Error: Build target does not have a project set for the ng-packagr in angular.json',
    );
    return { success: false };
  }

  try {
    const ngPackagrConfigPath = join(
      context.workspaceRoot,
      ngPackagrBuilderOptions.project.toString(),
    );
    // try to parse the ng-package.json file
    const ngPackagrConfig = await tryJsonParse<NgPackagerJson>(
      ngPackagrConfigPath,
    );

    // get the angular json
    context.logger.info('Reading angular.json file...');
    const angularJson = await tryJsonParse<AngularJson>(
      join(context.workspaceRoot, 'angular.json'),
    );

    // get the package json
    context.logger.info('Reading package.json file...');
    const packageJson = await tryJsonParse<PackageJson>(
      join(context.workspaceRoot, 'package.json'),
    );

    // Check whether a project root could be found
    const projectRoot =
      angularJson.projects &&
      angularJson.projects[project] &&
      angularJson.projects[project].root;
    if (!projectRoot) {
      context.logger.error(
        `Error: Could not find a root folder for the project ${project} in your angular.json file`,
      );
      return { success: false };
    }

    // Determine the library destination
    const libraryDestination = join(
      context.workspaceRoot,
      projectRoot,
      ngPackagrConfig.dest,
    );

    // Path to the package json file that we are going to ship with the library
    const releasePackageJsonPath = join(
      context.workspaceRoot,
      projectRoot,
      options.releasePackageJson,
    );
    let releasePackageJson = await tryJsonParse<PackageJson>(
      releasePackageJsonPath,
    );

    // Now we have everything ready and we can start the build
    // We need to run the build first because the ng-packagr clears the output directory

    // Schedule ng-packagr build
    const build = await context.scheduleTarget(target);

    const buildResult = await build.result;

    context.logger.info('Syncing dependencies for releasing...');
    // replace ng placeholder with angular version from root package.json and write to disk
    releasePackageJson = syncPeerDependencyPlaceholder(
      releasePackageJson,
      packageJson,
      options.placeholder,
    );
    writeFileSync(join(libraryDestination, 'package.json'), releasePackageJson);

    // copy styles
    context.logger.info('Copying styles...');
    await copyStyles(options, projectRoot, libraryDestination);
    // copy assets
    context.logger.info('Copying assets...');
    await copyAssets(options, projectRoot, libraryDestination);
    return { success: buildResult.success };
  } catch (err) {
    context.logger.error(err);
    console.log(err);
  }
  return { success: false };
}
