export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        overflowX: "auto",
        fontSize: 12,
        lineHeight: 1.4
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

