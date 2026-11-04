import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

// 开发服务器中间件：接收上传的班级表格并保存到 data/Random Roll Call List
const saveClassFilePlugin = {
  name: 'save-class-file',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/save-class-file', async (req: IncomingMessage, res: ServerResponse) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
        return;
      }
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk as Uint8Array));
        }
        const buffer = Buffer.concat(chunks);

        const filename = decodeURIComponent(String(req.headers['x-filename'] || 'upload'));
        const className = decodeURIComponent(String(req.headers['x-class-name'] || ''));

        const targetDir = join(process.cwd(), 'data', 'Random Roll Call List');
        await mkdir(targetDir, { recursive: true });

        // 班级名前缀 + 原始文件名
        const safeClassName = className.replace(/[\\/:*?"<>|]/g, '_').trim();
        const saveName = safeClassName ? `${safeClassName}_${filename}` : filename;
        const savePath = join(targetDir, saveName);

        await writeFile(savePath, buffer);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, path: savePath, filename: saveName }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : '保存失败' }));
      }
    });
  },
};

// 构建后把 index.html 复制为 404.html：
// GitHub Pages 等静态托管在访问 /photo/1 这类深层链接时没有回退，会直接 404；
// 有了 404.html 后浏览器仍会以 404 状态码加载该页面，React Router 便能接管路由。
const spaFallbackPlugin = {
  name: 'spa-fallback-404',
  apply: 'build' as const,
  closeBundle: async () => {
    const distDir = join(process.cwd(), 'dist');
    try {
      const html = await readFile(join(distDir, 'index.html'), 'utf8');
      await writeFile(join(distDir, '404.html'), html);
    } catch (err) {
      console.warn('[spa-fallback-404] 生成 404.html 失败:', err);
    }
  },
};

export default defineConfig({
  // 必须使用绝对路径 '/'：相对路径 './assets/...' 在 /photo/1 这类深层链接下
  // 会被解析成 /photo/assets/...，导致脚本 404、整页白屏。
  base: '/',
  build: {
    sourcemap: 'hidden',
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.pdf'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths(),
    saveClassFilePlugin,
    spaFallbackPlugin,
    viteStaticCopy({
      targets: [
        {
          src: 'data',
          dest: '.',
        },
      ],
    }),
  ],
})