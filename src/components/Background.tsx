// Fixed ambient background: glow blobs + dot grid. Sits behind all content.
export default function Background({ dotGrid = true }: { dotGrid?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base">
      <div
        className="absolute -left-32 -top-40 h-[460px] w-[460px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7B3FE4 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-48 -right-32 h-[440px] w-[440px] rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, #FF6B2B 0%, transparent 70%)" }}
      />
      {dotGrid && <div className="bg-dotgrid absolute inset-0 opacity-100" />}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
