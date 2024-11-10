import Link from "next/link";
import { Button } from "~/components/ui/button";
export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <main className="p-[2rem]">
      <div>{org}</div>

      <Link
        href={`/admin?api_path=${process.env.PUBLIC_URL}${process.env.REACT_APP_API_PATH}`}
      >
        <Button>Add Question</Button>
      </Link>
    </main>
  );
}
