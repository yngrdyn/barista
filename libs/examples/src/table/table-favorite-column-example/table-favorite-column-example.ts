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

import { Component, OnInit, ViewChild } from '@angular/core';

import { DtSort, DtTableDataSource } from '@dynatrace/barista-components/table';

interface HostRow {
  favorite: boolean;
  host: string;
  memoryPerc: number;
  memoryTotal: number;
}

@Component({
  selector: 'dt-example-table-favorite-column',
  templateUrl: './table-favorite-column-example.html',
})
export class DtExampleTableFavoriteColumn implements OnInit {
  data: Array<HostRow> = [
    {
      favorite: true,
      host: 'et-demo-2-win4',
      memoryPerc: 38,
      memoryTotal: 5830000000,
    },
    {
      favorite: true,
      host: 'et-demo-2-win3',
      memoryPerc: 46,
      memoryTotal: 6000000000,
    },
    {
      favorite: false,
      host: 'docker-host2',
      memoryPerc: 35,
      memoryTotal: 5810000000,
    },
    {
      favorite: false,
      host: 'et-demo-2-win1',
      memoryPerc: 7.86,
      memoryTotal: 5820000000,
    },
  ];

  // Get the viewChild to pass the sorter reference to the datasource.
  @ViewChild('sortable', { read: DtSort, static: true }) sortable: DtSort;

  // Initialize the table's data source
  dataSource: DtTableDataSource<{
    favorite: boolean;
    host: string;
    memoryPerc: number;
    memoryTotal: number;
  }>;

  constructor() {
    this.dataSource = new DtTableDataSource(this.data);
    this.dataSource.addSortAccessorFunction(
      'memory',
      row =>
        // Any accessor computation that returns a comparable value.
        (row.memoryPerc / 100) * row.memoryTotal,
    );
  }

  ngOnInit(): void {
    // Set the dtSort reference on the dataSource, so it can react to sorting.
    this.dataSource.sort = this.sortable;
  }

  toggleFavorite(toggledRow: HostRow): void {
    // Modify a data clone and assign the changed state at the end
    // to notify change detection about the dataChange in an array.
    const modifiedData = [...this.data];
    for (const row of modifiedData) {
      if (row === toggledRow) {
        row.favorite = !row.favorite;
      }
    }
    this.data = modifiedData;
  }
}
