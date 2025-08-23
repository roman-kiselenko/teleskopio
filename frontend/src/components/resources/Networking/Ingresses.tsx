import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useIngressesState } from '@/store/resources';
import columns from '@/components/resources/Networking/columns/Ingresses';

const Ingresses = () => {
  const ing = useIngressesState();
  return (
    <DynamicResourceTable
      kind="Ingress"
      group="networking.k8s.io"
      columns={columns}
      state={() => ing.get() as Map<string, any>}
      setState={ing.set}
    />
  );
};

export default Ingresses;
