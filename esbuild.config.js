const {build} = require("esbuild")
const esBuildDevServer = require("esbuild-dev-server")

const mode = process.argv[2] || "build";

const buildResult = build(
    {
        entryPoints: ["wap/src/index.ts"],
        outdir: "wap/dist",
        incremental: mode == "dev",
        // and more options ...
    }
);

if (mode == "dev") {
    esBuildDevServer.start(
        buildResult,
        {
            port:      "8080",
            watchDir:  "wap/src",
            index:     "wap/index.html",
            staticDir: "wap",
            onBeforeRebuild: {},
            onAfterRebuild:  {},
        }
    )
} else {
    buildResult.catch(() => process.exit(1));
}
