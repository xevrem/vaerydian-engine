import * as esbuild from "esbuild";

let ctx = await esbuild.context({
  bundle: true,
  entryPoints: ["./src/index.jsx"],
  loader: {
    ".png": "dataurl",
  },
  logLevel: "debug",
  minify: false,
  outdir: "./dist",
  // plugins: [inlineSass()],
  sourcemap: true,
  // set to latest LTS builds
  target: ['chrome127', 'firefox128'],
  tsconfig: "tsconfig.dev.json"
});

await ctx.watch({});

let { host: _host, port: _port } = await ctx.serve({
  servedir: "./dist",
});
