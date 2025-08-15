import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePersistentVolumeClaimsState } from '@/store/resources';
import columns from '@/components/resources/Storage/columns/PersistentVolumeClaims';

const PersistentVolumeClaims = () => {
  const pv = usePersistentVolumeClaimsState();
  return (
    <DynamicResourceTable
      kind="PersistentVolumeClaim"
      group=""
      columns={columns}
      state={() => pv.get() as Map<string, any>}
      setState={pv.set}
    />
  );
};

export default PersistentVolumeClaims;
