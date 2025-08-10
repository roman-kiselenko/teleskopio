import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePodDisruptionBudgetState } from '@/store/resources';
import columns from '@/components/resources/Configuration/columns/PodDisruptionBudgets';

const PodDisruptionBudgets = () => {
  const ns = usePodDisruptionBudgetState();
  return (
    <DynamicResourceTable
      kind="PodDisruptionBudget"
      columns={columns}
      state={() => ns.get() as Map<string, any>}
      setState={ns.set}
    />
  );
};

export default PodDisruptionBudgets;
