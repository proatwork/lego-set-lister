import { defineConfig } from 'vite'
import { node } from '@liuli-util/vite-plugin-node'

export default defineConfig({
    optimizeDeps: {
        exclude: ["json/*"],
    },
    plugins: [
        node({
            entry: 'src/app.ts',
            formats: ['es'],
            dts: false,
            outDir: 'dist'
        })
    ],
    
})