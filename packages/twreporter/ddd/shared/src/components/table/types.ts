export type ColumnAlignment = 'left' | 'right' | 'center'

export type TableColumn = {
  /** The CSV header used to select values for this column. */
  key: string
  /** The text displayed in the table header. */
  label: string
  /**
   * The column width as a fraction of the table width.
   * @exclusiveMinimum 0
   * @maximum 1
   */
  width?: number
  /**
   * Cell and header alignment.
   * @default "left"
   */
  align?: ColumnAlignment
}

export type TableConfig = {
  /** The title displayed above the table. */
  title: string
  /** Notes displayed beneath the table. */
  footnotes: string[]
  /**
   * The columns to display, in order.
   * @minItems 1
   */
  columns: TableColumn[]
  /**
   * Use the wide Reporter shell layout.
   * @default false
   */
  wide?: boolean
  /**
   * Show the shell backdrop.
   * @default true
   */
  backdrop?: boolean
  /** An optional label displayed directly above the table. */
  label?: string
  /**
   * The table width on mobile, as a percentage. Values above 100 enable horizontal scrolling.
   * @exclusiveMinimum 0
   * @default 100
   */
  mobileWidth?: number
}
