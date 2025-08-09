import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useCrsState } from '@/store/resources';
import columns from '@/components/resources/CustomResources/columns';
import { useLoaderData } from 'react-router';

const CustomResources = () => {
  const cr = useCrsState();
  const { kind } = useLoaderData();

  return (
    <DynamicResourceTable
      kind={kind}
      columns={columns}
      state={() => cr.get() as Map<string, any>}
      setState={cr.set}
    />
  );
};

export default CustomResources;
