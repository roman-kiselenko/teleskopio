import AgeCell from '@/components/ui/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Job } from '@/types';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata.namespace}</div>),
  },
  {
    accessorKey: 'status.ready',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Ready'} />),
    cell: ({ row }) => {
      const ready = row.original.status.ready;
      const succeeded = row.original.status.succeeded;
      return (
        <div>
          {ready}/{succeeded}
        </div>
      );
    },
  },
  {
    accessorKey: 'spec.backoffLimit',
    id: 'backofflimit',
    header: 'BackoffLimit',
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const job = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        jobNamespace: job.metadata.namespace,
        jobName: job.metadata.name,
      };
      return <Actions resource={job} name={'Job'} action={'delete_job'} payload={payload} />;
    },
  },
];

export default columns;
