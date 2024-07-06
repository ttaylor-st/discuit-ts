import dts from "bun-plugin-dts";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  plugins: [dts()],
  minify: true,
  outdir: "./dist",
});
