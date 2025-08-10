import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useNamespacesState } from '@/store/resources';
import columns from '@/components/resources/Configuration/columns/Namespaces';

const Namespaces = () => {
  const ns = useNamespacesState();
  return (
    <DynamicResourceTable
      kind="Namespace"
      columns={columns}
      state={() => ns.get() as Map<string, any>}
      setState={ns.set}
    />
  );
};

export default Namespaces;
