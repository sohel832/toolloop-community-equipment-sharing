import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_TITLE: "ToolLoop — Community Equipment-Sharing Network",
    NEXT_PUBLIC_TEAM_NAME: "Sohel M Chapparband & Shreyas Bellad",
    NEXT_PUBLIC_SRN: "PES2UG25CS826 / PES2UG25CS824",
    NEXT_PUBLIC_SECTION: "F"
  }
};

export default nextConfig;
