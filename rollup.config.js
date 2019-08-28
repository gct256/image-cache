import typescript2 from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

const base = {
  input: './src/index.ts',
  plugins: [
    autoExternal(),
    typescript2({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: './types',
        },
        include: ['./src/index.ts', './src/missing.d.ts'],
        exclude: ['./node_modules/**/*.*'],
      },
      useTsconfigDeclarationDir: true,
    }),
  ],
};

export default [
  {
    ...base,
    output: {
      file: './index.js',
      format: 'cjs',
    },
  },
  {
    ...base,
    output: {
      file: './index.mjs',
      format: 'es',
    },
  },
];
