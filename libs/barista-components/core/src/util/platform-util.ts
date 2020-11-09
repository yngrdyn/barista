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

import { coerceElement } from '@angular/cdk/coercion';
import { ElementRef } from '@angular/core';

import { isNumber, isString } from './type-util';

/**
 * @internal
 *
 * Replaces an old class on an element with a new on.
 * Both can also be null. In this case it just adds the new one or removes the old one.
 * If the optional Renderer is not provided it uses the browser specific classList.
 */
export function _replaceCssClass(
  elOrRef: any, // tslint:disable-line:no-any
  oldClass: string | null,
  newClass: string | null,
): void {
  const el = elOrRef.nativeElement || elOrRef;
  if (oldClass) {
    _removeCssClass(el, oldClass);
  }
  if (newClass) {
    _addCssClass(el, newClass);
  }
}

/**
 * @internal
 *
 * Adds or removes a class based on a provided boolean value
 * @param condition A boolean value that decides whether a class should be added or removed
 * @param el Element where the class should be toggled
 * @param name Class name that should be added or removed
 * @param renderer Optional renderer to set the class.
 */
export function _toggleCssClass(
  condition: boolean,
  // tslint:disable-next-line: no-any
  el: any,
  name: string,
): void {
  if (condition) {
    _addCssClass(el, name);
  } else {
    _removeCssClass(el, name);
  }
}

/** @internal */
// tslint:disable-next-line:no-any
export function _addCssClass(el: any, name: string): void {
  if (el.classList) {
    el.classList.add(name);
  }
}
/** @internal */
export function _removeCssClass(
  el: any, // tslint:disable-line:no-any
  name: string,
): void {
  if (el.classList) {
    el.classList.remove(name);
  }
}

/**
 * @internal
 *
 * Helper function to safely check if an element has a class
 * Also works with elements in svgs
 */
// tslint:disable-next-line:no-any
export function _hasCssClass(el: any, name: string): boolean {
  // classList cant be used safely for elements in svgs - thats why we are using getAttribute
  const classes = el.getAttribute('class') || '';
  return classes.split(' ').includes(name);
}

/**
 * @internal
 *
 * Reads the key code from a keyboard event.
 * It is needed because event.keyCode is deprecated an will lead to multiple tslint errors.
 * This function will move the the event.keyKode to a single point where we disable the tslint rule.
 */
export function _readKeyCode(event: KeyboardEvent): number {
  // tslint:disable-next-line:deprecation
  return event.keyCode;
}

/**
 * @internal
 *
 * Parses a value and a unit from a string / number if possible
 */
export function _parseCssValue(
  // tslint:disable-next-line: no-any
  input: any,
): { value: number; unit: string } | null {
  if (isNumber(input)) {
    return { value: input, unit: 'px' };
  }
  if (isString(input)) {
    const result = input.match(/^[\d\.]+/);
    let unit = 'px';
    let value: number;
    if (result && result.length) {
      value = parseFloat(result[0]);
      const unitParsed = input.slice(result[0].length).trim();
      unit = unitParsed !== '' ? unitParsed : unit;
      return { value, unit };
    }
  }
  return null;
}

/**
 * @internal
 *
 * Returns the bounding client rect of an element or element ref.
 * It is shimmed on platforms where this function is not available.
 * In this case a client rect with all properties set to `0` is returned.
 *
 * The client rect is also extended with the property `isNativeRect`.
 * This property is set to false, if a shimmed client rect is return.
 */
export function _getElementBoundingClientRect(
  el: Element | ElementRef,
): ClientRect & {
  /** Whether the returned client rect is provided by the platform or is shimmed. */
  isNativeRect: boolean;
} {
  const element: Element = coerceElement(el);

  const clientRect: ClientRect | DOMRect =
    element && element.getBoundingClientRect
      ? element.getBoundingClientRect()
      : {
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        };

  return {
    top: clientRect.top,
    height: clientRect.height,
    bottom: clientRect.bottom,
    left: clientRect.left,
    right: clientRect.right,
    width: clientRect.width,
    isNativeRect: element.getBoundingClientRect && !!window,
  };
}
