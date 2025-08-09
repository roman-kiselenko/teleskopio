import { Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeaderAction from '@/components/ui/Table/HeaderAction';
import { memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Cluster } from '@/types';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { call } from '@/lib/api';
import { setVersion } from '@/store/version';
import { setCurrentCluster } from '@/store/cluster';
import { apiResourcesState } from '@/store/api-resources';
import { crdResourcesState } from '@/store/crd-resources';

const columns: ColumnDef<Cluster>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: memo(({ column }) => <HeaderAction column={column} name={'Name'} />),
    cell: memo(({ row }) => <div>{row.original.name}</div>),
  },
  {
    accessorKey: 'path',
    id: 'path',
    header: memo(({ column }) => <HeaderAction column={column} name={'Path'} />),
    cell: memo(({ row }) => <div>{row.original.path}</div>),
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
        toast.promise(call('get_version', { context: cluster, path: path }), {
          loading: 'Connecting...',
          success: async (data: { gitVersion: string }) => {
            setVersion(data.gitVersion);
            setCurrentCluster(cluster, path);
            apiResourcesState.set(await call('list_apiresources', {}));
            crdResourcesState.set(await call('list_crd_resources', {}));
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
        });
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
