import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import Metadata from "@/components/seo/metadata";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Metadata />
      <Component {...pageProps} />
    </>
  );
}
