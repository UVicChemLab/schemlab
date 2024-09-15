import { ModeToggle } from "~/components/theme/mode-toggle";
import dynamic from "next/dynamic";
const Sketcher = dynamic(() => import("~/components/sketcher/editor"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="">
      <div className="m-10 flex h-[60svh] w-1/2 items-center justify-center rounded-md border-2">
        <Sketcher />
      </div>
      <div className="fixed bottom-4 right-4">
        <ModeToggle />
      </div>
    </main>
  );
}
