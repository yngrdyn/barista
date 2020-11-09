# Drawer

The drawer is a component designed to add collapsible side content _(often
navigation, though it can be any content)_ alongside some primary content.

<ba-live-example name="DtExampleDrawerDefault"></ba-live-example>

## Imports

You have to import the `DtDrawerModule` when you want to use the `<dt-drawer>`
and `<dt-drawer-container>`. Note that you need Angular's
`BrowserAnimationsModule` if you want to have animations or the
`NoopAnimationsModule` if you don't.

```typescript
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DtDrawerModule } from '@dyntrace/angular-components';

@NgModule({
  imports: [BrowserAnimationsModule, DtDrawerModule],
})
class MyModule {}
```

To use the drawer in your template there are two tags. First of all you need the
`<dt-drawer-container>` that wraps your drawer and the main content. Inside this
container you can put the `<dt-drawer>` tag. Inside the drawer tag you can put
the content that should be pushed to off-canvas.

## Inputs

| Name       | Type      | Default | Description                          |
| ---------- | --------- | ------- | ------------------------------------ |
| `mode`     | `'side'   | 'over'` | `'side'`                             | The behavior of the drawer, can overlay over or shrink the primary content. |
| `position` | `'start'  | 'end'`  | `'start'`                            | Defines if the drawer is on the left or right side in a container. _(A drawer container can only have one drawer per position.)_ |
| `opened`   | `boolean` | `false` | The actual open state of the drawer. |

## Outputs

| Name         | Type                    | Description                                                                                                           |
| ------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `opened`     | `Observable<void>`      | Event emitted when the drawer has been opened.                                                                        |
| `closed`     | `Observable<void>`      | Event emitted when the drawer has been closed.                                                                        |
| `openChange` | `EventEmitter<boolean>` | Emits when the drawer open state changes. Emits a boolean value for the open sate _(true for open, false for close)_. |

## Methods

The following methods are on the `DtDrawer` class:

| Name     | Description        | Return value |
| -------- | ------------------ | ------------ |
| `open`   | Opens the drawer   | `void`       |
| `close`  | Closes the drawer  | `void`       |
| `toggle` | toggles the drawer | `void`       |

The container class `DtDrawerContainer` has follwing methods:

| Name    | Description                             | Return value |
| ------- | --------------------------------------- | ------------ |
| `open`  | Opens all the drawers in the container  | `void`       |
| `close` | Closes all the drawers in the container | `void`       |

## Sidenav

The sidenav components is designed to add side content to a fullscreen app. To
set up a sidenav we use two components: `dt-sidenav-container` which act as a
structural container for our content, sidenav and `dt-sidenav` which represents
the added side content. The component is always at the root of the page.

## Shrinking behaviour

If the `mode` is set to `side`, the drawer will show the side content next to
the primary content, causing the primary content to shrink in width. If the
width of the drawer is less than 1024 pixels, however, it will act as an overlay
on top of the main content instead.

## Basic example

```html
<dt-sidenav-container>
  <dt-sidenav mode="side" opened> Sidenav content </dt-sidenav>
  Main content
</dt-sidenav-container>
```

## Example with custom header

```html
<dt-sidenav-container>
  <dt-sidenav mode="side" opened]>
    <dt-sidenav-header> Title </dt-sidenav-header>
    Sidenav content
  </dt-sidenav>
  Main content
</dt-sidenav-container>
```

## Examples

### Over laying mode Drawer Example

<ba-live-example name="DtExampleDrawerOver"></ba-live-example>

### Dynamic Drawer Example

<ba-live-example name="DtExampleDrawerDynamic"></ba-live-example>

### Nested Drawer Example

<ba-live-example name="DtExampleDrawerNested"></ba-live-example>
