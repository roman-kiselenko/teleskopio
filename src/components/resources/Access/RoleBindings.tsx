import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useRoleBindingsState } from '@/store/resources';
import columns from '@/components/resources/Access/columns/RoleBindings';

const RoleBindings = () => {
  const ro = useRoleBindingsState();
  return (
    <DynamicResourceTable
      kind="RoleBinding"
      group="rbac.authorization.k8s.io"
      columns={columns}
      state={() => ro.get() as Map<string, any>}
      setState={ro.set}
    />
  );
};

export default RoleBindings;
