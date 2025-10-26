import AgeCell from '@/components/ui/Table/AgeCell';
import ContainerIcon from '@/components/resources/Workloads/columns/Pods/ContainerIcon';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import PodName from '@/components/resources/Workloads/columns/Pods/PodName';
import PodStatus from '@/components/resources/Workloads/columns/Pods/PodStatus';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { ApiResource } from '@/types';
import { apiResourcesState } from '@/store/apiResources';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    meta: { className: 'min-w-[35ch] max-w-[35ch] truncate' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <PodName pod={row?.original} />),
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    meta: { className: 'min-w-[10ch] max-w-[10ch]' },
    header: memo(({ column }) => <HeaderAction column={column} name={'Namespace'} />),
    cell: memo(({ row }) => <div>{row?.original?.metadata?.namespace}</div>),
  },
  {
    accessorKey: 'containers',
    meta: { className: 'min-w-[20ch] max-w-[20ch]' },
    header: 'Containers',
    id: 'containers',
    cell: memo(({ row }) => {
      const pod = row.original;
      let containers = pod.status?.containerStatuses ? pod.status?.containerStatuses : [];
      if (pod.status?.initContainerStatuses) {
        containers = containers.concat(
          pod.status.initContainerStatuses.map((c) => {
            return { ...c, containerType: 'Init' };
          }),
        );
      }
      if (pod.status?.ephemeralContainerStatuses) {
        containers = containers.concat(
          pod.status.ephemeralContainerStatuses.map((c) => {
            return { ...c, containerType: 'Ephemeral' };
          }),
        );
      }
      return (
        <div className="flex flex-wrap w-30">
          {containers.map((c: any) => (
            <ContainerIcon key={c.name} container={c} />
          ))}
        </div>
      );
    }),
  },
  {
    accessorFn: (row) => row?.status?.podIP ?? '',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    id: 'pod_ip',
    header: memo(({ column }) => <HeaderAction column={column} name={'PodIP'} />),
    cell: memo(({ row }) => <div>{row?.original?.status?.podIP}</div>),
  },
  {
    accessorFn: (row) => row?.status?.qosClass ?? '',
    id: 'qos',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    header: memo(({ column }) => <HeaderAction column={column} name={'QOS'} />),
    cell: memo(({ row }) => <div>{row?.original?.status?.qosClass}</div>),
  },
  {
    accessorKey: 'status.phase',
    meta: { className: 'min-w-[15ch] max-w-[15ch]' },
    id: 'phase',
    header: memo(({ column }) => <HeaderAction column={column} name={'Status'} />),
    cell: memo(({ row }) => <PodStatus pod={row.original} />),
  },
  {
    id: 'age',
    meta: { className: 'min-w-[7ch] max-w-[7ch]' },
    accessorFn: (row) => row?.metadata?.creationTimestamp,
    header: memo(({ column }) => <HeaderAction column={column} name={'Age'} />),
    cell: memo(({ getValue }) => <AgeCell age={getValue<string>()} />),
  },
];

export default columns;
