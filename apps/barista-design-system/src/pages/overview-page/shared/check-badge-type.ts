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

export function checkBadgeType(
  badge: string[],
): { icon: string; style: string } | undefined {
  let _badge: { icon: string; style: string } | undefined = undefined;
  if (badge && badge.includes('favorite')) {
    _badge = {
      icon: '/assets/favorite-white.svg',
      style: 'ba-tile-badge-favorite',
    };
  }
  if (badge && badge.includes('deprecated')) {
    _badge = {
      icon: '/assets/incident-white.svg',
      style: 'ba-tile-badge-warning',
    };
  }
  if (badge && badge.includes('experimental')) {
    _badge = {
      icon: '/assets/laboratory-white.svg',
      style: 'ba-tile-badge-warning',
    };
  }
  if (badge && badge.includes('work in progress')) {
    _badge = {
      icon: '/assets/maintenance-royalblue.svg',
      style: 'ba-tile-badge-workinprogress',
    };
  }
  return _badge;
}
