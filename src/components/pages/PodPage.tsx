import { useCurrentClusterState } from '@/store/cluster';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function PodPage() {
  const cc = useCurrentClusterState();
  const navigate = useNavigate();
  let params = useParams();
  return (
    <div>
      <Button onClick={() => navigate(-1)} variant="default" className="h-8 w-8">
        <span className="text-sm">Back</span>
      </Button>
      <div>Pod UID: {params.uid}</div>
      <div>Config: {cc.kube_config.get()}</div>
      <div>Context: {cc.cluster.get()}</div>
    </div>
  );
}
