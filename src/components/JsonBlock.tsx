export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="ap-json">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
