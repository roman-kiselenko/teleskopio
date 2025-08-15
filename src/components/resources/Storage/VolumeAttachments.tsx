import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useVolumeAttachmentsState } from '@/store/resources';
import columns from '@/components/resources/Storage/columns/VolumeAttachments';

const VolumeAttachments = () => {
  const pv = useVolumeAttachmentsState();
  return (
    <DynamicResourceTable
      kind="VolumeAttachment"
      group="storage.k8s.io"
      columns={columns}
      state={() => pv.get() as Map<string, any>}
      setState={pv.set}
      withNsSelector={false}
    />
  );
};

export default VolumeAttachments;
