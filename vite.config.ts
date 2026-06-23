import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import UnpluginInjectPreload from 'unplugin-inject-preload/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: './stats/stats.html',
            open: false,
        }),
        UnpluginInjectPreload({
            files: [
                {
                    entryMatch: /logo-light.png$/,
                    outputMatch: /logo-light-.*.png$/,
                },
                {
                    entryMatch: /logo-dark.png$/,
                    outputMatch: /logo-dark-.*.png$/,
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            external: (id) => /__test__/.test(id),
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (
                            id.includes('@xyflow/react') ||
                            id.includes('@xyflow/system') ||
                            id.includes('/@xyflow/')
                        ) {
                            return 'react-flow';
                        }
                        if (
                            id.includes('monaco-editor') ||
                            id.includes('@monaco-editor')
                        ) {
                            return 'monaco';
                        }
                        if (
                            id.includes('/react/') ||
                            id.includes('/react-dom/') ||
                            id.includes('react-router') ||
                            id.includes('/scheduler/')
                        ) {
                            return 'vendor';
                        }
                    }

                    if (
                        id.includes('/src/templates-data/templates/') ||
                        id.includes('/src/templates-data/templates-data.ts')
                    ) {
                        return 'templates';
                    }
                },
                assetFileNames: (assetInfo) => {
                    if (
                        assetInfo.names &&
                        assetInfo.originalFileNames.some((name) =>
                            name.startsWith('src/assets/templates/')
                        )
                    ) {
                        return 'assets/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
