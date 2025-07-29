import AgeCell from '@/components/ui/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { getKubeconfig, getCluster } from '@/store/cluster';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { StorageClass } from '@/types';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';

const columns: ColumnDef<StorageClass>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata.name} />),
  },
  {
    accessorKey: 'provisioner',
    id: 'provisioner',
    header: memo(({ column }) => <HeaderAction column={column} name={'Provisioner'} />),
    cell: memo(({ row }) => <div>{row.original.provisioner}</div>),
  },
  {
    accessorKey: 'reclaimPolicy',
    id: 'reclaimPolicy',
    header: memo(({ column }) => <HeaderAction column={column} name={'ReclaimPolicy'} />),
    cell: memo(({ row }) => <div>{row.original.reclaimPolicy}</div>),
  },
  {
    accessorKey: 'volumeBindingMode',
    id: 'volumeBindingMode',
    header: memo(({ column }) => <HeaderAction column={column} name={'VolumeBindingMode'} />),
    cell: memo(({ row }) => <div>{row.original.volumeBindingMode}</div>),
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
      const sc = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        resourceName: sc.metadata.name,
      };
      return (
        <Actions
          resource={sc}
          name={'StorageClass'}
          action={'delete_storageclass'}
          payload={payload}
        />
      );
    },
  },
];

export default columns;
