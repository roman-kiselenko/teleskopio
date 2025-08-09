import { DynamicResourceTable } from '@/components/resources/DynamicResourceTable';
import { useLimitRangesState } from '@/store/resources';
import columns from '@/components/resources/Configs/columns/LimitRanges';

const LimitRanges = () => {
  const lr = useLimitRangesState();
  return (
    <DynamicResourceTable
      kind="LimitRange"
      columns={columns}
      state={() => lr.get() as Map<string, any>}
      setState={lr.set}
    />
  );
};

export default LimitRanges;
