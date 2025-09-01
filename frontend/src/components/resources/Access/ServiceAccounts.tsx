import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useServiceAccountsState } from '@/store/resources';
import columns from '@/components/resources/Access/columns/ServiceAccounts';

const ServiceAccounts = () => {
  const sa = useServiceAccountsState();
  return (
    <DynamicResourceTable
      kind="ServiceAccount"
      group=""
      columns={columns}
      state={() => sa.get() as Map<string, any>}
      setState={sa.set}
    />
  );
};

export default ServiceAccounts;
