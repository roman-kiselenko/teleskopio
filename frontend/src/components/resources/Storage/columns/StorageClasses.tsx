import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => {
      return (
        <div>
          {row.original.metadata.annotations?.hasOwnProperty(
            'storageclass.kubernetes.io/is-default-class',
          ) ? (
            <Badge className="text-xs" variant="default">
              default
            </Badge>
          ) : (
            <></>
          )}{' '}
          {row.original.metadata?.name}
        </div>
      );
    }),
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
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
