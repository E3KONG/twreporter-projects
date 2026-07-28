<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { parse } from 'papaparse'
  import Shell from './Shell.svelte'
  import type { TableConfig } from './types'

  const { src, configUrl }: { src: string; configUrl: string } = $props()

  let wrapper: HTMLDivElement | undefined = $state()
  let canScrollRight = $state(false)

  const resolvedSrc = $derived(resolveUrl(src))
  const resolvedConfigUrl = $derived(resolveUrl(configUrl))

  const csvQuery = createQuery(() => ({
    queryKey: ['twreporter-table', 'csv', resolvedSrc],
    enabled: resolvedSrc !== undefined,
    queryFn: async ({ signal }) =>
      parseCsv(await fetchText(resolvedSrc!, signal)),
  }))

  const configQuery = createQuery(() => ({
    queryKey: ['twreporter-table', 'config', resolvedConfigUrl],
    enabled: resolvedConfigUrl !== undefined,
    queryFn: ({ signal }) => fetchJson(resolvedConfigUrl!, signal),
  }))

  const rows = $derived.by(() => {
    if (!csvQuery.data || !configQuery.data) return undefined

    const missingColumns = configQuery.data.columns.filter(
      (column) => !csvQuery.data.headers.includes(column.key),
    )
    if (missingColumns.length > 0) {
      console.error(
        new Error(
          `CSV is missing configured columns: ${missingColumns
            .map((column) => column.key)
            .join(', ')}`,
        ),
      )
      return undefined
    }

    return csvQuery.data.rows
  })

  $effect(() => {
    if (csvQuery.error) console.error(csvQuery.error)
  })

  $effect(() => {
    if (configQuery.error) console.error(configQuery.error)
  })

  $effect(() => {
    if (!wrapper) return
    updateFade()
    const observer = new ResizeObserver(updateFade)
    observer.observe(wrapper)
    return () => observer.disconnect()
  })

  function resolveUrl(value: string): string | undefined {
    const trimmed = value?.trim()
    if (!trimmed) return undefined

    try {
      return new URL(trimmed, document.baseURI).href
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  async function fetchText(url: string, signal: AbortSignal): Promise<string> {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSV (${response.status} ${response.statusText}): ${url}`,
      )
    }
    return response.text()
  }

  async function fetchJson(
    url: string,
    signal: AbortSignal,
  ): Promise<TableConfig> {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new Error(
        `Failed to fetch table config (${response.status} ${response.statusText}): ${url}`,
      )
    }
    return response.json() as Promise<TableConfig>
  }

  function parseCsv(csvText: string): {
    rows: Record<string, string>[]
    headers: string[]
  } {
    const result = parse<Record<string, string>>(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: 'greedy',
    })

    if (result.errors.length > 0) {
      throw new Error(
        `Failed to parse CSV: ${result.errors.map((error) => error.message).join('; ')}`,
      )
    }

    return {
      rows: result.data,
      headers: result.meta.fields ?? [],
    }
  }

  function updateFade() {
    canScrollRight = Boolean(
      wrapper && wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth,
    )
  }
</script>

{#if configQuery.data && rows}
  {@const tableConfig = configQuery.data}
  <Shell
    title={tableConfig.title}
    footnotes={tableConfig.footnotes}
    wide={tableConfig.wide}
    backdrop={tableConfig.backdrop}
  >
    <div class="table-group">
      {#if tableConfig.label}
        <div class="table-label">{tableConfig.label}</div>
      {/if}
      <div class="table-wrapper" bind:this={wrapper} onscroll={updateFade}>
        <table style:--mobile-width={`${tableConfig.mobileWidth ?? 100}%`}>
          <colgroup>
            {#each tableConfig.columns as column}
              <col
                style:width={column.width === undefined
                  ? undefined
                  : `${column.width * 100}%`}
              />
            {/each}
          </colgroup>
          <thead>
            <tr>
              {#each tableConfig.columns as column}
                <th style:text-align={column.align ?? 'left'}>{column.label}</th
                >
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each rows as row}
              <tr>
                {#each tableConfig.columns as column}
                  <td style:text-align={column.align ?? 'left'}
                    >{row[column.key] ?? '—'}</td
                  >
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div
        class="scroll-fade"
        class:visible={canScrollRight}
        aria-hidden="true"
      ></div>
    </div>
  </Shell>
{/if}

<style>
  .table-group {
    position: relative;
    min-width: 0;
  }

  .table-label {
    padding: 6px;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 2px 2px 0 0;
    background-color: var(--neutral-gray-200);
    color: var(--neutral-gray-800);
    font-size: var(--text-m);
    font-weight: 700;
    text-align: center !important;
  }

  .table-wrapper {
    position: relative;
    width: 100%;
    min-height: 60px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .table-wrapper::-webkit-scrollbar {
    display: none;
  }

  .scroll-fade {
    position: absolute;
    top: 0;
    right: -1px;
    bottom: 0;
    width: 40px;
    background: linear-gradient(to left, var(--neutral-gray-50), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .scroll-fade.visible {
    opacity: 1;
  }

  table {
    width: 100%;
    border: 1px solid var(--neutral-gray-200);
    border-radius: 2px;
    border-collapse: collapse;
    font-size: var(--text-m);
    table-layout: fixed;
  }

  thead tr {
    border-bottom: 1px solid var(--neutral-gray-200);
    background-color: var(--neutral-gray-100);
  }

  tbody tr {
    border-bottom: 1px solid var(--neutral-gray-200);
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  tbody tr:hover td {
    background-color: var(--neutral-white);
  }

  th,
  td {
    padding: 8px 12px;
    border-right: 1px solid var(--neutral-gray-200);
    vertical-align: middle;
  }

  th:last-child,
  td:last-child {
    border-right: none;
  }

  th {
    color: var(--neutral-gray-800);
    font-weight: 700;
    white-space: nowrap;
  }

  td {
    color: var(--neutral-gray-700);
    white-space: pre-line;
  }

  @media (max-width: 767px) {
    table {
      width: var(--mobile-width);
      min-width: 100%;
    }

    th,
    td {
      padding: 6px 8px;
    }
  }
</style>
