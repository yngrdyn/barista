export const renamedImport = `import { OnInit } from './path/to/file';
import { DtIconModule } from '@dynatrace/barista-components/icon';
import * as DtIcon from '@dynatrace/barista-components/icon';
import { DtIconModule } from '@dynatrace/barista-components';

const CONSTSANT = 'cno';

export interface MyInterface {

}

@Component({

})
export class MyComp implements OnInit {
  constructor(
    private _blabla: Bla
  ) {}
}
`;

export const packageJson = JSON.stringify(
  {
    dependencies: {
      '@dynatrace/barista-components': '5.0.0',
    },
  },
  null,
  2,
);

export const peerDependencies = JSON.stringify(
  {
    peerDependencies: {
      '@angular/cdk': '1.0.0',
      '@dynatrace/barista-icons': '>= 3.0.0 < 4',
      '@dynatrace/barista-fonts': '>= 1.0.0 < 2',
      '@types/highcharts': '^5.0.23',
      'd3-scale': '^3.0.0',
      'd3-shape': '^1.3.5',
      highcharts: '^6.0.7',
    },
  },
  null,
  2,
);

export const angularJson = JSON.stringify({
  projects: {
    barista: {
      architect: {
        build: {
          options: {
            assets: [
              {
                glob: '**',
                input: 'components/assets',
                output: '/assets',
              },
              {
                glob: '**/*',
                input: 'node_modules/@dynatrace/barista-fonts/fonts/',
                output: '/fonts',
              },
              {
                glob: '*.svg',
                input: 'node_modules/@dynatrace/barista-icons',
                output: '/assets/icons',
              },
            ],
          },
        },
      },
    },
    e2e: {
      architect: {
        build: {
          options: {
            assets: [
              {
                glob: '**',
                input: 'components/assets',
                output: '/assets',
              },
              {
                glob: '**/*',
                input: 'node_modules/@dynatrace/barista-fonts/fonts/',
                output: '/fonts',
              },
              {
                glob: '*.svg',
                input: 'node_modules/@dynatrace/barista-icons',
                output: '/assets/icons',
              },
            ],
          },
        },
      },
    },
  },
});

export const appModule = `import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { testModule } from 'testModule';

@NgModule({
  imports: [ BrowserModule, testModule, BrowserAnimationsModule ],
  exports: [ testModule ]
})
export class AppModule {

}
`;

export const styleCss = `@import '~@dynatrace/angular-components/style/main';
body {
  background: red;
}

h1 {
  font-size: 120%;
}
`;