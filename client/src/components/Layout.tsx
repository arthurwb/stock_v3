import React from "react";
import { Helmet } from "react-helmet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Helmet for Metadata */}
      <Helmet>
        <html lang="en" />
        <title>The Exchange</title>
        <meta name="description" content="The Exchange" />
        <link rel="icon" href="./exchange-logo.svg" />
      </Helmet>

      {/* Main Layout */}
      <div className={`relative font-mono text-white`}>
        {children}
      </div>
    </>
  );
}
