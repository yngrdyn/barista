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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaSearchResult } from '@dynatrace/shared/barista-definitions';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface BaSearchServiceInterface {
  search(query: string): Observable<BaSearchResult[]>;
}

@Injectable()
export class BaSearchService implements BaSearchServiceInterface {
  constructor(private readonly _http: HttpClient) {}

  search(searchString: string): Observable<BaSearchResult[]> {
    return this._http.get<BaSearchResult[]>(
      `${environment.searchEndpoint}search?q=${searchString}`,
    );
  }
}

@Injectable()
export class BaExternalSearchService implements BaSearchServiceInterface {
  search(query: string): Observable<BaSearchResult[]> {
    throw new Error('Not yet implemented');
  }
}
