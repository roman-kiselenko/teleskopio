import AgeCell from '@/components/ui/Table/AgeCell';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import RsName from '@/components/ui/Table/ResourceName';
import Actions from '@/components/ui/Table/Actions';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { HandHelping } from 'lucide-react';
import { useNavigate } from 'react-router';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <RsName name={row.original.metadata?.name} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row.original.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'spec.replicas',
    id: 'replicase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Replicas'} />),
    cell: ({ row }) => {
      return (
        <div>
          {row.original.spec?.replicas}/{row.original.status?.readyReplicas}
        </div>
      );
    },
  },
  {
    id: 'age',
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      let navigate = useNavigate();
      const rs = row.original;
      const resource = apiResourcesState.get().find((r: ApiResource) => r.kind === 'ReplicaSet');
      const owner = rs?.metadata?.ownerReferences[0];
      const additional = [
        <DropdownMenuItem
          disabled={owner === undefined}
          key={rs.metadata.uid}
          onClick={() => {
            navigate(
              `/yaml/${owner.kind}/${owner.name}/${rs?.metadata?.namespace}?group=${owner.apiVersion.split('/')[0]}`,
            );
          }}
          className="text-xs"
        >
          <HandHelping />
          Owner
        </DropdownMenuItem>,
      ];
      return (
        <Actions
          url={`/yaml/ReplicaSet/${rs.metadata?.name}/${rs?.metadata?.namespace}?group=${rs.apiVersion.split('/')[0]}`}
          resource={rs}
          children={additional}
          scale={true}
          name={'ReplicaSet'}
          action={'delete_dynamic_resource'}
          request={{
            request: {
              name: rs.metadata?.name,
              namespace: rs?.metadata?.namespace,
              ...resource,
            },
          }}
        />
      );
    },
  },
];

export default columns;
