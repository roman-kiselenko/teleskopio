import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePodsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/Pods/Pods';

const Pods = () => {
  const pods = usePodsState();
  return (
    <DynamicResourceTable
      kind="Pod"
      columns={columns}
      state={() => pods.get() as Map<string, any>}
      setState={pods.set}
    />
  );
};

export default Pods;
