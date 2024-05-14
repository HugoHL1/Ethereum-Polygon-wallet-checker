import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          />
          <meta content="Front-end Test" name="description" />
          <link href="/favicon.ico" rel="icon" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
