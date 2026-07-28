<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Table from './Table.wc.svelte'
  import { generateEmbedCode } from '../../storybook/generate-embed-code'

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

<Story name="Default">
  {#snippet template(args)}
    <textarea
      readonly
      style:width="100%"
      style:height="200px"
      style:margin-bottom="20px">{generateEmbedCode('table', args)}</textarea
    >
    <Table {...args} />
  {/snippet}
</Story>
