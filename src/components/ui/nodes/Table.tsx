import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type NodesProps = {
  nodes: Object[]
}

const columns = [
    { header: "Name", field: "metadata.name" },
    { header: "IP", field: "spec.podCIDR" },
    { header: "Kubelet Version", field: "status.nodeInfo.kubeletVersion" },
]

export function Nodes({ nodes }: NodesProps) {
    return (
        <DataTable className="table-auto" selectionMode="single" stripedRows value={nodes}>
            {columns.map((col: any, i) => (
                <Column key={i} field={col.field} header={col.header} />
            ))}
        </DataTable>
    )
};