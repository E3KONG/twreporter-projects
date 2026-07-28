<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Table from './Table.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/Table',
    component: Table,
    args: {
      src: 'https://projects.twreporter.org/twreporter/ddd/2026-07-transnational-repression/1.csv',
      config:
        'https://projects.twreporter.org/twreporter/ddd/2026-07-transnational-repression/1.json',
    },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
    },
  })
</script>

<Story name="Default" />
