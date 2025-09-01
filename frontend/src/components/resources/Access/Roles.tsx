import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useRolesState } from '@/store/resources';
import columns from '@/components/resources/Access/columns/Roles';

const Roles = () => {
  const ro = useRolesState();
  return (
    <DynamicResourceTable
      kind="Role"
      group="rbac.authorization.k8s.io"
      columns={columns}
      state={() => ro.get() as Map<string, any>}
      setState={ro.set}
    />
  );
};

export default Roles;
