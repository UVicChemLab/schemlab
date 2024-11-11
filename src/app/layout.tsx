import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { ModeToggle } from "~/components/Mode-Toggle";
import { SessionProvider } from "next-auth/react";
import { ProfileProvider } from "~/components/profile-provider";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Spectroscopy Chemistry Lab",
  description: "An open-source interactive spectroscopy website",
  icons: [{ rel: "icon", url: "/compound.png" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <ProfileProvider>
        <html
          lang="en"
          className={`${GeistSans.variable}`}
          suppressHydrationWarning
        >
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <div className="fixed bottom-4 right-4">
                <ModeToggle />
              </div>
            </ThemeProvider>
          </body>
        </html>
      </ProfileProvider>
    </SessionProvider>
  );
}
