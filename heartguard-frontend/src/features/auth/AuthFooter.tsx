/**
 * AuthFooter Component
 * Links and help text for auth pages
 */

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export function AuthFooter({ text, linkText, linkHref }: AuthFooterProps) {
  return (
    <div className="mt-6 text-center">
      <p className="text-base text-gray-600">
        {text}{' '}
        <a 
          href={linkHref}
          className="font-semibold text-[#D4A44A] hover:text-[#B8903E] transition-colors"
        >
          {linkText}
        </a>
      </p>
    </div>
  );
}
