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
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { BaEnvironment } from './barista-environment.interface';

// TODO: Remove all platform dependent usages like process and dotenv
// load the environment variables from the .env file in your workspace
dotenvConfig();

/** The Barista project's root directory. */
const ROOT_DIR = join(__dirname, '../../../..');

/** Root directory of the iconpack repository. */
const ICONS_ROOT = join(__dirname, '../../../../../barista-icons/src');

/** Path to the icons changelog relative to the iconpack root directory. */
const ICONS_CHANGELOG = join(
  ICONS_ROOT,
  '../_build/barista-icons/_templates',
  `CHANGELOG${isPublicBuild() ? '-public' : ''}.json`,
);

/** URL/IP where the Strapi CMS is located. */
const STRAPI_ENDPOINT = process.env.STRAPI_ENDPOINT;

/** Parts of internal URLs that should be removed on public build. */
const INTERNAL_LINKS = process.env.INTERNAL_LINKS;

export const environment: BaEnvironment = {
  rootDir: ROOT_DIR,
  distDir: join(ROOT_DIR, 'dist/barista-data'),
  examplesMetadataDir: join(ROOT_DIR, 'dist'),
  examplesMetadataFileName: 'examples-metadata.json',
  examplesLibDir: join(ROOT_DIR, 'libs/examples/src'),
  shareableExamplesToolsDir: join(
    ROOT_DIR,
    'libs/tools/shareable-examples/src',
  ),
  demosAppDir: join(ROOT_DIR, 'apps/demos/src'),
  baristaAppDir: join(ROOT_DIR, 'apps/barista-design-system/src'),
  iconsRoot: ICONS_ROOT,
  iconsChangelogFileName: ICONS_CHANGELOG,
  strapiEndpoint: STRAPI_ENDPOINT,
  internalLinks: INTERNAL_LINKS,
};
