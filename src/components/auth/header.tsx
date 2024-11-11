import { Poppins } from "next/font/google";

import { appName, cn } from "~/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <h1 className={cn("text-3xl font-semibold", font.className)}>
        🧪 {appName}
      </h1>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};

export default Header;
