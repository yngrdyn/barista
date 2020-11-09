# Table

<ba-ux-snippet name="table-intro"></ba-ux-snippet>

<ba-live-example name="DtExampleTableDefault" fullwidth></ba-live-example>

The `DtTable` implementation enhances the
[Material's CDK table](https://material.angular.io/cdk/table/overview) and also
removes unneeded properties from the public API. The CDK table has a very
different approach on how to define the table template, it does not use the
native HTML table. Therefore, there are no `td`, `tr` or `th` tags involved.
Instead, you need to define all possible columns that the table may show
(depending on the data available) and then define which subset of columns you
want to show in the table header and body by selecting from the column
definitions.

## Imports

You have to import the `DtTableModule` to use the `dt-table`. If you want to use
the `dt-expandable-cell` component, Angular's `BrowserAnimationsModule` is
required for animations. For more details on this see
[Step 2: Animations in the getting started guide](https://barista.dynatrace.com/components/get-started/#step-2-animations).

```typescript
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DtTableModule } from '@dynatrace/barista-components/table';

@NgModule({
  imports: [BrowserAnimationsModule, DtTableModule],
})
class MyModule {}
```

## Table inputs

The `DtTable` component supports the following inputs. Find details about the
usage of each input below.

| Name          | Type                                 | Default | Description                                                          |
| ------------- | ------------------------------------ | ------- | -------------------------------------------------------------------- |
| `dataSource`  | `object[] | Observable | DataSource` |         | Data to be shown in the table.                                       |
| `loading`     | `boolean`                            | `false` | Whether the table is [loading](#loading) or not.                     |
| `multiExpand` | `boolean`                            | `false` | Whether the table allows [multiple rows to be expanded]() at a time. |

## Simple columns for basic use cases

For the most common column types (text and number columns) the Angular
components provide a `DtSimpleColumn` implementation that wraps the underlying,
more complex table setup. The `dtSimpleColumn` is an abstraction layer to the
full fledged table implementation to make usage of recurring-patterns easier and
to reduce boiler plate code that needs to be written to generate a simple table.

A `dtTable` using a `dtSimpleColumn` always needs the `dtSort` directive.

<ba-live-example name="DtExampleTableDefault" fullwidth></ba-live-example>

### DtSimpleColumn

The `dtSimpleColumn` provides a couple of inputs, which give the user easy
access to certain functionality of the `dtTable` like sorting, formatting, and
problem indicators.

#### Inputs

| Name                 | Type                                                 | Default | Description                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | `string`                                             | -       | The name of the `dtSimpleColumn` refers to the name of the column which it uses to register itself at the table. This name can be used to reference the column in the `dt-row`. The name input is the only **required** input on the simple column.                                                                                                           |
| `label`              | `string`                                             | -       | The label defines the string rendered into the header-cell of the given column. If no label is given, the `name` of the cell is being used. _(Optional)_                                                                                                                                                                                                      |
| `sortable`           | `boolean`                                            | `true`  | The sortable input defines whether the column should be sortable.                                                                                                                                                                                                                                                                                             |
| `displayAccessor<T>` | `(data: T, name: string) => any`                     | -       | The displayAccessor function can be used to extract the displayable data from any row data. The name property passes the currently rendered column name, which can be used for more generic functions. If no `displayAccessor` is given, the `dtSimpleColumn` tries to extract a displayable data from `rowData[name]`. _(Optional)_                          |
| `sortAccessor<T>`    | `(data: T, name: string) => string|number`           | -       | The sortAccessor function can be used to extract sortable data from any row data. The name property passes the currently rendered column name, which can be used for more generic functions. This sortAccessor function will be used by the dataSource to access sortable values from the row data. _(Optional)_                                              |
| `formatter`          | `(displayValue: any) => string|DtFormattedValue`     | -       | The formatter function can be used to fomat the displayed value, with either prepared DtFormatter functions or custom functions. Can be used on top of the displayAccessor function or standalone. The function gets passed either the output from the displayAccessor or the fallback data. _(Optional)_                                                     |
| `hasProblem<T>`      | `(data: T, name: string) => DtIndicatorThemePalette` | -       | The hasProblem function can be used to evaluate if a cell should add the `dtIndicator` and if it should display `error` or `warning`. The function gets passed the row data and the name of the current column, which allows for more generic functions. The function needs to return either `error` or `warning` if a problem should be active. _(Optional)_ |
| `dtColumnProportion` | `number`                                             | -       | Exposes the dtColumnProportion of the dtCell directive for use with simple columns                                                                                                                                                                                                                                                                            |
| `comparator<T>`      | `(left: T, right: T, name: string) => number`        | -       | The comparator function can be used to specify a custom comparator which is used to compare two rows. If this property is set, the sortAccessor for this column is ignored. This function must return `< 0` if left is logically smaller than right, `0` if they are equivalent, otherwise `> 0`. _(Optional)_                                                |

#### Variants

Currently there are three predefined versions of the `dtSimpleColumn` exposed:
`dt-simple-number-column`, `dt-simple-text-column` and `dt-favorite-column`.
There are only small differences between the number and text column:

##### dt-simple-text-column

- When sorting this column, the sort direction will start ascending, e.g. A -> Z
- Column alignment is set to `text` -> left

##### dt-simple-number-column

- When sorting this column, the sort direction will start descending, e.g. 100
  -> 0
- Column alignment is set to `number` -> right
- When no formatter is given, the `dtCount` formatter will automatically be
  applied, e.g. 1000 -> 1k

##### dt-favorite-column

- Column alignment is set to `icon` -> center
- When sorting this column, the sort direction will start descending, e.g. ★ ->
  ☆

Default example of a favorite column:
<ba-live-example name="DtExampleTableFavoriteColumn" fullwidth></ba-live-example>

When no label is given, nothing will be rendered inside the header-cell:
<ba-live-example name="DtExampleTableFavoriteColumnNoHeader" fullwidth></ba-live-example>

## Custom columns for advanced use cases

If the simple column implementation does not cover your use cases, you can use
the underlying API to create your own column, cell, and header definitions as
follows:

Each column definition is created with `dt-header-cell` and `dt-cell` inside an
`ng-container` structural directive with a `dtColumDef` attribute directive
applied to it.

```html
<ng-container dtColumnDef="username">
  <dt-header-cell *dtHeaderCellDef>User name</dt-header-cell>
  <dt-cell *dtCellDef="let row"><span ngNonBindable>{{row.a}}</span></dt-cell>
</ng-container>
```

Note: `dtCellDef` not only exports the row data but also the same properties as
`*ngFor`- using the same
[micro-syntax](https://gist.github.com/mhevery/d3530294cff2e4a1b3fe15ff75d08855).
The table header is defined with a `dt-header-row` component and a
`dtHeaderRowDef` directive:

```html
<dt-header-row *dtHeaderRowDef="['username', 'age', 'title']"></dt-header-row>
```

Finally the table row is defined with a `dt-row` component and a `dtRowDef`
directive:

```html
<dt-row *dtRowDef="let row; columns: ['username', 'age', 'title']"></dt-row>
```

Note: The `dtRowDef` also exports row context, which can be used for event and
property bindings on the row element. See the source code of the examples on
this page to see all the pieces in place.

<ba-live-example name="DtExampleTableCustomColumns" fullwidth></ba-live-example>

### Components and attributes that define a table

| Name               | Type      | Description                                                                                                                                                                                                                                |
| ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dtColumnDef`      | Attribute | Name for the column (to be used in the header and row definitions).                                                                                                                                                                        |
| `dtColumnAlign`    | Attribute | Sets the column alignment. Find possible values below in the "Alignment in tables" section.                                                                                                                                                |
| `dt-header-cell`   | Directive | Adds the appropriate classes (the generic dt-header-cell and the cell specific dt-column-css_friendly_column_name) and role (so the browser knows how to parse it. In this case it makes it act as a column header in a native html table) |
| `*dtHeaderCellDef` | Attribute | Captures the template of a column's header cell (the title for the column in the header) as well as cell-specific properties so the table can render it's header properly.                                                                 |
| `dt-cell`          | Component | Adds the appropriate classes and role (so the browser knows how to parse it. In this case it makes it act as a grid cell in a native html table).                                                                                          |
| `*dtCellDef`       | Attribute | Exports the row data and the same properties as an ngFor in a way you can define what the cell should show. It also captures the template of the column's data row cell.                                                                   |
| `dt-header-row`    | Component | Placeholder for the header row. It is a container that contains the cell outlet. Adds the appropriate class and role.                                                                                                                      |
| `*dtHeaderRowDef`  | Attribute | Defines the visible columns in the header out of all defined ones by receiving a columnName[].                                                                                                                                             |
| `dt-row`           | Component | Placeholder for the data rows. It is a container for the cell outlet. Adds the right class and role.                                                                                                                                       |
| `*dtRowDef`        | Attribute | Defines the visible columns in each row by receiving a columnName[] and also exposes the same micro-syntax that the dt-cell but for event and property binding.                                                                            |

### Alignment in tables

<ba-ux-snippet name="table-alignment"></ba-ux-snippet>

## Data source

The data source contains the data to be shown in the table. It can be an array,
an observable holding an array or a `DataSource` object.

The Angular components provide a `DtTableDataSource` that provides a lot of
functionality (like filtering, sorting, pagination) already set up. For use
cases that can not be implemented using the `DtTableDataSource` you can always
create your own data source that implements the `DataSource` interface.

## Sorting

The `DtSort` and `dt-sort-header` are used to add sorting functionality to the
table. To add sorting capabilities to a table add the `dtSort` directive to the
`dt-table` component.

```html
<dt-table ... dtSort ...></dt-table>
```

For each column that should be sortable by the user add `dt-sort-header` to the
`dt-header-cell`. The `dt-sort-header` registers itself with the ID given to the
`dtColumnDef` with the `DtSort` directive.

```html
<dt-header-cell dt-sort-header ...></dt-header-cell>
```

<ba-live-example name="DtExampleTableSorting" fullwidth></ba-live-example>

### DtSort

You can set the following inputs and outputs on the `dtSort` directive.

#### Inputs

| Name              | Type              | Default | Description                                                                                              |
| ----------------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `dtSortActive`    | `string`          |         | The ID of the most recent active column.                                                                 |
| `dtSortDirection` | `DtSortDirection` | `asc`   | The sort direction of the currently active column.                                                       |
| `dtSortDisabled`  | `boolean`         | `false` | Whether sorting is disabled for the entire table.                                                        |
| `dtSortStart`     | `DtSortDirection` |         | Sort direction in which a column is initially sorted. May be overriden by the DtSortHeader's sort start. |

#### Outputs

| Name         | Type                        | Default | Description                                                                          |
| ------------ | --------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `sortChange` | `EventEmitter<DtSortEvent>` |         | Event emmited when the user changes either the active sort or the sorting direction. |

#### Methods

| Name   | Description                                    | Parameters                                                               | Return value |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| `sort` | Sets the active sort ID and new sort direction | `sortable: DtSortHeader` or `active: string, direction`: DtSortDirection | `void`       |

### DtSortHeader

You can set the following inputs and outputs on the `dt-sort-header` component.

#### Inputs

| Name              | Type              | Default | Description                                                |
| ----------------- | ----------------- | ------- | ---------------------------------------------------------- |
| `disabled`        | `boolean`         |         | Whether sorting is disabled for this sort header.          |
| `start`           | `DtSortDirection` | `asc`   | Overrides the sort start value of the containing `DtSort`. |
| `sort-aria-label` | `string`          |         | Sets the aria label for the button used for sorting.       |

#### Accessibility

Please provide a `sort-aria-label` for each `dt-sort-header` to make the sorting
experience accessible for all users. E.g. `Change sort order for column hosts`.

### DtSortDirection

The type used for the sort direction, either `asc` or `desc`.

### DtSortEvent

The event emitted when the user changes either the active sort or the sorting
direction. The event contains the following properties.

| Name        | Type              | Description                                    |
| ----------- | ----------------- | ---------------------------------------------- |
| `active`    | `string`          | The ID of the currently active column.         |
| `direction` | `DtSortDirection` | The direction for the currently active column. |

## Searching/Filtering

<ba-ux-snippet name="table-search-filter"></ba-ux-snippet>

### DtTableSearch

#### Inputs

| Name              | Type     | Default     | Description                                                                       |
| ----------------- | -------- | ----------- | --------------------------------------------------------------------------------- |
| `value`           | `string` | `''`        | The current search term.                                                          |
| `placeholder`     | `string` | `undefined` | Placeholder string for the input field (always needs to start with "Search ..."). |
| `aria-label`      | `string` | `undefined` | An ARIA label describing the input field.                                         |
| `aria-labelledby` | `string` | `undefined` | A reference to an ARIA description of the input field.                            |

#### Outputs

| Name          | Type                                     | Description                                          |
| ------------- | ---------------------------------------- | ---------------------------------------------------- |
| `valueChange` | `EventEmitter<DtTableSearchChangeEvent>` | Event emitted when the user changes the search term. |

## Pagination and show more

The `DtPagination` component can be used in combination with a table to provide
pagination for large datasets.

<ba-live-example name="DtExampleTablePagination" fullwidth></ba-live-example>

In some use cases we might not know how much data we have in total. In this case
a `DtShowMore` componenent might be more suitable.

<ba-live-example name="DtExampleTableShowMore" fullwidth></ba-live-example>

## Sorting, paging and filtering out of the box with DtTableDataSource

Merging the streams for sorting, filtering and pagination can get quite tricky.
The `DtTableDataSource` has all this features already set up.

Unified sorting (locale-aware for strings, null/undefined value treatment) is
possible when using the DtTableDataSource. To do this, create a new
`DtTableDataSource` instance with the data. You will have to connect the input
instances for `dtSort` to the `DtTableDataSource`.

```ts
@Component({
  template: `
    <input dtInput (input)="updateFilter($event)" />
    <dt-table [dataSource]="dataSource" dtSort #sortable>
      [... column and row definitions]
    </dt-table>
    <dt-pagination></dt-pagination>
  `,
})
export class TableComponent implements OnInit {
  // Get the viewChild to pass the sorter, pagination, and filter reference to the datasource.
  @ViewChild('sortable', { read: DtSort, static: true }) sortable: DtSort;
  @ViewChild(DtPagination, { static: true }) pagination: DtPagination;

  // Create the Datasource instanciate it.
  dataSource: DtTableDataSource<object>;
  constructor() {
    this.dataSource = new DtTableDataSource(this.data);
  }

  ngOnInit(): void {
    // Set the dtSort reference on the dataSource, so it can react to sorting.
    this.dataSource.sort = this.sortable;
    // Set the dtPagination reference on the dataSource, so it can page the data.
    this.dataSource.pagination = this.pagination;
    // Set the pageSize to override the default page size.
    this.dataSource.pageSize = 10;
  }

  updateFilter(event: InputEvent): void {
    this.dataSource.filter = event.srcElement.value;
  }
}
```

The `DtTableDataSource` exposes two functions, that let the user define sort
accessors for named columns. This enables the user to leverage
`DtTableDataSource` sorting without the use of `dt-simple-columns`. The function
`addSortAccessorFunction(columnName: string, fn: DtSortAccessorFunction)` can be
used to add a custom sortAccessor function to the data source. The custom added
sort accessors takes precedence over the automatically added ones from
`dt-simple-columns`.

The function `removeSortAccessorFunction(columnName: string)` enables the user
to remove a previously defined sortAccessor function.

```ts
export class TableComponent implements OnInit, OnDestroy {
  //...
  // Create the Datasource instanciate it.
  dataSource: DtTableDataSource<object>;
  constructor() {
    this.dataSource = new DtTableDataSource(this.data);
    this.dataSource.addSortAccessorFunction('memory', (row) => {
      return (row.memoryPerc / 100) * row.memoryTotal;
    });
  }

  ngOnDestroy() {
    // Not necessary, but possible
    this.dataSource.removeSortAccessorFunction('memory');
  }
}
```

The `DtTableDataSource` also exposes two functions, that let the user define
custom comparators for named columns. This enables the user to leverage
`DtTableDataSource` comparing without the use of `dt-simple-columns`. The
function
`addComparatorFunction(columnName: string, fn: DtColumnComparatorFunction)` can
be used to add a custom comparator function to the data source. The custom added
comparator takes precedence over defined sortAccessor functions.

The function `removeComparatorFunction(columnName: string)` enables the user to
remove a previously defined comparator function.

<ba-live-example name="DtExampleTableComparators" fullwidth></ba-live-example>

## Expandable table rows

To show more details in context of a single table row, use expandable rows. They
can be defined using the `dt-expandable-row` component. An expandable row **has
to** contain a column with a details cell. A details cell can be added using
`dt-expandable-cell`. The content inside the `dt-expandable-row` needs to be
wrapped inside a `ng-template` with the `dtExpandableRowContent` directive to
lazy load the content when the row is expanded.

<ba-ux-snippet name="table-expandable"></ba-ux-snippet>

<ba-live-example name="DtExampleTableExpandableRows" fullwidth></ba-live-example>

| Component/Attribute               | Type      | Description                                                                                                                               |
| --------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `dt-expandable-row`               | Component | Placeholder for the expandable data rows. It is a container for the cell outlet and an expandable section. Adds the right class and role. |
| `dt-expandable-cell`              | Component | Adds the appropriate classes, role and content for the details cell in an expandable table.                                               |
| `ng-template dtExpandableContent` | Directive | Wraps the content of the expandable row for lazy loading                                                                                  |

Use the table's `multiExpand` input to allow multiple rows to be expanded at a
time. The expanded state of an expandable row can be set programmatically by
using the row's `expanded` input.

### DtExpandableRow

#### Inputs

| Name       | Type      | Default | Description                         |
| ---------- | --------- | ------- | ----------------------------------- |
| `expanded` | `boolean` | `false` | Whether the row is expanded or not. |

#### Outputs

| Name           | Type                                        | Description                                             |
| -------------- | ------------------------------------------- | ------------------------------------------------------- |
| `expandChange` |  `EventEmitter<DtExpandableRowChangeEvent>` |  Event emitted when the row's expandable state changes. |
| `expanded`     |  `EventEmitter<DtExpandableRow>`            |  Event emitted when the row is expanded.                |
| `collapsed`    |  `EventEmitter<DtExpandableRow>`            |  Event emitted when the row is collapsed.               |

### DtExpandableCell

Expandable rows have to contain one column definition which contains a
`dt-expandable-cell`. Its `aria-label` or `aria-labelledby` input describes the
action of toggling the state of the expandable row. A sample column definition
for the details column could look like this:

```html
<ng-container dtColumnDef="details" dtColumnAlign="control">
  <dt-header-cell *dtHeaderCellDef>Details</dt-header-cell>
  <dt-expandable-cell
    *dtCellDef
    ariaLabel="Expand the row"
  ></dt-expandable-cell>
</ng-container>
```

<ba-ux-snippet name="table-expandable-content-limitation"></ba-ux-snippet>

## States

### Empty state

When there is no data to display an empty state is shown. It can consist of some
text that explains why there is no content and an illustration that helps to
visualize the problem. Pass an empty state to the table using the
`<dt-empty-state>` component or a
[custom empty state](/components/empty-state#custom-empty-state).

<ba-live-example name="DtExampleTableEmptyState" fullwidth></ba-live-example>

### Loading state

You can mark the table as loading using the table's `loading` input and pass the
content to display with `dtTableLoadingState` directive.

<ba-live-example name="DtExampleTableLoading" fullwidth></ba-live-example>

## Problems: errors and warnings

If a table cell contains a problematic value, an indicator is used to highlight
it with the [error (red) status color](/resources/colors/status). Warnings in
tables indicate configuration issues using the
[warning (yellow) status color](/resources/colors/status).

To get an error or warning indicator use the `dtIndicator` directive inside your
`dt-cell` components on any HTML element or on your `dt-cell` component
directly. The `dt-row` and `dt-expandable-row` will pick up if any `dtIndicator`
was used inside the row's `dt-cell` and show the correct indicator. If one
indicator has an `error` state set, the indicator on the row is an error
indicator (i.e. error trumps warning). You can control the active state of the
indicator by using the input named the same as `dtIndicator`.

```html
<dt-cell [dtIndicator]="active" ...></dt-cell>
```

### Single metric problem indication

If a single metric in a table entry is affected, only the affected value is
highlighted.

### Problem indication of entity or table row

If the problem affects the entity, but the affected metric is not in the table,
the entity name is highlighted by the appropriate status color.

**Note:** Don't color hyperlinks even if the whole entity is affected, in this
case use only the indicator on the left.

The example below shows both usages – a single metric inside a cell and the
entire cell enhanced with the `dtIndicator`.

<ba-live-example name="DtExampleTableProblem" fullwidth></ba-live-example>

## Advanced usage

### Sticky header

To make the table header sticky, set the `sticky` input on the `dtHeaderRowDef`
directive.

```html
<dt-header-row
  *dtHeaderRowDef="['username', 'age', 'title']; sticky: true"
></dt-header-row>
```

<ba-live-example name="DtExampleTableStickyHeader" fullwidth></ba-live-example>

### Custom column width

The column width proportion can be customized using the `dtColumnProportion`
attribute. It accepts a number input, e.g. `[dtColumnProportion]="2"` means that
this column's width will be doubled compared to the regular ones.

<ba-live-example name="DtExampleTableColumnProportion" fullwidth></ba-live-example>

The column's minimum width can be set using the `dtColumnMinWidth` attribute. It
accepts a CSS string describing the minimum width for the column.
`[dtColumnMinWidth]="200"` means that this column's width will be at least
200px.

<ba-live-example name="DtExampleTableColumnMinWidth" fullwidth></ba-live-example>

### Dynamic columns

You can bind the column definitions to an array with a `*ngFor` directive.

<ba-live-example name="DtExampleTableDynamicColumns" fullwidth></ba-live-example>

### Interactive rows

To apply a hover effect for the table rows add `interactiveRows` on the
`dt-table` component.

<ba-live-example name="DtExampleTableInteractiveRows" fullwidth></ba-live-example>

### Tables with two lines per row

If you want to have 2 lines of text and maybe an icon inside a row you can use
the `<dt-info-group>` component. You can also take a look at the
`<dt-info-group>` component's page for further information.

<ba-live-example name="DtExampleTableWithInfoGroupCell" fullwidth></ba-live-example>

### Responsive table

Since some tables might have a lot of data in them and screen space is very
limited especially on devices with smaller screens you might want to switch
between a table with expandable rows and normal rows. The example below shows a
very simple approach how this might be done.

<ba-live-example name="DtExampleTableResponsive" fullwidth></ba-live-example>

### Observable as data source

You can pass an observable to the [dataSource] property.

<ba-live-example name="DtExampleTableObservable" fullwidth></ba-live-example>

### Extending DtSimpleColumn

You can extend from the simpleColumn to create your own predefined simplecolumn.
To do this, simply extend from the `DtSimpleColumnBase<T>` abstract class and
implement the deviation that suits your needs. A basic template for the
simpleColumn could look like this (example from the `dt-simple-number-column`).

```html
<ng-container [dtColumnDef]="name" dtColumnAlign="number">
  <ng-container *dtHeaderCellDef>
    <dt-header-cell *ngIf="!sortable">{{ label || name }}</dt-header-cell>
    <dt-header-cell *ngIf="sortable" dt-sort-header start="desc">
      {{ label || name }}
    </dt-header-cell>
  </ng-container>
  <dt-cell
    *dtCellDef="let data"
    [dtIndicator]="_getIndicator(data, name)"
    [dtIndicatorColor]="_getIndicator(data, name)"
  >
    {{ _getData(data) }}
  </dt-cell>
</ng-container>
```

<ba-ux-snippet name="table-in-use"></ba-ux-snippet>
