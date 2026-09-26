import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages のリポジトリ名に合わせて変更してください
  // 例: リポジトリが https://github.com/user/kids-educational-app の場合
  base: '/kids-educational-app/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
