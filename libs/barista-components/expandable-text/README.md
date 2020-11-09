# Expandable text

<ba-ux-snippet name="expandable-text-intro"></ba-ux-snippet>

<ba-live-example name="DtExampleExpandableTextDefault"></ba-live-example>

## Imports

You have to import the `DtExpandableTextModule` when you want to use the
`<dt-expandable-text>`:

```typescript
@NgModule({
  imports: [DtExpandableTextModule],
})
class MyModule {}
```

## Initialization

To apply the Dynatrace expandable text, use the `<dt-expandable-text>` element.

| Attribute            | Description                             |
| -------------------- | --------------------------------------- |
| `dt-expandable-text` | The expandable text but without styling |

## Inputs

| Name         | Type      | Default                              | Description                               |
| ------------ | --------- | ------------------------------------ | ----------------------------------------- |
| `expanded`   | `boolean` | `false`                              | Sets the text's expanded state.           |
| `id`         | `string`  | `dt-expandable-text-{rollingnumber}` | Sets a unique id for the expandable text. |
| `label`      | `string`  |                                      | Sets the label of the expand-button       |
| `labelClose` | `string`  |                                      | Sets the label of the collapse-button     |

## Outputs

| Name            | Type                    | Description                                     |
| --------------- | ----------------------- | ----------------------------------------------- |
| `expandChanged` | `Eventemitter<boolean>` | Emits and event when the expandedstate changes. |
| `expanded`      | `Eventemitter<void>`    | Event emitted when text is expanded.            |
| `collapsed`     | `Eventemitter<void>`    | Event emitted when text is collapsed.           |

## Methods

| Name     | Return Value | Description                                                                          |
| -------- | ------------ | ------------------------------------------------------------------------------------ |
| `toggle` | `void`       | Toggles the expanded state, i.e. changes it to expanded if collapsed, or vice-versa. |
| `open`   | `void`       | Expands the text.                                                                    |
| `close`  | `void`       | Closes the text.                                                                     |
