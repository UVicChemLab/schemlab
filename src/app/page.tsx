import Sketcher from "~/components/sketcher/editor";
import { ModeToggle } from "~/components/Mode-Toggle";
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
