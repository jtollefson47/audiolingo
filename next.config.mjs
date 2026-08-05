import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Tone.js ships an ESM build with extensionless imports that breaks
    // webpack's static analysis. Alias to the self-contained UMD bundle.
    config.resolve.alias = {
      ...config.resolve.alias,
      tone: path.join(__dirname, "node_modules/tone/build/Tone.js"),
    };
    return config;
  },
};

export default nextConfig;