import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
export default function Document() {
  return (
    <Html lang="en">
      <Head>
      </Head>
      <body className="bg-[url('../public/images/perfectBackground.png')] bg-center bg-cover">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}