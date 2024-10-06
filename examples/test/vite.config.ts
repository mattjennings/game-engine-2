import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  resolve: {
    dedupe: ['solid-js', 'pixi.js'],
    alias: {},
  },
  plugins: [solid()],
})
