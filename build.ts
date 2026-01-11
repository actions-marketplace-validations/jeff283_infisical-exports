const results = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "node",
  minify: true,
});

console.log("Build Success:", results.success);

if (results.success) {
  console.log("\nBuild Outputs\n\n", results.outputs);
}

console.log("BuildLogs\n\n");
for (const log of results.logs) {
  console.log(log);
}
