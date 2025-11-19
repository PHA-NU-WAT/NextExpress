declare module "@handsontable/react-wrapper" {
  import type Handsontable from "handsontable"
  import * as React from "react"

  type HotTableProps = Record<string, unknown>

  export default class HotTableClass extends React.Component<HotTableProps> {
    hotInstance: Handsontable
  }

  export class HotTable extends React.Component<HotTableProps> {}
}
