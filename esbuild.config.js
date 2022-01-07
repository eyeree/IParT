const {build} = require("esbuild")
const esBuildDevServer = require("esbuild-dev-server")

esBuildDevServer.start(
	build({
		entryPoints: ["wap/src/index.ts"],
		outdir: "wap/dist",
		incremental: true,
		// and more options ...
	}),
	{
		port:      "8080",
		watchDir:  "wap/src",
		index:     "wap/index.html",
		staticDir: "wap",
		onBeforeRebuild: {},
		onAfterRebuild:  {},
	}
)