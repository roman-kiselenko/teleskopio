import { ArrowUpDown, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Cluster } from '@/components/pages/Start/types';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { invoke } from '@tauri-apps/api/core';
import { setVersion } from '@/store/version';
import { setCurrentCluster } from '@/store/cluster';

const columns: ColumnDef<Cluster>[] = [
  {
    accessorKey: 'name',
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
      const name = row.original.name;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: 'path',
    id: 'path',
    header: ({ column }) => {
      return (
        <Button
          className="text-xs"
          variant="table"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Path
          <ArrowUpDown className="ml-2 h-2 w-2" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const path = row.original.path;
      return <div>{path}</div>;
    },
  },
  {
    accessorKey: 'server',
    id: 'server',
    header: 'Server',
    cell: ({ row }) => {
      return <div>{row.original.server}</div>;
    },
  },
  {
    accessorKey: 'connect',
    id: 'connect',
    header: '',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const get_version = async (cluster: string, path: any) => {
        toast.promise(
          invoke<{ gitVersion: string }>('get_version', { path: path, context: cluster }),
          {
            loading: 'Connecting...',
            success: (data: { gitVersion: string }) => {
              setVersion(data.gitVersion);
              setCurrentCluster(cluster, path);
              navigate('/cluster');
              return (
                <span>
                  Successfully connected to <b>{cluster}</b> <b>{data.gitVersion}</b>
                </span>
              );
            },
            error: (err) => (
              <span>
                Cant connect to <b>{cluster}</b>
                <br />
                {err.message}
              </span>
            ),
          },
        );
      };
      return (
        <Button
          className="text-xs"
          variant="outline"
          size="sm"
          onClick={async () => await get_version(row.original.name, row.original.path)}
        >
          <Unplug className="h-2 w-2" />
          Connect
        </Button>
      );
    },
  },
];

export default columns;
