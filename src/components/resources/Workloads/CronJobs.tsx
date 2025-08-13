import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useCronJobsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/CronJobs';

const CronJobs = () => {
  const cronjobs = useCronJobsState();
  return (
    <DynamicResourceTable
      kind="CronJob"
      group="batch"
      columns={columns}
      state={() => cronjobs.get() as Map<string, any>}
      setState={cronjobs.set}
    />
  );
};

export default CronJobs;
