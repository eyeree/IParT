const {build, serve} = require("esbuild")

const mode = process.argv[2] || "build";

const buildOptions = {
    entryPoints: ["wap/src/frames.ts", "wap/src/index.ts"],
    outdir: "wap/dist",
    sourcemap: true,
    // incremental: mode == "dev",
}

const serveOptions = {
    servedir: "wap"
}

if(mode == "build") {
    build(buildOptions).catch(() => process.exit(1));
} else {
    serve(serveOptions, buildOptions);
}
