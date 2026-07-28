<svelte:options customElement={{ tag: 'twreporter-table' }} />

<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import Table from './Table.svelte'

  type TableElementProps = {
    src: string
    config: string
  }

  let { src, config }: TableElementProps = $props()
  const queryClient = new QueryClient()
</script>

{#if src && config}
  <QueryClientProvider client={queryClient}>
    <Table {src} configUrl={config} />
  </QueryClientProvider>
{/if}
