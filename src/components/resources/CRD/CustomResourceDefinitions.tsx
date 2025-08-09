import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useCrdsState } from '@/store/resources';
import columns from '@/components/resources/CRD/columns';

const CustomResourceDefinitions = () => {
  const crd = useCrdsState();
  return (
    <DynamicResourceTable
      kind="CustomResourceDefinition"
      columns={columns}
      state={() => crd.get() as Map<string, any>}
      setState={crd.set}
    />
  );
};

export default CustomResourceDefinitions;
