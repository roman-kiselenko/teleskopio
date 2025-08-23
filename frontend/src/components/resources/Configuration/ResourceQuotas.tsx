import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useResourceQuotasState } from '@/store/resources';
import columns from '@/components/resources/Configuration/columns/ResourceQuotas';

const ResourceQuotas = () => {
  const rq = useResourceQuotasState();
  return (
    <DynamicResourceTable
      kind="ResourceQuota"
      group=""
      columns={columns}
      state={() => rq.get() as Map<string, any>}
      setState={rq.set}
    />
  );
};

export default ResourceQuotas;
