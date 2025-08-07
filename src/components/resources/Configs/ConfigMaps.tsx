import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useConfigmapsState } from '@/store/resources';
import columns from '@/components/resources/Configs/columns/ConfigMaps';

const ConfigMaps = () => {
  const cm = useConfigmapsState();
  return (
    <DynamicResourceTable
      kind="ConfigMap"
      columns={columns}
      state={() => cm.get() as Map<string, any>}
      setState={cm.set}
    />
  );
};

export default ConfigMaps;
