import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useHorizontalPodAutoscalerState } from '@/store/resources';
import columns from '@/components/resources/Configs/columns/Namespaces';

const HorizontalPodAutoscalers = () => {
  const ns = useHorizontalPodAutoscalerState();
  return (
    <DynamicResourceTable
      kind="HorizontalPodAutoscaler"
      columns={columns}
      state={() => ns.get() as Map<string, any>}
      setState={ns.set}
    />
  );
};

export default HorizontalPodAutoscalers;
