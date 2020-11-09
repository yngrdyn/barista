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

import { checkbox, input } from './checkbox.po';
import { resetWindowSizeToDefault, waitForAngular } from '../../utils';

fixture('Checkbox')
  .page('http://localhost:4200/checkbox')
  .beforeEach(async () => {
    await resetWindowSizeToDefault();
    await waitForAngular();
  });

test('should be checked when clicked, and unchecked when clicked again', async (testController: TestController) => {
  await testController.click(checkbox);
  await testController.expect(await input.checked).ok();
  await testController.click(checkbox);
  await testController.expect(await input.checked).notOk();
});

test('should toggle the checkbox when pressing space', async (testController: TestController) => {
  await testController.expect(await input.checked).notOk();

  await testController.pressKey('tab');
  await testController.pressKey('space');

  await testController.expect(await input.checked).ok();
});
