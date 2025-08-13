import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useDaemonSetsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/DaemonSets';

const DaemonSets = () => {
  const dameonsets = useDaemonSetsState();
  return (
    <DynamicResourceTable
      kind="DaemonSet"
      group="apps"
      columns={columns}
      state={() => dameonsets.get() as Map<string, any>}
      setState={dameonsets.set}
    />
  );
};

export default DaemonSets;
