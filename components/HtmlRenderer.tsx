import React from 'react';

interface HtmlRendererProps {
  htmlContent: string;
}

/**
 * Renders a string of HTML content within a sandboxed iframe for security.
 */
export const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  return (
    <div className="w-full h-96 bg-white rounded-lg border border-brand-border overflow-hidden">
      <iframe
        srcDoc={htmlContent}
        title="HTML Content Preview"
        // The sandbox attribute provides security by blocking scripts, popups, etc.
        sandbox="" 
        className="w-full h-full border-0"
      />
    </div>
  );
};
