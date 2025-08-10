import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useSecretsState } from '@/store/resources';
import columns from '@/components/resources/Configuration/columns/Secrets';

const Secrets = () => {
  const ss = useSecretsState();
  return (
    <DynamicResourceTable
      kind="Secret"
      columns={columns}
      state={() => ss.get() as Map<string, any>}
      setState={ss.set}
    />
  );
};

export default Secrets;
