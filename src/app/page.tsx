import Link from "next/link";
import { Button } from "~/components/ui/button";
export default function HomePage() {
  return (
    <main className="p-[2rem]">
      <Link
        href={`/admin?api_path=${process.env.PUBLIC_URL}${process.env.REACT_APP_API_PATH}`}
      >
        <Button>Add Question</Button>
      </Link>
    </main>
  );
}
