/** @type {import('next').NextConfig} */
import dotenv from "dotenv";
import fs from "fs";
import webpack from "./webpack.config.mjs";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));

// Merge environment variables
nextConfig.env = {
  ...nextConfig.env,
  PINECONE_API_KEY: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
  PINECONE_ENVIRONMENT: process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT,
  NEXT_PUBLIC_PINECONE_INDEX_NAME: process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME,
  NEXT_PUBLIC_PARAGON_SIGNING_KEY: process.env.NEXT_PUBLIC_PARAGON_SIGNING_KEY,
};

nextConfig.webpack = webpack;

export default nextConfig;
