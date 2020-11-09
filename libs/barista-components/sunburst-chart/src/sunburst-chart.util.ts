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

import {
  DtColors,
  DT_CHART_COLOR_PALETTE_ORDERED,
} from '@dynatrace/barista-components/theming';
import { pie, PieArcDatum, arc } from 'd3-shape';

/**
 * DtSunburstChartNode represents a single node within the sunburst datastructure.
 */
export interface DtSunburstChartNode {
  /** Name of the node to be shown */
  label: string;
  /** Optional if it has children. Numeric value used to calculate the slices. If it has children you can skip it and it will be calculated based on them */
  value?: number;
  /** Color to be used */
  color?: DtColors | string;
  /** Array of nodes belonging to this parent */
  children?: DtSunburstChartNode[];
}

/** DtSunburstChartTooltipData containing useful information that can be used inside the overlay's template */
export interface DtSunburstChartTooltipData {
  /** origin Node passed by user in `series` array */
  origin: DtSunburstChartNode;

  /** Internal identifier */
  id: string;
  /** Name of the node to be shown. Copied from `origin.label` */
  label: string;
  /** Numeric value. Copied from `origin.value` or calculated from `origin.children` */
  value: number;
  /** Numeric percentage value based on this node vs sum of top level */
  valueRelative: number;
  /** Array of nodes belonging to this parent */
  children?: DtSunburstChartTooltipData[];

  /** Number of levels of children */
  depth: number;
  /** Color for this node in this state */
  color: DtColors | string;
  /** Color for this node when hovering in this state */
  colorHover: DtColors | string;
  /** If node is the deepest selected one */
  isCurrent: boolean;
  /** If node is visible in the sunburst-chart */
  visible: boolean;
  /** If node or child are selected */
  active: boolean;
  /** If label should be shown based on selection and a minimum angle of slice */
  showLabel: boolean;
}

export interface DtSunburstChartSlice
  extends PieArcDatum<DtSunburstChartTooltipData> {
  path: string | null;
  labelPosition: [number, number];
  tooltipPosition: [number, number];
  showLabel: boolean;
}

const SVG_SETTINGS = {
  outerRadius: 160,
  innerRadius: 64,
  // radius for the centroid of label
  labelOffsetRadius: 32,
  // radius for the centroid of tooltip so it does not overlap the slice causing a possible flickering
  tooltipOffsetRadius: 64,
  // Minimum angle for the label should be 15°, needs to be converted into radians for further processing.
  minAngleForLabel: (15 / 360) * 2 * Math.PI,
};
const IS_SEPARATOR = '.';

/*
 *
 *  NODE PARSING
 *
 */

/**
 * @description Fill the nodes with the missing information: id, depth, value (if not provided but has children), color
 *
 * @param nodes whole set of nodes provided by user
 */
export const fillNodes = (
  nodes: DtSunburstChartNode[],
): DtSunburstChartTooltipData[] =>
  nodes
    .map(fillUpAndSortNodes)
    .sort((a, b) => a.value - b.value)
    .map((child, i, children) =>
      fillDownNodes(child, i, children, getValue(children)),
    );

/**
 * @description Fill value and depth of node based on it's children
 *
 * @param node node to fill
 * @returns partial DtSunburstChartTooltipData with all children's values and depths
 */
const fillUpAndSortNodes = (node: DtSunburstChartNode) => {
  const children = node.children
    ?.map(fillUpAndSortNodes)
    .sort((a, b) => a.value - b.value);

  return {
    origin: node,
    label: node.label,
    children,
    value: children ? getValue(children) : node.value ?? 0,
    depth: children
      ? 1 + Math.max(...children?.map((child) => child.depth ?? 0))
      : 1,
  };
};

/**
 * @description Fill children's ids, color and relativeValue based on the parent one
 *
 * @param node node to fill
 * @param i sibling index
 * @param nodes all siblings
 * @param totalValue value of the whole tree to calculate relatives
 * @param parent node to whom it belongs
 */
const fillDownNodes = (
  node: DtSunburstChartTooltipData,
  i: number,
  nodes: DtSunburstChartTooltipData[],
  totalValue: number,
  parent?: DtSunburstChartTooltipData,
): DtSunburstChartTooltipData => {
  const filledNode = {
    ...node,
    id: getId(i, parent?.id),
    color:
      node.origin.color ?? (parent ? parent.color : getColor(i, nodes.length)),
    valueRelative: node.value / totalValue,
  };

  return {
    ...filledNode,
    children: node.children?.map((child, j, children) =>
      fillDownNodes(child, j, children, totalValue, filledNode),
    ),
  };
};

/**
 * @description Get arrays with visibility options based on selected id
 *
 * @param nodes whole set of filled nodes
 * @param id current selection
 */
export const getNodesWithState = (
  nodes: DtSunburstChartTooltipData[] = [],
  id?: string,
): DtSunburstChartTooltipData[] =>
  nodes.map((node) => ({
    ...node,
    children: getNodesWithState(node.children, id),
    ...getColors(
      !id || isAncestor(node, id) || isCurrent(node, id) || isChild(node, id),
      isCurrent(node, id),
      node.color,
      DtColors.GRAY_300,
    ),
    active: isAncestor(node, id) || isCurrent(node, id),
    isCurrent: isCurrent(node, id),
    visible:
      getLevel(node.id) === 1 ||
      isAncestorSibling(node, id) ||
      isChild(node, id),
    showLabel: (!id && getLevel(node.id) === 1) || isChild(node, id),
  }));

/*
 *
 *  SELECTION PARSING
 *
 */
/**
 * @description Get selected path for the sunburst-chart following the original data but with only one child per node
 *
 * @param nodes whole set of filled nodes
 * @param leaf Selected element
 */
export const getSelectedNodes = (
  nodes: DtSunburstChartTooltipData[],
  leaf: DtSunburstChartTooltipData,
): DtSunburstChartTooltipData[] =>
  leaf.id.split(IS_SEPARATOR, -1).reduce(
    (
      tree: {
        currentLevel: DtSunburstChartTooltipData[];
        result: DtSunburstChartTooltipData[];
      },
      key,
    ) => {
      const currentNode = tree.currentLevel[parseInt(key)];
      tree.result.push(currentNode);

      // update for next iteration
      if (currentNode.children) tree.currentLevel = currentNode.children;

      return tree;
    },
    {
      currentLevel: nodes,
      result: [],
    },
  ).result;

/**
 * @description Get an array of filled nodes based on the non-filled selectedNodes
 *
 * @param nodes whole set of filled nodes
 * @param selectedNodes array of selected nodes
 */
export const getSelectedNodesFromOutside = (
  nodes: DtSunburstChartTooltipData[],
  selectedNodes: DtSunburstChartNode[],
): DtSunburstChartTooltipData[] =>
  selectedNodes.reduce(
    (
      tree: {
        currentLevel: DtSunburstChartTooltipData[];
        result: DtSunburstChartTooltipData[];
      },
      selected,
    ) => {
      const currentNode = tree.currentLevel.find(
        (current) => current.origin === selected,
      );
      // TODO: this is assuming the values are correct. Otherwise we should provide an error
      if (currentNode) {
        tree.result.push(currentNode);

        // update for next iteration
        if (currentNode.children) tree.currentLevel = currentNode.children;
      }
      return tree;
    },
    {
      currentLevel: nodes,
      result: [],
    },
  ).result;

/**
 * @description Get the id of the current selection from an unfilled node
 *
 * @param nodes whole set of filled nodes
 * @param selectedNodes array of selected nodes
 */
export const getSelectedId = (
  nodes: DtSunburstChartTooltipData[],
  selectedNodes: DtSunburstChartNode[] = [],
): string | undefined =>
  selectedNodes.reduce(
    (
      tree: { currentLevel: DtSunburstChartNode[]; id?: string },
      selectedNode,
    ) => {
      const index = tree.currentLevel.findIndex(
        (node) => node.label === selectedNode.label,
      );

      tree.id = getId(index, tree.id);
      tree.currentLevel = tree.currentLevel[index]?.children ?? [];
      return tree;
    },
    {
      currentLevel: nodes,
      id: undefined,
    },
  ).id;

/*
 *
 *  SLICE CREATION
 *
 */

/**
 * @description Get slices to be painted in SVG filtered by visibility and with actual color
 *
 * @param nodes whole set of filled nodes
 */
export const getSlices = (
  nodes: DtSunburstChartTooltipData[],
): DtSunburstChartSlice[] => {
  const numLevels = nodes.reduce(
    (maxLevel, node) => Math.max(maxLevel, node.depth),
    0,
  );

  return getSlicesByParent(
    nodes,
    (SVG_SETTINGS.outerRadius - SVG_SETTINGS.innerRadius) / (numLevels * 2),
  );
};

/**
 * @description Get flattened array slices for current branch
 *
 * @param nodes whole set of filled nodes
 * @param radiusWidth width of given node
 * @param innerRadius radius of current slice. same as outer radius of parent
 * @param startAngle start angle of parent
 * @param endAngle end angle of parent
 */
const getSlicesByParent = (
  nodes: DtSunburstChartTooltipData[],
  radiusWidth: number,
  innerRadius: number = SVG_SETTINGS.innerRadius,
  startAngle: number = 0,
  endAngle: number = 2 * Math.PI,
): DtSunburstChartSlice[] => {
  const slices = pie<DtSunburstChartTooltipData>()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .value((d) => d.value ?? 0)(nodes);

  return slices
    .filter((slice) => slice.data.visible)
    .reduce((paths, segment) => {
      const sliceBoundaries = {
        startAngle: segment.startAngle,
        endAngle: segment.endAngle,
        innerRadius: innerRadius,
        outerRadius: radiusWidth * (segment.data.active ? 2 : 1) + innerRadius,
      };
      return [
        ...paths,
        {
          ...segment,
          path: arc()(sliceBoundaries),
          labelPosition: arc().centroid({
            ...sliceBoundaries,
            innerRadius:
              sliceBoundaries.outerRadius + SVG_SETTINGS.labelOffsetRadius,
            outerRadius:
              sliceBoundaries.outerRadius + SVG_SETTINGS.labelOffsetRadius,
          }),
          tooltipPosition: arc().centroid({
            ...sliceBoundaries,
            innerRadius:
              sliceBoundaries.outerRadius + SVG_SETTINGS.tooltipOffsetRadius,
            outerRadius:
              sliceBoundaries.outerRadius + SVG_SETTINGS.tooltipOffsetRadius,
          }),
          showLabel:
            segment.endAngle - segment.startAngle >
            SVG_SETTINGS.minAngleForLabel,
        },
        ...getSlicesByParent(
          segment.data.children ?? [],
          radiusWidth,
          radiusWidth * (segment.data.active ? 2 : 1) + innerRadius,
          segment.startAngle,
          segment.endAngle,
        ),
      ];
    }, []);
};

/*
 *
 *  UTILS
 *
 */

/**
 * @description Get id of current node based on parent id and sibling index
 *
 * @param index sibling index
 * @param parentId id of the parent
 */
const getId = (index: number, parentId?: string) =>
  parentId ? `${parentId}${IS_SEPARATOR}${index}` : `${index}`;

/**
 * @description Get sum of children values
 *
 * @param nodes  whole set of filled nodes
 */
export const getValue = (nodes: DtSunburstChartNode[]) =>
  nodes.reduce((total, p) => total + (p?.value ?? 0), 0);

/**
 * @description Get the level based on current id
 *
 * @param id
 */
const getLevel = (id: string): number => id.split(IS_SEPARATOR).length;

/**
 * @description Get color of the palette. As sunburst-chart is built backwards colors must be inverted
 *
 * @param index sibling index
 * @param totalNodes number of children for parent node
 */
const getColor = (index: number, totalNodes: number): string =>
  DT_CHART_COLOR_PALETTE_ORDERED[
    (totalNodes - index - 1) % DT_CHART_COLOR_PALETTE_ORDERED.length
  ];

/**
 * @description Get color ad colorHover of the palette
 *
 * @param isColoured if it should be coloured
 * @param isCurrentSelected if it's selected leaf
 * @param colorYes color for active
 * @param colorNo color for faded
 */
const getColors = (
  isColoured: boolean,
  isCurrentSelected: boolean,
  colorYes: DtColors | string,
  colorNo: DtColors | string,
) => ({
  color: isColoured ? colorYes : colorNo,
  colorHover: `${isColoured ? colorYes : colorNo}${
    isCurrentSelected ? '' : 99
  }`,
});

/**
 * @description Get an array of all ancestors ids
 *
 * @param id id of leaf node
 */
const getAncestorsIds = (id: string): string[] =>
  id
    .split(IS_SEPARATOR)
    .slice(0, -1)
    .map((_, i, segments) => segments.slice(0, i + 1).join(IS_SEPARATOR));

/**
 * @description Get if node is child of given id
 *
 * @param node node to determine if is child
 * @param id
 */
const isChild = (node, id?: string): boolean =>
  !!id && node.id.indexOf(id) === 0 && getLevel(node.id) === getLevel(id) + 1;

/**
 * @description Get if node matches given id
 *
 * @param node
 * @param id
 */
const isCurrent = (node, id?: string): boolean => !!id && node.id === id;

/**
 * @description Get if node is ancestor of given id
 *
 * @param node node to determine if is ancestor
 * @param id
 */
const isAncestor = (node, id?: string): boolean =>
  !!id && getAncestorsIds(id).some((i) => node.id === i);

/**
 * @description Get if node is sibling of ancestor of given id
 *
 * @param node node to determine if is ancestor sibling
 * @param id
 */
const isAncestorSibling = (node, id?: string): boolean =>
  !!id && getAncestorsIds(id).some((i) => isChild(node, i));
