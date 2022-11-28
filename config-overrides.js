const webpack = require("webpack");

module.exports = function override(config, env) {
    config.resolve.fallback = {
        buffer: require.resolve("buffer"),
        util: require.resolve("util"),
        fs: require.resolve("graceful-fs"),
        path: require.resolve("path-browserify"),
        url: require.resolve("url"),
        "assert": require.resolve("assert/"),
        "stream": require.resolve("stream-browserify"),
        "constants": require.resolve("constants-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        "process/browser": require.resolve('process/browser'),
        "os": require.resolve("os-browserify/browser")
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
            const mod = resource.request.replace(/^node:/, "");
            switch (mod) {
                case "buffer":
                    resource.request = "buffer";
                    break;
                case "util":
                    resource.request = "util";
                    break;
                case "http":
                    resource.request = "stream-http";
                    break;
                case "https":
                    resource.request = "https";
                    break;
                case "fs":
                    resource.request = "fs";
                    break;
                case "path":
                    resource.request = "path";
                    break;
                case "stream":
                    resource.request = "readable-stream";
                    break;
                case "url":
                    resource.request = "url";
                    break;
                case "net":
                    resource.request = "net";
                    break;
                case "zlib":
                    resource.request = "zlib";
                    break;
                default:
                    throw new Error(`Not found ${mod}`);
            }
        }),
    );
    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
};
