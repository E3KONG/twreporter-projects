<svelte:options customElement={{ tag: 'twreporter-table' }} />

<script module lang="ts">
  import { QueryClient } from '@tanstack/svelte-query'

  const queryClient = new QueryClient()
</script>

<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import Table from './Table.svelte'

  type TableElementProps = {
    src: string
    config: string
  }

  let { src, config }: TableElementProps = $props()
</script>

<QueryClientProvider client={queryClient}>
  <Table {src} configUrl={config} />
</QueryClientProvider>
