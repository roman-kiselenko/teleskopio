import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useStorageClassesState } from '@/store/resources';
import columns from '@/components/resources/Storage/columns/StorageClasses';

const StorageClasses = () => {
  const sc = useStorageClassesState();
  return (
    <DynamicResourceTable
      kind="StorageClass"
      group="storage.k8s.io"
      columns={columns}
      state={() => sc.get() as Map<string, any>}
      setState={sc.set}
    />
  );
};

export default StorageClasses;
