import React from "react";
import ReactMarkdown from "react-markdown";

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        strong: ({node, ...props}) => <strong className="font-bold text-purple-700 dark:text-purple-300" {...props} />,
        b: ({node, ...props}) => <b className="font-bold text-purple-700 dark:text-purple-300" {...props} />,
        // Puedes personalizar más etiquetas aquí
      }}
      linkTarget="_blank"
      skipHtml={false}
    >
      {children}
    </ReactMarkdown>
  );
}
