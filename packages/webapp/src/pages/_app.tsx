import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import Metadata from "@/components/seo/metadata";
import { SSRProvider } from "react-bootstrap";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SSRProvider>
        <Metadata />
        <Component {...pageProps} />
      </SSRProvider>
    </>
  );
}
