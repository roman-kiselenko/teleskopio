import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useIngressClassesState } from '@/store/resources';
import columns from '@/components/resources/Networking/columns/IngressClasses';

const IngressClasses = () => {
  const ing = useIngressClassesState();
  return (
    <DynamicResourceTable
      kind="IngressClass"
      group="networking.k8s.io"
      columns={columns}
      state={() => ing.get() as Map<string, any>}
      setState={ing.set}
    />
  );
};

export default IngressClasses;
