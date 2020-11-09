# Toggle button group

The toggle button component is used for highlighting a subset of information in
a complex view by desaturating all other information.

A toggle button holds an icon and a text indicating what will be highlighted
when clicked.

<ba-live-example name="DtExampleToggleButtonGroupDefault"></ba-live-example>

## Imports

You have to import the `DtToggleButtonGroupModule` when you want to use the
`<dt-toggle-button-group>`:

```typescript
@NgModule({
  imports: [DtToggleButtonGroupModule],
})
class MyModule {}
```

## Initialization

The `<dt-toggle-button-group>` is a wrapping container for all
`<dt-toggle-button-item>` components. A `<dt-toggle-button-item>` cannot
function without a group as it is the group that is managing the toggling state.
The group can hold any content and is not limited to `dt-toggle-button-item`s.

The `<dt-toggle-button-item>` can hold any content which will be rendered into
the right part of the component. It also has a dedicated section for the icon on
the left hand side:

- `<dt-toggle-button-item-icon>` should be filled only with a `dt-icon` which
  will be styled and rendered according to the toggle-button-group container.

## DtToggleButtonGroup

### Outputs

| Name     | Type                                    | Description                                                                                                                                                                                                      |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `change` | `EventEmitter<DtToggleButtonChange<T>>` | EventEmitter that fires every time the selection changes. `DtToggleButtonChange` is an interface for the following object signature: `{ source: DtToggleButtonItem<T>, value: T | null, isUserInput: boolean }`. |

### Methods

| Name           | Type                    | Default | Description                                                                                             |
| -------------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `selectedItem` | `DtToggleButtonItem<T>` | -       | Getter to access the currently selected `DtToggleButtonItem<T>` instance or `null` if none is selected. |
| `value`        | `<T>`                   | null    | Getter to access the currently selected value.                                                          |

## DtToggleButtonItem

### Inputs

| Name               | Type      | Default | Description                                                                                                                                   |
| ------------------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `selected`         | `boolean` | `false` | Whether or not the `DtToggleButtonItem` is selected.                                                                                          |
| `value`            | `<T>`     | `null`  | Value of the `DtToggleButtonItem`.                                                                                                            |
| `tabIndex`         | `number`  | 0       | Sets the tabIndex of the `DtToggleButtonItem`. If the item is disabled, tabIndex will be set to -1 to remove it from the keyboard navigation. |
| `disabled`         | `boolean` | `false` | Disables the `DtToggleButtonItem`.                                                                                                            |
| `aria-label`       | `string`  | -       | String that will be applied as an aria label on the `DtToggleButtonItem`.                                                                     |
| `aria-labelledby`  | `string`  | -       | One or more DOM element ids that label the `DtToggleButtonItem`. If multiple values are given, please use a space separated list.             |
| `aria-describedby` | `string`  | -       | One DOM element id that describes the actions taken by selecting the `DtToggleButtonItem`.                                                    |

### Outputs

| Name     | Type                                    | Description                                                                     |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `change` | `EventEmitter<DtToggleButtonChange<T>>` | EventEmitter that fires when the selection of the `DtToggleButtonItem` changes. |

### Methods

| Name       | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| `focus`    | Function to programatically call focus on a `DtToggleButtonItem`. |
| `select`   | Function to programmatically select on a `DtToggleButtonItem`.    |
| `deselect` | Function to programmatically deselect on a `DtToggleButtonItem`.  |

## Behavior

When a toggle button is clicked, the toggle button is set into active state and
all information except the subset of information of the toggle button is
desaturated.

Only one toggle button in a group can be selected at the same time.

If the toggle buttons do not fit the available space within a toggle button
group, the button of the last visible row is replaced by a "show all" link. As
soon as the "show all" button is clicked, the remaining toggle buttons will be
added to the end of the group.

<ba-live-example name="DtExampleToggleButtonGroupShowMore"></ba-live-example>

### Adding toggle button items

Items can be added dynamically to a toggle button group.

<ba-live-example name="DtExampleToggleButtonGroupDynamicItems"></ba-live-example>

## Toggle button group in use

The toggle button group is placed on top of complex content within a card (e.g.
a lot of entities, a complicated sequence of actions, etc.).

A toggle button item always has 16px vertical and horizontal margin to the next
one.

In the example below, the toggle button is used to highlight CDN resources in a
waterfall view.

<!-- TODO: example -->

![Toggle button group example](https://d24pvdz4mvzd04.cloudfront.net/test/toggle-button-group-example-1189-78a0538c99.png)
