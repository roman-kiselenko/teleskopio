function ResourceName({ name }: { name: string | undefined }) {
  return <div className="flex flex-row items-center">{name}</div>;
}

export default ResourceName;
