import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type Plugin } from 'vite'

const components = {
  table: {
    entry: 'src/components/table/index.ts',
    outputDirectory: 'components/table',
  },
} as const

const timestamp = Date.now()
const [name, component] = Object.entries(components)[0]
const generatedSchemaPath = resolve(
  import.meta.dirname,
  'dist/components/table/table.schema.json',
)

function generatedSchema(): Plugin {
  let source: Buffer
  const schemaId = generatedSchemaPath + '?url&no-inline'

  return {
    name: 'twreporter-generated-schema',
    enforce: 'pre',
    async configResolved(config) {
      if (config.command === 'build')
        source = await readFile(generatedSchemaPath)
    },
    resolveId(id) {
      if (
        id.endsWith('dist/components/table/table.schema.json?url&no-inline')
      ) {
        return schemaId
      }
    },
    load(id) {
      if (id !== schemaId) return
      const referenceId = this.emitFile({
        type: 'asset',
        name: 'table.schema.json',
        source,
      })
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [generatedSchema(), svelte({ emitCss: false })],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, component.entry),
      formats: ['es'],
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
        entryFileNames: `${component.outputDirectory}/${name}-${timestamp}.js`,
        assetFileNames: (assetInfo) =>
          assetInfo.names.some((assetName) =>
            assetName.endsWith('.schema.json'),
          )
            ? `${component.outputDirectory}/${name}-${timestamp}.schema.json`
            : `${component.outputDirectory}/${name}-${timestamp}.[ext]`,
      },
    },
    sourcemap: false,
  },
})
