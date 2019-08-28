import typescript2 from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

const isProduction = process.env.NODE_ENV === 'production';

const base = {
  input: './src/index.ts',
  plugins: [
    autoExternal(),
    typescript2({
      tsconfigOverride: {
        compilerOptions: {
          declaration: isProduction,
          declarationDir: './types',
        },
        include: ['./src/index.ts', './src/missing.d.ts'],
        exclude: ['./node_modules/**/*.*'],
      },
      useTsconfigDeclarationDir: true,
    }),
  ],
};

const targets = [
  {
    ...base,
    output: {
      file: './index.js',
      format: 'cjs',
    },
  },
];

if (isProduction) {
  targets.push({
    ...base,
    output: {
      file: './index.mjs',
      format: 'es',
    },
  });
}

export default targets;
