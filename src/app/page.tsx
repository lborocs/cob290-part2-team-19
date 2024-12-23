"use client"

import Layout from "./layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If you need to see the layout page comment the next line, and uncomment the following line
  return <Layout>{children}{false}</Layout>;
  // return <Layout>{children}{true}</Layout>;
}

