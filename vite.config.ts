import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { mkdir, writeFile } from 'node:fs/promises';
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

export default defineConfig({
  base: '', // 空字符串确保路由正确
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