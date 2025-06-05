import Image from "next/image";

export function AppHeader() {
  return (
    <div className="p-4">
      <img
        src="/images/fusion_ai.png"
        alt="Fusion AI"
        className="h-[28px] w-auto"
      />
    </div>
  );
}
