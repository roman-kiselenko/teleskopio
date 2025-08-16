import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useNodesState } from '@/store/resources';
import columns from '@/components/resources/Cluster/columns/Nodes';

const Nodes = () => {
  const no = useNodesState();
  return (
    <DynamicResourceTable
      kind="Node"
      group=""
      columns={columns}
      state={() => no.get() as Map<string, any>}
      setState={no.set}
      withNsSelector={false}
    />
  );
};

export default Nodes;
