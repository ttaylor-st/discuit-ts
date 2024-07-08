import dts from "bun-plugin-dts";

await Bun.build({
	entrypoints: ["./src/index.ts"],
	plugins: [dts()],
	minify: false,
	sourcemap: "inline",
	outdir: "./dist",
});
