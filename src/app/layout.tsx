import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/landing/header";
import { CustomScrollbar } from "@/components/ui/CustomScrollbar";
import AuthInitializer from "@/features/auth/components/AuthInitializer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "技点迷津 - 交互式首页",
  description: "一个用代码和文字耕耘思想的数字花园。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} bg-deep-space`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer>
            <Header />
            <main>{children}</main>
            <CustomScrollbar />
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
