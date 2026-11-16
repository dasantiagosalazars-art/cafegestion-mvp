import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  // Quality gate: la cobertura se mide sobre las reglas de dominio (lógica pura).
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/**/*.spec.ts', '!src/domain/tipos.ts'],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 },
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
