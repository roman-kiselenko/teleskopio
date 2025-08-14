import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useValidatingWebhooksState } from '@/store/resources';
import columns from '@/components/resources/Administration/columns/ValidatingWebhook';

const ValidatingWebhooks = () => {
  const cm = useValidatingWebhooksState();
  return (
    <DynamicResourceTable
      kind="ValidatingWebhookConfiguration"
      group="admissionregistration.k8s.io"
      columns={columns}
      state={() => cm.get() as Map<string, any>}
      setState={cm.set}
      withNsSelector={false}
    />
  );
};

export default ValidatingWebhooks;
