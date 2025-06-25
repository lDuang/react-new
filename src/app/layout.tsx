import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/landing/header";
import { CustomScrollbar } from "@/components/ui/CustomScrollbar";
import AuthInitializer from "@/features/auth/components/AuthInitializer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "技点迷津 - 一个大学生的成长之路 (CoderPath)",
  description: "欢迎来到技点迷津的个人博客。这里是 CoderPath，用代码与文字记录学习、思考与实践",
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
