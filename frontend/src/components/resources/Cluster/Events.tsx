import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useEventsState } from '@/store/resources';
import columns from '@/components/resources/Cluster/columns/Events';
import { getVersion } from '@/store/version';
import { compareVersions } from 'compare-versions';

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
    />
  );
};

export default Events;
