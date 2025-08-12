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
      state={() => {
        const crArray = Array.from(cr.get().values()).filter((x) => x.kind === kind);
        let resources = new Map<string, any>();
        crArray.forEach((x) => {
          resources.set(x.metadata?.uid as string, x);
        });
        return resources;
      }}
      setState={cr.set}
    />
  );
};

export default CustomResources;
