import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useMutatingWebhooksState } from '@/store/resources';
import columns from '@/components/resources/Administration/columns/MutatingWebhook';

const MutatingWebhooks = () => {
  const cm = useMutatingWebhooksState();
  return (
    <DynamicResourceTable
      kind="MutatingWebhookConfiguration"
      group="admissionregistration.k8s.io"
      columns={columns}
      state={() => cm.get() as Map<string, any>}
      setState={cm.set}
    />
  );
};

export default MutatingWebhooks;
