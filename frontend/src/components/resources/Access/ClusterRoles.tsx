import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useClusterRolesState } from '@/store/resources';
import columns from '@/components/resources/Access/columns/ClusterRoles';

const ClusterRoles = () => {
  const ro = useClusterRolesState();
  return (
    <DynamicResourceTable
      kind="ClusterRole"
      group="rbac.authorization.k8s.io"
      columns={columns}
      state={() => ro.get() as Map<string, any>}
      setState={ro.set}
    />
  );
};

export default ClusterRoles;
