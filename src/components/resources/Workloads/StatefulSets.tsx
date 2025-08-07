import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useStatefulSetsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/StatefulSets';

const StatefulSets = () => {
  const ss = useStatefulSetsState();
  return (
    <DynamicResourceTable
      kind="StatefulSet"
      columns={columns}
      state={() => ss.get() as Map<string, any>}
      setState={ss.set}
    />
  );
};

export default StatefulSets;
