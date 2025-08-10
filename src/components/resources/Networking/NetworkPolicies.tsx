import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useNetworkPoliciesState } from '@/store/resources';
import columns from '@/components/resources/Networking/columns/NetworkPolicies';

const NetworkPolicies = () => {
  const np = useNetworkPoliciesState();
  return (
    <DynamicResourceTable
      kind="NetworkPolicy"
      columns={columns}
      state={() => np.get() as Map<string, any>}
      setState={np.set}
    />
  );
};

export default NetworkPolicies;
