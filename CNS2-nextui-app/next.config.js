/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  reactStrictMode: false,  // これも不要な再レンダリングを防ぐのに役立つ
  onDemandEntries: {
    // Fast Refreshを無効化
    webpackDevMiddleware: config => {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: '**/node_modules/**',
        aggregateTimeout: 300,
        poll: 1000,
      };
      return config;
    }
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 必要であれば、エラー通知処理を追加
});

module.exports = nextConfig
