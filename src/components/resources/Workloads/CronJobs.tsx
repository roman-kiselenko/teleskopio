import { useCurrentClusterState } from '@/store/cluster';
import { useCronJobsState, getCronJobs } from '@/store/cronjobs';
import { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import moment from 'moment';

const CronJobs = () => {
  const cc = useCurrentClusterState();
  const cronJobsState = useCronJobsState();

  useEffect(() => {
    getCronJobs(cc.kube_config.get(), cc.cluster.get());
  }, [cc.kube_config.get(), cc.cluster.get()]);

  return (
    <div className="h-24 col-span-1">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium text-xs">
          {cronJobsState.cronjobs.get().map((cj: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{cj.metadata.namespace}</span>/{cj.metadata.name}
              </TableCell>
              <TableCell>{moment(cj.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CronJobs;
