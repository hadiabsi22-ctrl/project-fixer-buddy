import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent = ({ content, className = "" }: MarkdownContentProps) => {
  // Remove pros/cons metadata from display
  const cleanContent = content
    .replace(/<!--PROS:.*?-->/s, "")
    .replace(/<!--CONS:.*?-->/s, "");

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-[#a855f7] mt-8 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-[#a855f7] mt-8 mb-4 border-r-4 border-[#a855f7] pr-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-[#a855f7] mt-6 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-foreground mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-white leading-loose mb-6 text-base md:text-lg">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-6 mr-4 text-white">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 mr-4 text-white">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-white leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-primary bg-primary/5 pr-4 py-3 my-6 rounded-l-lg">
              <div className="text-muted-foreground italic">{children}</div>
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img
                src={src}
                alt={alt || ""}
                loading="lazy"
                className="w-full max-w-[500px] mx-auto rounded-xl border border-border shadow-lg"
              />
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-3">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-border" />,
          code: ({ children }) => (
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-6 text-sm">
              {children}
            </pre>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
