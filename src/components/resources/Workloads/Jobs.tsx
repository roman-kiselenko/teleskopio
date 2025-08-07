import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useJobsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/Jobs';

const Jobs = () => {
  const jobs = useJobsState();
  return (
    <DynamicResourceTable
      kind="Job"
      columns={columns}
      state={() => jobs.get() as Map<string, any>}
      setState={jobs.set}
    />
  );
};

export default Jobs;
