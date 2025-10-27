import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { usePodsState } from '@/store/resources';
import columns from '@/components/resources/Workloads/columns/Pods/Pods';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { ClipboardCopy, HandHelping, Rss } from 'lucide-react';
import { useNavigate } from 'react-router';

const Pods = () => {
  const pods = usePodsState();
  let navigate = useNavigate();
  return (
    <DynamicResourceTable
      kind="Pod"
      group=""
      columns={columns}
      state={() => pods.get() as Map<string, any>}
      setState={pods.set}
    />
  );
};

export default Pods;
