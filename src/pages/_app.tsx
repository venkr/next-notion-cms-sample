import { type AppType } from "next/dist/shared/lib/utils";
import "~/styles/globals.css";
import 'prismjs/themes/prism.css'
import React from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
