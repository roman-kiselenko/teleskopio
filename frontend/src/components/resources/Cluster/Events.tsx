import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useEventsState } from '@/store/resources';
import columns from '@/components/resources/Cluster/columns/Events';
import { getVersion } from '@/store/version';
import { compareVersions } from 'compare-versions';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { ClipboardCopy } from 'lucide-react';

const Events = () => {
  const ev = useEventsState();
  let kind: string;
  let group: string;
  if (compareVersions(getVersion(), '1.20') === 1) {
    kind = 'Event';
    group = 'events.k8s.io';
  } else {
    kind = 'Event';
    group = '';
  }
  return (
    <DynamicResourceTable
      kind={kind}
      group={group}
      columns={columns}
      state={() => ev.get() as Map<string, any>}
      setState={ev.set}
      withSearch={false}
      doubleClickDisabled={true}
      deleteDisabled={true}
      contextMenuItems={(obj: any) => {
        let attribute = '';
        let attribute_name = '';
        if (compareVersions(getVersion(), '1.20') === 1) {
          attribute = obj.note;
          attribute_name = 'note';
        } else {
          attribute = obj.message;
          attribute_name = 'message';
        }
        return [
          <ContextMenuItem
            className="text-xs"
            onClick={() => navigator.clipboard.writeText(attribute)}
          >
            <ClipboardCopy size={8} />
            Copy {attribute_name}
          </ContextMenuItem>,
        ];
      }}
    />
  );
};

export default Events;
