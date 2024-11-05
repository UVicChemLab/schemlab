import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { ModeToggle } from "~/components/Mode-Toggle";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "~/components/NavBar";

export const metadata: Metadata = {
  title: "Spectroscopy Chemistry Lab",
  description: "An open-source interactive spectroscopy website",
  icons: [{ rel: "icon", url: "/compound.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${GeistSans.variable}`}
        suppressHydrationWarning
      >
        <body>
          <NavBar />
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
    </ClerkProvider>
  );
}
