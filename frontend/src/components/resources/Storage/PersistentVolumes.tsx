import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePersistentVolumesState } from '@/store/resources';
import columns from '@/components/resources/Storage/columns/PersistentVolumes';

const PersistentVolumes = () => {
  const pv = usePersistentVolumesState();
  return (
    <DynamicResourceTable
      kind="PersistentVolume"
      group=""
      columns={columns}
      state={() => pv.get() as Map<string, any>}
      setState={pv.set}
      withNsSelector={false}
    />
  );
};

export default PersistentVolumes;
