import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import JobName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    meta: { className: 'min-w-[30ch] max-w-[30ch]' },
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <JobName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    id: 'age',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    cell: ({ row }) => {
      const role = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'Role');
      let request = {
        name: role.metadata?.name,
        namespace: role?.metadata?.namespace,
        ...resource,
      };
      return (
        <Actions
          url={`/yaml/Role/${role.metadata?.name}/${role.metadata?.namespace}?group=${role.apiVersion.split('/')[0]}`}
          resource={role}
          name={'Role'}
          action={'delete_dynamic_resource'}
          request={request}
        />
      );
    },
  },
];

export default columns;
