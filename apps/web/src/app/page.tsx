import dynamic from "next/dynamic";

const HomeContent = dynamic(() => import("@/components/home/HomeContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold shadow-lg animate-pulse">
          CC
        </div>
        <div className="h-1 w-32 rounded-full bg-blue-500/30 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-blue-500 animate-[shimmer_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <HomeContent />;
}
