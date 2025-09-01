import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useHorizontalPodAutoscalerState } from '@/store/resources';
import columns from '@/components/resources/Cluster/columns/Namespaces';

const HorizontalPodAutoscalers = () => {
  const ns = useHorizontalPodAutoscalerState();
  return (
    <DynamicResourceTable
      kind="HorizontalPodAutoscaler"
      group="autoscaling"
      columns={columns}
      state={() => ns.get() as Map<string, any>}
      setState={ns.set}
    />
  );
};

export default HorizontalPodAutoscalers;
