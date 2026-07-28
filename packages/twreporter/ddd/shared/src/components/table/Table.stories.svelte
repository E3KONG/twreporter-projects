<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Table from './Table.wc.svelte'

  const { Story } = defineMeta({
    title: 'Components/Table',
    component: Table,
    args: { src: '', config: '' },
    argTypes: {
      src: { control: 'text' },
      config: { control: 'text' },
    },
  })
</script>

<Story name="Default" />
