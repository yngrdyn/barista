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

import { tagAdd, overlayPane } from './tag-add.po';
import { resetWindowSizeToDefault, waitForAngular } from '../../../utils';

fixture('Tag add')
  .page('http://localhost:4200/tag/tag-add')
  .beforeEach(async () => {
    await resetWindowSizeToDefault();
    await waitForAngular();
  });

test('should propagate attribute to overlay', async (testController: TestController) => {
  await testController
    .click(tagAdd, { speed: 0.1 })
    .expect(overlayPane.getAttribute('dt-ui-test-id'))
    .contains('tag-add-overlay');
});
