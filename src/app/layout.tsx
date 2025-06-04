import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import "~/styles/globals.css";
import { StagewiseDevToolbar } from "./_components/StagewiseDevToolbar";

export const metadata: Metadata = {
  title: "FusionAI",
  description:
    "科技创造健康生活 - 生成式AI全面重塑多元医疗应用场景",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable}`}>
      <body className="min-w-screen flex min-h-screen bg-body">
        {children}
        <StagewiseDevToolbar />
      </body>
    </html>
  );
}
