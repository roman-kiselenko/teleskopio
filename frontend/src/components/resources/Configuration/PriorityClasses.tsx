import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePriorityClassesState } from '@/store/resources';
import columns from '@/components/resources/Configuration/columns/PriorityClasses';

const PriorityClasses = () => {
  const lr = usePriorityClassesState();
  return (
    <DynamicResourceTable
      kind="PriorityClass"
      group="scheduling.k8s.io"
      columns={columns}
      state={() => lr.get() as Map<string, any>}
      setState={lr.set}
      withNsSelector={false}
    />
  );
};

export default PriorityClasses;
