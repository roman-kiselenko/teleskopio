import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useServicesState } from '@/store/resources';
import columns from '@/components/resources/Networking/columns/Services';

const Services = () => {
  const sv = useServicesState();
  return (
    <DynamicResourceTable
      kind="Service"
      group=""
      columns={columns}
      state={() => sv.get() as Map<string, any>}
      setState={sv.set}
    />
  );
};

export default Services;
