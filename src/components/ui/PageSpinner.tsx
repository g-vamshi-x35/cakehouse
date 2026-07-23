export default function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-24">
      <span className="w-10 h-10 border-4 border-brown/15 border-t-rose rounded-full animate-spin" />
      <p className="text-sm text-brown/60 font-semibold tracking-wide">Loading…</p>
    </div>
  );
}
