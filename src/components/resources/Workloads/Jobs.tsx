import { useCurrentClusterState } from '@/store/cluster';
import { useJobsState, getJobs } from '@/store/jobs';
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

const Jobs = () => {
  const cc = useCurrentClusterState();
  const jobsState = useJobsState();

  useEffect(() => {
    getJobs(cc.kube_config.get(), cc.cluster.get());
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
          {jobsState.jobs.get().map((j: any, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="font-bold">{j.metadata.namespace}</span>/{j.metadata.name}
              </TableCell>
              <TableCell>{moment(j.metadata.creationTimestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Jobs;
