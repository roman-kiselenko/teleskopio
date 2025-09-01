import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useReplicaSetsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/ReplicaSets';

const ReplicaSets = () => {
  const replicasets = useReplicaSetsState();
  return (
    <DynamicResourceTable
      kind="ReplicaSet"
      group="apps"
      columns={columns}
      state={() => replicasets.get() as Map<string, any>}
      setState={replicasets.set}
    />
  );
};

export default ReplicaSets;
