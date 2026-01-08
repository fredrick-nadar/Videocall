import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
      babelHelpers: 'bundled'
    }),
    commonjs(),
    postcss({
      modules: true,
      extract: false,
      inject: true
    })
  ],
  external: [
    'react',
    'react-dom',
    'fs',
    'path',
    'url',
    'child_process',
    'http',
    'https',
    'net',
    'tls',
    'crypto',
    'stream',
    'zlib',
    'buffer'
  ]
};
