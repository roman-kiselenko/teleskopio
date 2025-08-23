function ResourceName({ name }: { name: String | undefined }) {
  return <div className="flex flex-row items-center">{name}</div>;
}

export default ResourceName;
