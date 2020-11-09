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

import { isDefined } from '@dynatrace/barista-components/core';

import { DtFilterFieldDataSource } from './filter-field-data-source';
import {
  _DtAutocompleteValue,
  _DtFilterFieldTagData,
  _DtFilterValue,
  _DtFreeTextValue,
  DtNodeDef,
  _DtRangeValue,
  dtAutocompleteDef,
  dtFreeTextDef,
  dtGroupDef,
  isAsyncDtAutocompleteDef,
  isDtAutocompleteDef,
  _isDtAutocompleteValue,
  isDtFreeTextDef,
  isDtFreeTextValue,
  isDtGroupDef,
  isDtOptionDef,
  isDtRangeDef,
  _isDtRangeValue,
  isDtRenderType,
} from './types';

/**
 * Either returns the provided autocomplete def or null on whether the autocomplete still contains
 * options or groups after filtering them based on the predicate functions below.
 */
export function filterAutocompleteDef(
  def: DtNodeDef,
  distinctIds: Set<string>,
  filterText?: string,
): DtNodeDef | null {
  const optionsOrGroups = def
    .autocomplete!.optionsOrGroups.map(optionOrGroup =>
      isDtGroupDef(optionOrGroup)
        ? filterGroupDef(optionOrGroup, distinctIds, filterText)
        : filterOptionDef(optionOrGroup, distinctIds, filterText),
    )
    .filter(optionOrGroup => optionOrGroup !== null) as DtNodeDef[];
  return def.autocomplete!.async || optionsOrGroups.length
    ? dtAutocompleteDef(
        def.data,
        def,
        optionsOrGroups,
        def.autocomplete!.distinct,
        def.autocomplete!.async,
      )
    : null;
}

/** Filters the list of suggestions (options) based on the predicate functions below. */
export function filterFreeTextDef(
  def: DtNodeDef,
  filterText?: string,
): DtNodeDef {
  const suggestions = def.freeText!.suggestions
    ? def.freeText!.suggestions.filter(option =>
        filterOptionDef(option, new Set(), filterText),
      )
    : [];

  return dtFreeTextDef(
    def.data,
    def,
    suggestions,
    def.freeText!.validators || [],
    isDefined(def.freeText!.unique) ? def.freeText!.unique! : false,
  );
}

/**
 * Either returns the provided group def or null on whether the group still contains options
 * after filtering them based on the predicate functions below.
 */
export function filterGroupDef(
  def: DtNodeDef,
  selectedOptionIds: Set<string>,
  filterText?: string,
): DtNodeDef | null {
  const options = def.group!.options.filter(option =>
    filterOptionDef(option, selectedOptionIds, filterText),
  );
  return options.length
    ? dtGroupDef(
        def.data,
        def,
        def.group!.label,
        options,
        def.group!.parentAutocomplete,
      )
    : null;
}

/** Either returns the provided option def or null based on the predicate functions below. */
export function filterOptionDef(
  def: DtNodeDef,
  selectedOptionIds: Set<string>,
  filterText?: string,
): DtNodeDef | null {
  return defDistinctPredicate(
    def,
    selectedOptionIds,
    !!def.option!.parentAutocomplete &&
      def.option!.parentAutocomplete.autocomplete!.distinct,
  ) &&
    defUniquePredicate(def, selectedOptionIds) &&
    optionFilterTextPredicate(def, filterText || '')
    ? def
    : null;
}

/** Predicate function to check whether the provided node def should be in the filtered result. */
export function defDistinctPredicate(
  def: DtNodeDef,
  selectedOptionIds: Set<string>,
  isDistinct: boolean,
): boolean {
  if (isDtGroupDef(def)) {
    return optionOrGroupListFilteredPredicate(
      def.group.options,
      selectedOptionIds,
      isDistinct,
    );
  }

  if (
    isDtOptionDef(def) &&
    !optionSelectedPredicate(def, selectedOptionIds, isDistinct)
  ) {
    return false;
  }

  if (isDtAutocompleteDef(def)) {
    if (def.autocomplete.async && isDtOptionDef(def)) {
      return !(
        def.autocomplete.distinct && isOptionSelected(def, selectedOptionIds)
      );
    }

    return (
      def.autocomplete.async ||
      optionOrGroupListFilteredPredicate(
        def.autocomplete.optionsOrGroups,
        selectedOptionIds,
        def.autocomplete.distinct,
      )
    );
  }
  return true;
}

/**
 * A predicate function that checks if a unique def or option should be included in the options
 * returns false if the freetext option should NOT be included
 */
export function defUniquePredicate(
  def: DtNodeDef,
  selectedOptionIds: Set<string>,
): boolean {
  return !(
    ((isDtFreeTextDef(def) && def.freeText.unique) ||
      (isDtRangeDef(def) && def.range!.unique)) &&
    isDtOptionDef(def) &&
    def.option.uid &&
    selectedOptionIds.has(def.option.uid)
  );
}

/** Whether a filtered list of options or groups contains items. */
export function optionOrGroupListFilteredPredicate(
  optionsOrGroups: DtNodeDef[],
  selectedOptionIds: Set<string>,
  isDistinct: boolean,
): boolean {
  if (isDistinct) {
    return !optionsOrGroups.some(
      optionOrGroup =>
        !optionOrGroupFilteredPredicate(
          optionOrGroup,
          selectedOptionIds,
          isDistinct,
        ),
    );
  }
  return optionsOrGroups.some(optionOrGroup =>
    optionOrGroupFilteredPredicate(
      optionOrGroup,
      selectedOptionIds,
      isDistinct,
    ),
  );
}

/** Whether an option or Group is filtered (visible) */
export function optionOrGroupFilteredPredicate(
  optionOrGroup: DtNodeDef,
  selectedOptionIds: Set<string>,
  isDistinct: boolean,
): boolean {
  return isDtGroupDef(optionOrGroup)
    ? optionOrGroupListFilteredPredicate(
        optionOrGroup.group.options,
        selectedOptionIds,
        isDistinct,
      )
    : optionSelectedPredicate(optionOrGroup, selectedOptionIds, isDistinct);
}

/** Predicate function for filtering options based on their id. */
export function optionSelectedPredicate(
  def: DtNodeDef,
  selectedIds: Set<string>,
  isDistinct: boolean,
): boolean {
  return !(
    isOptionSelected(def, selectedIds) &&
    (!isDtRenderType(def) || isDistinct)
  );
}

/** Predicate function for filtering options based on the view value and the text inserted by the user. */
export function optionFilterTextPredicate(
  def: DtNodeDef,
  filterText: string,
): boolean {
  // Transform the filter and viewValue by converting it to lowercase and removing whitespace.
  const transformedFilter = filterText.trim().toLowerCase();
  const transformedViewValue = def.option!.viewValue.trim().toLowerCase();
  return (
    !transformedFilter.length ||
    transformedViewValue.indexOf(transformedFilter) !== -1
  );
}

/** Whether the option is selected (its uid is contained in the selectedIds list). */
function isOptionSelected(def: DtNodeDef, selectedIds: Set<string>): boolean {
  const uid = def.option!.uid;
  return Boolean(uid && selectedIds.has(uid));
}

/** Transforms a RangeSource to the Tag data values. */
// tslint:disable-next-line: no-any
function transformRangeSourceToTagData(
  result: _DtRangeValue,
): { separator: string; value: string } {
  if (result.operator === 'range') {
    return {
      separator: ':',
      value: `${result.range[0]}${result.unit} - ${result.range[1]}${result.unit}`,
    };
  }
  let separator;
  switch (result.operator) {
    case 'equal':
      separator = '=';
      break;
    case 'greater-equal':
      separator = '≥';
      break;
    case 'lower-equal':
      separator = '≤';
      break;
    default:
      separator = '-';
  }
  const value = `${result.range}${result.unit}`;

  return { separator, value };
}

export function createTagDataForFilterValues(
  filterValues: _DtFilterValue[],
  editable?: boolean,
  deletable?: boolean,
): _DtFilterFieldTagData | null {
  let key: string | null = null;
  let value: string | null = null;
  let separator: string | null = null;
  let isFreeText = false;
  let isFirstValue = true;

  for (const filterValue of filterValues) {
    if (_isDtAutocompleteValue(filterValue)) {
      if (isFirstValue && filterValues.length > 1) {
        key = filterValue.option.viewValue;
      }
      value = filterValue.option.viewValue;
    } else if (isDtFreeTextValue(filterValue)) {
      value = `${filterValue}`;
      isFreeText = true;
      if (filterValues.length > 1) {
        separator = '~';
      }
      break;
    } else if (_isDtRangeValue(filterValue)) {
      // Assigning variables destructed variables to already defined ones needs to be within braces.
      ({ value, separator } = transformRangeSourceToTagData(filterValue));
      break;
    }
    isFirstValue = false;
  }

  return filterValues.length && value !== null
    ? new _DtFilterFieldTagData(
        key,
        value,
        separator,
        isFreeText,
        filterValues,
        editable,
        deletable,
      )
    : null;
}

export function findFilterValuesForSources<T>(
  sources: T[],
  rootDef: DtNodeDef,
  asyncDefs: Map<DtNodeDef, DtNodeDef>,
  dataSource: DtFilterFieldDataSource,
): _DtFilterValue[] | null {
  const foundValues: _DtFilterValue[] = [];
  let parentDef = rootDef;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const isLastSource = i + 1 === sources.length;
    const def =
      findDefForSource(source, parentDef) ||
      dataSource.transformObject(source, parentDef);

    if (
      isLastSource &&
      ((isDtFreeTextValue(source) && isDtFreeTextDef(parentDef)) ||
        (_isDtRangeValue(source) && isDtRangeDef(parentDef)))
    ) {
      foundValues.push(source);
      return foundValues;
    } else if (def) {
      if (isDtRenderType(def)) {
        if (isLastSource) {
          return null;
        }
        if (isAsyncDtAutocompleteDef(def)) {
          const asyncDef = asyncDefs.get(def);
          if (asyncDef) {
            parentDef = asyncDef;
            foundValues.push(def, asyncDef as _DtAutocompleteValue);
          } else {
            parentDef = def;
            foundValues.push(def);
          }
        } else if (isDtOptionDef(def)) {
          parentDef = def;
          foundValues.push(def);
        } else {
          return null;
        }
      } else {
        foundValues.push(def);
        if (isLastSource) {
          return foundValues;
        }
      }
    } else {
      return null;
    }
  }
  return null;
}

/** Tries to find a definition for the provided source. It will start the lookup at the provided def. */
export function findDefForSource(
  source: any, // tslint:disable-line:no-any
  def: DtNodeDef,
): DtNodeDef | null {
  if (isDtAutocompleteDef(def)) {
    for (const optionOrGroup of def.autocomplete.optionsOrGroups) {
      if (isDtOptionDef(optionOrGroup) && optionOrGroup.data === source) {
        return optionOrGroup;
      }
      if (isDtGroupDef(optionOrGroup)) {
        for (const option of optionOrGroup.group.options) {
          if (option.data === source) {
            return option;
          }
        }
      }
    }
  }
  return null;
}

// Use an obscure Unicode character to delimit the words in the concatenated string.
// This avoids matches where the values of two columns combined will match the user's query
// (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
// that has a very low chance of being typed in by somebody in a text field. This one in
// particular is "White up-pointing triangle with dot" from
// https://en.wikipedia.org/wiki/List_of_Unicode_characters
export const DELIMITER = '◬';

/** Peeks into a option node definition and returns its distinct id or creates a new one. */
export function peekOptionId(
  def: DtNodeDef,
  prefix?: string,
  prefixOnly?: boolean,
): string {
  const id = def.option!.uid
    ? def.option!.uid
    : generateOptionId(def, prefix, prefixOnly);
  def.option!.uid = id;
  return id;
}

/** Generates a new option id for the provided node def. */
export function generateOptionId(
  def: DtNodeDef,
  prefix: string = '',
  prefixOnly: boolean = false,
): string {
  const groupRef = def.option!.parentGroup
    ? `${def.option!.parentGroup.group!.label}${DELIMITER}`
    : '';
  return prefixOnly
    ? prefix
    : `${prefix}${groupRef}${def.option!.viewValue}${DELIMITER}`;
}

/** Generates and applies ids for the provided option and all its children. */
export function applyDtOptionIds(
  def: DtNodeDef,
  prefix: string = '',
  skipRootDef: boolean = false,
): void {
  if (isDtOptionDef(def)) {
    // Reassigning is ok here as the prefix param is of type string
    // tslint:disable-next-line: no-parameter-reassignment
    prefix = peekOptionId(def, prefix, skipRootDef);
  }
  if (isDtAutocompleteDef(def)) {
    for (const optionOrGroup of def.autocomplete.optionsOrGroups) {
      applyDtOptionIds(optionOrGroup, prefix);
    }
  } else if (isDtGroupDef(def)) {
    for (const option of def.group.options) {
      applyDtOptionIds(option, prefix);
    }
  }
}

/** Checks whether two autocomplete values are both options and have the same uid */
export function isDtAutocompleteValueEqual(
  a: _DtAutocompleteValue,
  b: _DtAutocompleteValue,
  prefix?: string,
): boolean {
  return peekOptionId(a, prefix) === peekOptionId(b, prefix);
}

/** Checks whether two freetext values are equal */
export function isDtFreeTextValueEqual(
  a: _DtFreeTextValue,
  b: _DtFreeTextValue,
): boolean {
  return a === b;
}

/** Checks whether two range values are equal */
export function isDtRangeValueEqual(
  a: _DtRangeValue,
  b: _DtRangeValue,
): boolean {
  if (a.operator === b.operator && a.unit === b.unit) {
    return Array.isArray(a.range) && Array.isArray(b.range)
      ? a.range.join(DELIMITER) === b.range.join(DELIMITER)
      : a === b;
  }
  return false;
}
