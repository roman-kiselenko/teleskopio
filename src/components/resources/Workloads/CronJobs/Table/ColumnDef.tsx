import BlinkingCell from '@/components/ui/BlinkingCell';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getKubeconfig, getCluster } from '@/store/cluster';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { CronJob } from '@/components/resources/Workloads/CronJobs/types';
import JobName from '@/components/resources/ResourceName';
import cronstrue from 'cronstrue';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Actions from '@/components/resources/Table/Actions';

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s: '%ds',
    ss: '%ds',
    m: '%dm',
    mm: '%dm',
    h: '%dh',
    hh: '%dh',
    d: '%dd',
    dd: '%dd',
    w: '%dw',
    ww: '%dw',
    M: '%dmn',
    MM: '%dmn',
    y: '%dy',
    yy: '%dy',
  },
});

const columns: ColumnDef<CronJob>[] = [
  {
    accessorKey: 'metadata.name',
    id: 'name',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.metadata.name;
      return <JobName name={name} content={row.original.metadata.namespace} />;
    },
  },
  {
    accessorKey: 'metadata.namespace',
    id: 'namespace',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Namespace
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.metadata.namespace;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'spec.schedule',
    id: 'schedule',
    header: 'Schedule',
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-bold">{row.original.spec.schedule}</div>
            </TooltipTrigger>
            <TooltipContent>{cronstrue.toString(row.original.spec.schedule)}</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    id: 'creationTimestamp',
    accessorFn: (row) => row.metadata?.creationTimestamp,
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Age
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const age = moment(getValue<string>()).fromNow();
      const ageSeconds = moment().diff(getValue<string>(), 'seconds');
      return <BlinkingCell timestamp={getValue<string>()} value={age} isNew={ageSeconds < 60} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cronjob = row.original;
      const payload = {
        path: getKubeconfig(),
        context: getCluster(),
        cronjobNamespace: cronjob.metadata.namespace,
        cronjobName: cronjob.metadata.name,
      };
      return (
        <Actions resource={cronjob} name={'CronJob'} action={'delete_cronjob'} payload={payload} />
      );
    },
  },
];

export default columns;
