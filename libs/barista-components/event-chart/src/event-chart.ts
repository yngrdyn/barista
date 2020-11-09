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

// tslint:disable: template-cyclomatic-complexity
import { ENTER } from '@angular/cdk/keycodes';
import {
  ConnectedPosition,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import {
  DomPortalOutlet,
  PortalOutlet,
  TemplatePortal,
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  ContentChildren,
  ElementRef,
  Inject,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  dtSetUiTestAttribute,
  DtUiTestConfiguration,
  DtViewportResizer,
  DT_UI_TEST_CONFIG,
  isDefined,
  _readKeyCode,
} from '@dynatrace/barista-components/core';
import { ScaleLinear, scaleLinear, ScaleTime, scaleTime } from 'd3-scale';
import { merge, Subject } from 'rxjs';
import {
  startWith,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
} from 'rxjs/operators';
import {
  DtEventChartColors,
  DtEventChartEvent,
  DtEventChartLane,
  DtEventChartLegendItem,
  DtEventChartOverlay,
  DtEventChartSelectedEvent,
  DT_EVENT_CHART_COLORS,
} from './event-chart-directives';
import { DtEventChartLegend } from './event-chart-legend';
import { dtCreateEventPath } from './merge-and-path/create-event-path';
import { dtEventChartMergeEvents } from './merge-and-path/merge-events';
import { RenderEvent } from './render-event.interface';
import {
  DtTimeUnit,
  DtFormattedValue,
  formatDuration,
} from '@dynatrace/barista-components/formatters';

const EVENT_BUBBLE_SIZE = 16;
const EVENT_BUBBLE_SPACING = 4;

const EVENT_BUBBLE_OVERLAP_THRESHOLD = EVENT_BUBBLE_SIZE / 2;
const TICK_HEIGHT = 24;
const TICK_WIDTH = 100;

const LANE_HEIGHT = EVENT_BUBBLE_SIZE * 3;

let patternDefsOutlet: PortalOutlet;

const OVERLAY_PANEL_CLASS = 'dt-event-chart-overlay-panel';
const OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: EVENT_BUBBLE_SIZE,
  },
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: EVENT_BUBBLE_SIZE,
  },
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: EVENT_BUBBLE_SIZE,
  },
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -EVENT_BUBBLE_SIZE,
  },
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetY: -EVENT_BUBBLE_SIZE,
  },
  {
    originX: 'center',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -EVENT_BUBBLE_SIZE,
  },
];

@Component({
  selector: 'dt-event-chart, dt-sausage-chart',
  exportAs: 'dtEventChart',
  templateUrl: 'event-chart.html',
  styleUrls: ['event-chart.scss'],
  host: {
    class: 'dt-event-chart',
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class DtEventChart<T> implements AfterContentInit, OnInit, OnDestroy {
  /** @internal Template reference for the DtEventChart overlay. */
  @ContentChild(DtEventChartOverlay, { read: TemplateRef })
  // tslint:disable-next-line: no-any
  private _overlay: TemplateRef<any>;

  /** @internal Selection of events passed into the DtEventChart via child components. */
  @ContentChildren(DtEventChartEvent)
  _events: QueryList<DtEventChartEvent<T>>;

  /** @internal Selection of lanes passed into the DtEventChart via child components. */
  @ContentChildren(DtEventChartLane)
  _lanes: QueryList<DtEventChartLane>;

  /**
   * @internal A clone of the provided lanes in reverse order.
   * The reverse order is necessary to paint them in the right way.
   */
  _lanesReversed: DtEventChartLane[] = [];

  /** @internal Reference to the root svgElement. */
  @ViewChild(DtEventChartLegend, { static: true })
  _legend: DtEventChartLegend<T>;

  /**
   * @internal A list of all legend items that are provided
   * to the DtEventChart. Which of the the legendItems are rendered
   * is defined by the points and lanes drawn.
   */
  @ContentChildren(DtEventChartLegendItem)
  _legendItems: QueryList<DtEventChartLegendItem>;

  /** @internal Reference to the root svgElement. */
  @ViewChild('canvas', { static: true })
  _canvasEl: ElementRef;

  /**
   * @internal
   * Reference to the rendered lane labels.
   * These references are needed to calculate the width of the labels,
   * to determine the effective width of the svgCanvas.
   */
  @ViewChild('laneLabels', { static: true })
  _laneLabelsEl: ElementRef;

  /**
   * @internal
   * Reference to the pattern definitions for the svg.
   */
  @ViewChild('patternDefs', { static: true })
  _patternDefsTemplate: TemplateRef<{ $implicit: string[] }>;

  /** @internal Lanes that are being rendered in the svgCanvas. */
  _renderLanes: { y: number; lane: DtEventChartLane }[] = [];

  /** @internal Events that are being rendered in the svgCanvas. */
  _renderEvents: RenderEvent<T>[] = [];

  /** @internal Svg path definition, which connects all renderEvents. */
  _renderPath: string | null = null;

  /** @internal X axis ticks that are being rendered in the svgCanvas. */
  _renderTicks: { x: number; value: string | DtFormattedValue }[] = [];

  /** @internal The width of the svg. */
  _svgWidth = 0;

  /** @internal The height of the svg. */
  _svgHeight = 0;

  /** @internal The height of the svg plot. */
  _svgPlotHeight = 0;

  /** @internal The viewBox of the svg. Starts at 0/0 and ends at a calculated width and height. */
  _svgViewBox: string;

  /** @internal Selected event index. */
  _selectedEventIndex: number | undefined;

  /** Template portal for the default overlay */
  // tslint:disable-next-line: use-default-type-parameter no-any
  private _portal: TemplatePortal<any> | null;

  /** Reference to the open overlay. */
  private _overlayRef: OverlayRef;

  /** Representation if the overlay is currently pinned. */
  private _overlayPinned = false;

  /** Destroy subject which fires once the component is destroyed. */
  private _destroy$ = new Subject<void>();

  constructor(
    private _resizer: DtViewportResizer,
    private _changeDetectorRef: ChangeDetectorRef,
    private _zone: NgZone,
    private _viewContainerRef: ViewContainerRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector,
    private _overlayService: Overlay,
    @Inject(DOCUMENT) private _document: any,
    private _platform: Platform,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(DT_UI_TEST_CONFIG)
    private _config?: DtUiTestConfiguration,
  ) {}

  ngOnInit(): void {
    this._tryCreatePatternDefs();
  }

  ngAfterContentInit(): void {
    // Get all state-changes events from the dt-event-chart-event content children.
    const eventChanges$ = this._events.changes.pipe(
      takeUntil(this._destroy$),
      switchMap(() =>
        merge(...this._events.map((e) => e._stateChanges$)).pipe(
          startWith(null),
        ),
      ),
    );
    // Get all state-changes events from the dt-event-chart-lane content children.
    const laneChanges$ = this._lanes.changes.pipe(
      takeUntil(this._destroy$),
      switchMap(() =>
        merge(...this._lanes.map((e) => e._stateChanges$)).pipe(
          startWith(null),
        ),
      ),
    );

    this._legendItems.changes
      .pipe(startWith(), takeUntil(this._destroy$))
      .subscribe(() => {
        // We need to listen to changes within the user defined legend-items, to react
        // on changing legend-items. The consumer defined items are used to
        // determine which legend-items need to be rendered in the
        // _updateRenderLegendItems function.
        this._legend._updateRenderLegendItems();
        this._changeDetectorRef.markForCheck();
      });

    // Combine all state-changes events from events and lanes to be notified
    // about all value or configuration changes in the content children.
    const contentChanges$ = merge(eventChanges$, laneChanges$).pipe(
      startWith(null),
      takeUntil(this._destroy$),
    );

    // As we need to render the lane labels, which are content children,
    // before the actual render of the SVG we need make angular recognize
    // that content children did change, so they are alway checked in the main CD cycle.
    contentChanges$.subscribe(() => {
      // Save a reversed version of the lanes, as they need to be drawn that way.
      this._lanesReversed = this._lanes.toArray().reverse();
      this._changeDetectorRef.markForCheck();
    });

    merge(contentChanges$, this._resizer.change())
      .pipe(
        // Shift the updating/rendering of the SVG to the next CD cycle,
        // because we need the dimensions of the labels first, which are rendered in the main cycle.
        switchMapTo(this._zone.onStable.pipe(take(1))),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        // Because we are waiting for the next zoneStable cycle to actually update
        // the template, we need to explicitly run this inside the zone
        // otherwise, the zone will not care about any events emitted from
        // the template bindings.
        this._zone.run(() => {
          this._update();
        });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Select an event based on its index in the event data list.
   */
  select(index: number): void {
    // If the index is outside the selectable range
    // do not select anything.
    if (index < 0 || index > this._events.length) {
      return;
    }
    this._selectedEventIndex = index;
    this._changeDetectorRef.markForCheck();
  }

  /** Deselect events, which effectively clears the selection on the event chart. */
  deselect(): void {
    this._selectedEventIndex = undefined;
    this._changeDetectorRef.markForCheck();
  }

  /** Programmatically close the overlay. */
  closeOverlay(): void {
    this._dismissOverlay();
  }

  _isSelected(renderEvent: RenderEvent<T>): boolean {
    return (
      renderEvent.originalIndex === this._selectedEventIndex ||
      (renderEvent.mergedWith || []).includes(this._selectedEventIndex!)
    );
  }

  /** @internal Handle the keyDown event on the svg RenderEvent bubble. */
  _handleEventKeyDown(
    keyEvent: KeyboardEvent,
    renderEvent: RenderEvent<T>,
  ): void {
    const key = _readKeyCode(keyEvent);
    if (key === ENTER) {
      keyEvent.preventDefault();
      this._eventSelected(keyEvent, renderEvent);
    }
  }

  /**
   * @internal Emits the data of the selected event and
   * registers the event as selected.
   */
  _eventSelected(
    event: MouseEvent | KeyboardEvent,
    renderEvent: RenderEvent<T>,
  ): void {
    const sources = new DtEventChartSelectedEvent(renderEvent.events);
    // If merged events are in the list, the selected event is only triggered on the
    // first (and hence displayed) event bubble.
    const representingEvent = this._getRepresentingEvent(renderEvent);
    representingEvent.selected.emit(sources);

    // Select the rendered event
    this._selectedEventIndex = renderEvent.originalIndex;

    // Pin the overlay
    const origin = this.getOriginFromInteractionEvent(event);
    this._pinOverlay(origin, renderEvent);

    // Update the renderEventsArray to force a repaint
    this._changeDetectorRef.markForCheck();
  }

  /** @internal Reset the event selection and unpins the overlay */
  _resetEventSelection(): void {
    this._selectedEventIndex = undefined;
  }

  /**
   * @internal
   * Calculate the svg path for the selected renderEvent.
   * This needs to be a path, as events with duration can also be
   * selected and the border around it should still encase the load event as
   * well. The path will be a rectangle with rounded corners.
   */
  _calculateEventOutline(
    renderEvent: RenderEvent<T>,
    offset: number = 0,
  ): string {
    // tslint:disable-next-line: no-magic-numbers
    const eventBubbleRadius = EVENT_BUBBLE_SIZE / 2 + offset;

    const path: string[] = [];
    // Move to start position
    path.push(`M ${renderEvent.x1 - eventBubbleRadius} ${renderEvent.y}`);
    // Curve up from center to top left
    path.push(
      `A ${eventBubbleRadius} ${eventBubbleRadius} 0 0 1 ${renderEvent.x1} ${
        renderEvent.y - eventBubbleRadius
      }`,
    );
    // Path the top border
    path.push(`H ${renderEvent.x2}`);
    // Curve to down from top right to center
    path.push(
      `A ${eventBubbleRadius} ${eventBubbleRadius} 0 0 1 ${
        renderEvent.x2 + eventBubbleRadius
      } ${renderEvent.y}`,
    );
    // Curve to down from center to bottom right
    path.push(
      `A ${eventBubbleRadius} ${eventBubbleRadius} 0 0 1 ${renderEvent.x2} ${
        renderEvent.y + eventBubbleRadius
      }`,
    );
    // Path the bottom border
    path.push(`H ${renderEvent.x1}`);
    // Curve to up from bottom left to center
    path.push(
      `A ${eventBubbleRadius} ${eventBubbleRadius} 0 0 1 ${
        renderEvent.x1 - eventBubbleRadius
      } ${renderEvent.y}`,
    );
    return path.join(' ');
  }

  /** @internal Returns the primary DtEventChartEvent of a list of DtEventChartEvents. */
  _getRepresentingEvent(renderEvent: RenderEvent<T>): DtEventChartEvent<T> {
    return renderEvent.events[0];
  }

  /** @internal Handles the mouseEnter event on a svg RenderEvent bubble. */
  _handleEventMouseEnter(event: MouseEvent, renderEvent: RenderEvent<T>): void {
    if (!this._overlayPinned) {
      this._createOverlay();
      const origin = this.getOriginFromInteractionEvent(event);
      this._updateOverlay(origin, renderEvent);
    }
  }

  /** @internal Handles the mouseLeave event on a svg RenderEvent bubble. */
  _handleEventMouseLeave(): void {
    if (this._overlayRef && !this._overlayPinned) {
      this._dismissOverlay();
    }
  }

  /**
   * Track by function for the renderEvents – speeds up performance
   * and prevent deletion of mouseout
   */
  _renderEventTrackByFn(index: number, _item: RenderEvent<T>): number {
    return index;
  }

  /** Creates the overlay and attaches it. */
  private _createOverlay(pin: boolean = false): void {
    // If we do not have an overlay defined, we do not need to attach it
    if (!this._overlay) {
      return;
    }

    // Create the template portal
    if (!this._portal) {
      // tslint:disable-next-line: no-any
      this._portal = new TemplatePortal<any>(
        this._overlay,
        this._viewContainerRef,
        { $implicit: [] },
      );
    }

    const overlayConfig = new OverlayConfig({
      panelClass: OVERLAY_PANEL_CLASS,
      hasBackdrop: pin,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this._overlayRef = this._overlayService.create(overlayConfig);
    this._overlayPinned = pin;
    // Subscribe to the backdrop click, to actually close the overlay again.
    if (pin) {
      this._overlayRef
        .backdropClick()
        .pipe(take(1))
        .subscribe(() => {
          this._dismissOverlay();
          this._resetEventSelection();
          this._changeDetectorRef.markForCheck();
        });
    }

    // If the portal is not yet attached to the overlay, attach it.
    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._portal);
    }
    dtSetUiTestAttribute(
      this._overlayRef.overlayElement,
      this._overlayRef.overlayElement.id,
      this._elementRef,
      this._config,
    );
  }

  /** Update the overlay position and the implicit context. */
  private _updateOverlay(
    origin: { x: number; y: number },
    renderEvent: RenderEvent<T>,
  ): void {
    // If there is no overlay defined, we don't need
    // to run the update call.
    if (!this._overlay) {
      return;
    }

    const updatedPositionStrategy = this._overlayService
      .position()
      .flexibleConnectedTo(origin)
      .setOrigin(origin)
      .withPositions(OVERLAY_POSITIONS)
      .withFlexibleDimensions(true)
      .withPush(false)
      .withGrowAfterOpen(true)
      .withViewportMargin(0)
      .withLockedPosition(false);
    this._overlayRef.updatePositionStrategy(updatedPositionStrategy);

    if (this._portal) {
      this._portal.context.$implicit = renderEvent.events;
    }
  }

  /** Pins the overlay in place. */
  private _pinOverlay(
    origin: { x: number; y: number },
    renderEvent: RenderEvent<T>,
  ): void {
    this._dismissOverlay();
    this._createOverlay(true);
    this._updateOverlay(origin, renderEvent);
  }

  /** Dismisses the overlay. */
  private _dismissOverlay(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayPinned = false;
      this._portal = null;
    }
  }

  /**
   * Calculates the origin for the overlay based on the target of the
   * event passed into it.
   */
  private getOriginFromInteractionEvent(
    event: KeyboardEvent | MouseEvent,
  ): { x: number; y: number } {
    // Update the position for the overlay.
    const originBB = (event.target as SVGElement).getBoundingClientRect();
    return {
      // tslint:disable-next-line: no-magic-numbers
      x: originBB.left + originBB.width / 2,
      // tslint:disable-next-line: no-magic-numbers
      y: originBB.top + originBB.height / 2,
    };
  }

  /**
   * Updates all the data and internals that are needed
   * to render the dtEventChart correctly.
   */
  private _update(): void {
    const [min, max] = this._getMinMaxValuesOfEvents();
    // Note: Do not move update calls.
    // The call order is important!
    this._updateDimensions();
    this._updateRenderLanes();
    this._updateRenderEvents(min, max);
    this._updateRenderPath();
    this._updateTicks(min, max);
    this._changeDetectorRef.detectChanges();
  }

  /** Updates the dimensions of the SVG itself, its plot area and the view box. */
  private _updateDimensions(): void {
    const canvasEl = this._canvasEl.nativeElement as HTMLElement;
    if (canvasEl && this._platform.isBrowser) {
      const canvasWidth = canvasEl.clientWidth;
      // tslint:disable-next-line: no-magic-numbers
      this._svgPlotHeight = this._lanes.length * LANE_HEIGHT + 3;
      // We need to make sure we are in the browser, before updating the dimensions
      this._svgHeight = this._svgPlotHeight + TICK_HEIGHT;
      this._svgWidth = canvasWidth;
      this._svgViewBox = `0 0 ${canvasWidth} ${this._svgHeight}`;
    }
  }

  /** Updates the lane objects that are actually used for rendering. */
  private _updateRenderLanes(): void {
    let y = 1;
    this._renderLanes = this._lanes
      .map((lane) => {
        const renderLane = { lane, y };
        y += LANE_HEIGHT + 1;
        return renderLane;
      })
      .reverse();
  }

  /** Updates the event objects that are actually used for rendering. */
  private _updateRenderEvents(min: number, max: number): void {
    const events = this._events
      .toArray()
      .sort((eventA, eventB) => eventA.value - eventB.value);
    const scale = this._getScaleForEvents(min, max);

    const renderEvents: RenderEvent<T>[] = [];
    for (const event of events) {
      const lane = this._getLaneByName(event.lane);
      if (lane) {
        const lanePos = this._getLanePosition(lane);
        if (lanePos !== -1) {
          // The Y of a bubble is the sum of all lane heights
          // before the lane where the bubble is located
          // plus half of the height of the current lane.
          // tslint:disable-next-line: no-magic-numbers
          const y = lanePos * (LANE_HEIGHT + 1) + LANE_HEIGHT / 2;

          const x1 = scale(event.value);
          let x2 = x1;

          // If the event has a duration the event is a sausage instead of a
          // single point, which means we need to calculate the x value
          // of the events end.
          if (event.duration) {
            x2 = scale(event.value + event.duration);
          }

          // Determine the color of the RenderEvent based on
          // the eventColor or laneColor
          let color = isValidColor(lane.color) ? lane.color : 'default';
          if (isValidColor(event.color)) {
            color = event.color;
          }

          renderEvents.push({
            x1,
            x2,
            y,
            lane: event.lane,
            color,
            pattern: lane.pattern,
            events: [event],
          });
        }
      }
    }

    this._renderEvents = dtEventChartMergeEvents<T>(
      renderEvents,
      EVENT_BUBBLE_OVERLAP_THRESHOLD,
    );
  }

  /** Generates and updates the path that connects all the render events. */
  private _updateRenderPath(): void {
    this._renderPath = dtCreateEventPath<T>(this._renderEvents);
  }

  /** Generates and updates the ticks for the x-axis. */
  private _updateTicks(min: number, max: number): void {
    const timeScale = this._getTimeScaleForEvents(min, max);

    const tickAmount = Math.floor(
      (timeScale.range()[1] - timeScale.range()[0]) / TICK_WIDTH,
    );
    const dateTicks = timeScale.ticks(tickAmount);
    this._renderTicks = dateTicks.map((date) => {
      const timestamp = date.getTime();
      return {
        x: timeScale(timestamp),
        value: this._formatRelativeTimestamp(timestamp),
      };
    });
  }

  /**
   * Generate a linear scale function based on all values provided
   * by the events.
   */
  private _getScaleForEvents(
    min: number,
    max: number,
  ): ScaleLinear<number, number> {
    const bubbleRadius = EVENT_BUBBLE_SIZE / 2;

    return scaleLinear()
      .domain([min, max])
      .range([
        bubbleRadius + 1 + EVENT_BUBBLE_SPACING,
        this._svgWidth - 1 - EVENT_BUBBLE_SPACING - bubbleRadius,
      ]);
  }

  /**
   * Generate a time based scale function based on the event values.
   * This scale function should only be used for the time based x-axis.
   * Use the _getScaleForEvents for all the other use cases
   */
  private _getTimeScaleForEvents(
    min: number,
    max: number,
  ): ScaleTime<number, number> {
    const bubbleRadius = EVENT_BUBBLE_SIZE / 2;
    return scaleTime()
      .domain([new Date(0), new Date(max - min)])
      .range([
        bubbleRadius + 1 + EVENT_BUBBLE_SPACING,
        this._svgWidth - 1 - EVENT_BUBBLE_SPACING - bubbleRadius,
      ])
      .nice();
  }

  /**
   * Find the minimum and maximum values of the provided events.
   * These min and max values are basically the range of the chart.
   */
  private _getMinMaxValuesOfEvents(): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    if (this._events) {
      for (const event of this._events.toArray()) {
        const eventEnd = event.duration
          ? event.value + event.duration
          : event.value;
        min = event.value < min ? event.value : min;
        max = eventEnd > max ? eventEnd : max;
      }
    }
    return [min, max];
  }

  /** Tries to find a lane base on a provided name. */
  private _getLaneByName(name: string): DtEventChartLane | null {
    return this._lanes.find((lane) => lane.name === name) || null;
  }

  /** Returns the position (reversed index) of a lane. */
  private _getLanePosition(lane: DtEventChartLane): number {
    return this._lanesReversed.indexOf(lane);
  }

  private _tryCreatePatternDefs(): void {
    if (patternDefsOutlet || !this._document) {
      return;
    }

    const patternHost = this._document.createElement('div');
    // Move off-canvas so it does not overlap elements

    Object.defineProperty(patternHost, 'style', {
      value: 'pointer-events: none; position: absolute; left: -999px;',
    });

    this._document.body.appendChild(patternHost);

    const portal = new TemplatePortal(
      this._patternDefsTemplate,
      this._viewContainerRef,
      { $implicit: [...DT_EVENT_CHART_COLORS, 'hovered'] },
    );
    const outlet = new DomPortalOutlet(
      patternHost,
      this._componentFactoryResolver,
      this._appRef,
      this._injector,
    );

    outlet.attachTemplatePortal(portal);

    patternDefsOutlet = outlet;
  }

  /** Formats a relative timestamp into a readable text. */
  private _formatRelativeTimestamp(
    timestamp: number,
  ): string | DtFormattedValue {
    // TODO: once duration pipe returns a nice value maybe the unit is automatically chosen
    let outputUnit = DtTimeUnit.SECOND;

    const sec = 1000;
    const min = sec * 60;
    const hour = min * 60;
    const day = hour * 24;

    if (timestamp >= day) {
      outputUnit = DtTimeUnit.DAY;
    } else if (timestamp >= hour) {
      outputUnit = DtTimeUnit.HOUR;
    } else if (timestamp >= min) {
      outputUnit = DtTimeUnit.MINUTE;
    } else if (timestamp >= sec) {
      outputUnit = DtTimeUnit.SECOND;
    }

    return formatDuration(timestamp, 'PRECISE', outputUnit);
  }
}

/** Determines if a passed parameter is part of the DtEventChartColors. */
// tslint:disable-next-line: no-any
function isValidColor(color: any): color is DtEventChartColors {
  return isDefined(color) && DT_EVENT_CHART_COLORS.indexOf(color) !== -1;
}
