declare module 'html-react-parser' {
  import * as React from 'react';

  export interface HTMLReactParserOptions {
    replace?: (domNode: any) => React.ReactNode | void;
  }

  export function domToReact(
    nodes: any,
    options?: HTMLReactParserOptions,
  ): React.ReactNode[];

  const parse: (
    html: string,
    options?: HTMLReactParserOptions,
  ) => React.ReactNode;
  export default parse;
}
