/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle WASM modules from Privacy Cash / Light Protocol
  webpack: (config, { isServer }) => {
    // Ignore WASM files during build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Add rule to handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Ignore problematic modules that use WASM
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'privacycash': 'commonjs privacycash',
        '@lightprotocol/hasher.rs': 'commonjs @lightprotocol/hasher.rs',
      });
    }

    return config;
  },

  // Ignore TypeScript errors in external packages
  typescript: {
    ignoreBuildErrors: false,
  },

  // Allow external packages with WASM
  experimental: {
    serverComponentsExternalPackages: ['privacycash', '@lightprotocol/hasher.rs'],
  },
};

export default nextConfig;
