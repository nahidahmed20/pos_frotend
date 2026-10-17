// src/app/layout.jsx
import "./globals.css";
import Script from "next/script";
import { Suspense } from "react";
import NavigationProgress from "@/components/NavigationProgress";

export const metadata = {
  title: "Dreams POS - Inventory Management",
  description: "Advanced POS and E-commerce System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon & Apple Touch Icon */}
        <link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
        <link rel="stylesheet" href="/assets/css/bootstrap-datetimepicker.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/plugins/tabler-icons/tabler-icons.min.css" />
        <link rel="stylesheet" href="/assets/plugins/fontawesome/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/plugins/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>

      <body className="bg-white" suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}

        {/* Global scripts loaded non-blockingly */}
        <Script src="/assets/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
        <Script src="/assets/plugins/sweetalert/sweetalert2.all.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/feather.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}