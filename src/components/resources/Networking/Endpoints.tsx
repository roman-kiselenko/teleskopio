import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useEndpointsState } from '@/store/resources';
import columns from '@/components/resources/Networking/columns/Endpoints';

const Endpoints = () => {
  const ing = useEndpointsState();
  return (
    <DynamicResourceTable
      kind="Endpoints"
      columns={columns}
      state={() => ing.get() as Map<string, any>}
      setState={ing.set}
    />
  );
};

export default Endpoints;
