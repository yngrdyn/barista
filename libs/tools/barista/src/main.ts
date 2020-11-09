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

import { isPublicBuild } from '@dynatrace/tools/shared';
import { environment } from '@environments/barista-environment';
import { green } from 'chalk';
import { existsSync, mkdirSync, promises as fs } from 'fs';
import { EOL } from 'os';
import { dirname, join } from 'path';
import { componentsBuilder } from './builder/components';
import { homepageBuilder } from './builder/homepage';
import { iconsBuilder } from './builder/icons';
import { strapiBuilder } from './builder/strapi';
import { overviewBuilder } from './generators/category-navigation';
import {
  exampleInlineSourcesTransformerFactory,
  internalContentTransformerFactory,
  internalLinksTransformerFactory,
} from './transform';
import { BaPageBuilder, BaPageBuildResult, BaPageTransformer } from './types';

// Add your page-builder to this map to register it.
const BUILDERS = new Map<string, BaPageBuilder>([
  ['components-builder', componentsBuilder],
  ['strapi-builder', strapiBuilder],
  ['homepage-builder', homepageBuilder],
  ['icons-builder', iconsBuilder],
]);

/**
 * Creates the internalLinksTransformer via a factory because we need to read
 * some arguments from the process environment.
 * Transformers should be pure for testing.
 */
function createInternalLinksTransformer(): BaPageTransformer {
  const internalLinkArg = environment.internalLinks;
  const internalLinkParts = internalLinkArg ? internalLinkArg.split(',') : [];
  const isPublic = isPublicBuild();
  return internalLinksTransformerFactory(isPublic, internalLinkParts);
}

/**
 * Creates the internalContentTransformer via a factory because we need to read
 * one argument from the process environment.
 */
function createInternalContentTransformer(): BaPageTransformer {
  const isPublic = isPublicBuild();
  return internalContentTransformerFactory(isPublic);
}

/**
 * Creates the exampleInlineSourcesTransformer by loading the example
 * metadata-json and calling the factory with it.
 */
async function createExampleInlineSourcesTransformer(): Promise<
  BaPageTransformer
> {
  if (!existsSync(environment.examplesMetadataDir)) {
    throw new Error(
      `"${environment.examplesMetadataFileName}" not found. Make sure to run "examples-tools" first.`,
    );
  }
  const examplesMetadata = await fs.readFile(
    join(environment.examplesMetadataDir, environment.examplesMetadataFileName),
    {
      encoding: 'utf8',
    },
  );

  return exampleInlineSourcesTransformerFactory(JSON.parse(examplesMetadata));
}

/** Builds pages using all registered builders. */
async function buildPages(): Promise<void[]> {
  const globalTransformers = [
    await createExampleInlineSourcesTransformer(),
    createInternalLinksTransformer(),
    createInternalContentTransformer(),
  ];

  const builders = Array.from(BUILDERS.values());
  // Run each builder and collect all build results
  const results = await builders.reduce<Promise<BaPageBuildResult[]>>(
    async (aggregatedResults, currentBuilder) => [
      ...(await aggregatedResults),
      ...(await currentBuilder(globalTransformers)),
    ],
    Promise.resolve([]),
  );

  // Make sure dist dir is created
  mkdirSync(environment.distDir, { recursive: true });

  const routes = results
    .map(result => {
      const path = result.relativeOutFile
        .replace(/^\//, '') // replace the leading slash
        .replace(/\..+$/, ''); // replace the file ending
      return `/${path}`;
    })
    .join(EOL);

  const routesFile = join(environment.distDir, 'routes.txt');
  // write the routes to a own file that can be used for pre rendering
  fs.writeFile(routesFile, routes, 'utf-8');
  console.log(
    green(
      '\n✅ Successfully created routes.txt file for pre-rendering barista\n',
    ),
  );

  const files = results.map(async result => {
    const outFile = join(environment.distDir, result.relativeOutFile);

    // Creating folder path if it does not exist
    mkdirSync(dirname(outFile), { recursive: true });

    // Write file with page content to disc.
    // tslint:disable-next-line: no-magic-numbers
    return fs.writeFile(outFile, JSON.stringify(result.pageContent, null, 2), {
      flag: 'w', // "w" -> Create file if it does not exist
      encoding: 'utf8',
    });
  });

  const allPages = await Promise.all(files);
  const overviewPages = await overviewBuilder();

  return [...allPages, ...overviewPages];
}

buildPages()
  .then(async results => {
    console.log(`${results.length} pages created.`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
