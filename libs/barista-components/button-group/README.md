# ButtonGroup

<ba-ux-snippet name="button-group-intro"></ba-ux-snippet>

<ba-live-example name="DtExampleButtonGroupDefault"></ba-live-example>

## Imports

You have to import the `DtButtonGroupModule` when you want to use the
`dt-button-group`

```typescript

@NgModule({
  imports: [
    DtButtonGroupModule,
  ],
}
class MyModule {}

```

## Initialization

To apply the button group component, use the `<dt-button-group>` and
`<dt-button-group-item>` elements.

| Attribute              | Description                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `dt-button-group`      | Wrapper element for the button group. It can contain multiple `<dt-button-group-item>` elements. |
| `dt-button-group-item` | The individual button elements.                                                                  |

## Inputs

| Name       | Type                  | Default     | Description                                                                 |
| ---------- | --------------------- | ----------- | --------------------------------------------------------------------------- |
| `value`    | `T | undefined`       | `undefined` | Gets and sets the current value                                             |
| `disabled` | `boolean | undefined` | `undefined` | Sets disabled state if property is set and the value is truthy or undefined |
| `tabIndex` | `number`              | `0`         | Sets and gets the tabIndex property                                         |

<ba-live-example name="DtExampleButtonGroupInteractive"></ba-live-example>

## Outputs

| Name          | Type       | Description                                          |
| ------------- | ---------- | ---------------------------------------------------- |
| `valueChange` | `event<T>` | Emits an event when the user selects another button. |

## Methods

| Name      | Description                                              | Return value |
| --------- | -------------------------------------------------------- | ------------ |
| `focus()` | Sets focus to the first item in the `<dt-button-group>`. | `void`       |

## Button group item inputs

| Name                    | Type                  | Default     | Description                                                                                            |
| ----------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `<ng-content>`          |                       |             | The content which is displayed inside of the item. This should only be text.                           |
| `value`                 | `T | undefined`       | `undefined` | The associated value of this item                                                                      |
| `disabled`              | `boolean | undefined` | `undefined` | Sets disabled state if property is set and the value is truthy or undefined                            |
| `tabIndex`              | `number`              | `0`         | Sets and gets the tabIndex property                                                                    |
| _deprecated_ `selected` | `boolean`             | `false`     | Sets or gets the selected state of this item                                                           |
| `checked`               | `boolean`             | `false`     | Sets or gets the checked state of this item                                                            |
| `color`                 | `'main' | 'error'`    | `main`      | Sets color. Possible options: <ul><li><code>main</code> (default)</li><li><code>error</code></li></ul> |

The property `selected` is deprecated and will be renamed to `checked` in
version 9.0.0

## Button group item outputs

| Name            | Type                                       | Description                                        |
| --------------- | ------------------------------------------ | -------------------------------------------------- |
| `checkedChange` | `event<DtButtonGroupItemCheckedChange<T>>` | Emits an event when the checked attribute changed. |

## Button group item methods

| Name      | Description                                 | Return value |
| --------- | ------------------------------------------- | ------------ |
| `focus()` | Sets focus to the `<dt-button-group-item>`. | `void`       |

## States

Buttons within a button group have a default, hover, active, focus, and disabled
state.

<ba-live-example name="DtExampleButtonGroupItemDisabled"></ba-live-example>

### Group disabled

The complete button group can be disabled.

<ba-live-example name="DtExampleButtonGroupDisabled"></ba-live-example>

### Error state

A button group can hold buttons in an error state.

<ba-live-example name="DtExampleButtonGroupError"></ba-live-example>

## Button group in use

### Chart tabs

<ba-ux-snippet name="button-group-chart-tabs"></ba-ux-snippet>
