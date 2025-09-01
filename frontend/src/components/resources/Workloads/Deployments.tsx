import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useDeploymentsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/Deployments';

const Deployments = () => {
  const deployments = useDeploymentsState();
  return (
    <DynamicResourceTable
      kind="Deployment"
      group="apps"
      columns={columns}
      state={() => deployments.get() as Map<string, any>}
      setState={deployments.set}
    />
  );
};

export default Deployments;
