import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { Badge } from '@/components/ui/badge';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => {
      return (
        <div>
          {row.original.metadata.annotations?.hasOwnProperty(
            'ingressclass.kubernetes.io/is-default-class',
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
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
