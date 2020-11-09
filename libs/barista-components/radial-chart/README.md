# Radial chart

<ba-ux-snippet name="radial-chart-intro"></ba-ux-snippet>

<ba-ux-snippet name="radial-chart-pie"></ba-ux-snippet>

<ba-live-example name="DtExampleRadialChartDefaultPie"></ba-live-example>

<ba-ux-snippet name="radial-chart-donut"></ba-ux-snippet>

<ba-live-example name="DtExampleRadialChartDefaultDonut"></ba-live-example>

## Imports

You have to import the `DtRadialChartModule` when you want to use the
`<dt-radial-chart>`:

```typescript
@NgModule({
  imports: [DtRadialChartModule],
})
class MyModule {}
```

## DtRadialChart inputs

| Name               | Type                     | Default      | Description                                                                                                                        |
| ------------------ | ------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `type`             | `'pie' | 'donut'`        | `'pie'`      | The chart type; can be either a pie chart or a donut chart.                                                                        |
| `maxValue`         | `number`                 | `null`       | The maximum chart value that defines the full circle. If not set the maximum value is equal to the sum of all chart series values. |
| `legendPosition`   | `'right' | 'bottom'`     | `right`      | Defines where the chart's legend is placed.                                                                                        |
| `valueDisplayMode` | `'absolute' | 'percent'` | `'absolute'` | Mode of value visualization. It can be `percent` or `absolute`.                                                                    |
| `selectable`       | `boolean`                | false        | Sets the display mode for the sunburst-chart values to either 'percent' or 'absolute'.                                             |

### Max value

When no maximum value is given, all series data add up to 100%, i.e. a full
circle. It's optional to define a maximum value. If the sum of all series values
is below this value, the missing part of the circle is filled with a background
color. If the sum of all series values is above the defined maxium value, this
value is ignored.

<ba-live-example name="DtExampleRadialChartMaxValue"></ba-live-example>

### Legend

A radial chart always needs a legend. It uses the legend component internally.
You can specify the position of the radial chart by adjusting the value of the
`legendPosition` input.

<ba-live-example name="DtExampleRadialChartLegend"></ba-live-example>

## DtRadialChartSeries inputs

| Name            | Type      | Default                             | Description                                                      |
| --------------- | --------- | ----------------------------------- | ---------------------------------------------------------------- |
| `value`         | `number`  | -                                   | The series value (required).                                     |
| `name`          | `string`  | -                                   | The series name (required).                                      |
| `color`         | `string`  | `DT_CHART_COLOR_PALETTE_ORDERED[i]` | The color in which the series is displayed within the chart.     |
| `valueRelative` | `number`  | -                                   | Numeric percentage value based on this node vs sum of top level. |
| `selected`      | `boolean` | false                               | Marks series as selected.                                        |
| `active`        | `boolean` | true                                | Marks series as activated through legend.                        |

#### Outputs

| Name             | Type                    | Description                   |
| ---------------- | ----------------------- | ----------------------------- |
| `selectedChange` | `EventEmitter<boolean>` | Emits when event is selected. |

### Series color

Each series can have a custom color. When no color is given for a series, the
predefined chart colors are used.

<ba-live-example name="DtExampleRadialChartCustomColors"></ba-live-example>

## Overlay

A radial chart can have an overlay to display detailed information about the
series.

<ba-live-example name="DtExampleRadialChartOverlay"></ba-live-example>
