const {build, serve} = require("esbuild")

const mode = process.argv[2] || "build";

const buildOptions = {
    entryPoints: ["wap/src/frames.ts", "wap/src/index.ts"],
    outdir: "wap/esbuild",
    sourcemap: mode != "build",
    bundle: true,
    define: {
        DEBUG: mode != "build"
    },
    minify: mode == "build",
    target: "esnext",
    format: "esm"
    // incremental: mode == "dev",
}

if(mode == "watch") {
    buildOptions.watch = {
        onRebuild(error, result) {
            if (error) {
                console.error(error);
            } else {
                console.log(result)
            }
        }
    }

}

const serveOptions = {
    servedir: "wap"
}

function error(reason) {
    console.error(reason);
    process.exit(1);
}

function success(result) {
    console.log(result)
}

switch(mode) {
    case "watch":
    case "build":
        build(buildOptions).then(success).catch(error);
        break;
    case "serve":
        serve(serveOptions, buildOptions).then(success).catch(error);
        break;
}

