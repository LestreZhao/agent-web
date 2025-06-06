export function AppHeader({
  children,
  asChild,
}: {
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4">
      {asChild ? children : <></>}
      <img
        src="/images/fusion_ai.png"
        alt="Fusion AI"
        className="h-[28px] w-auto"
      />
    </div>
  );
}
