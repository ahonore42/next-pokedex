import Link from 'next/link';

// Matches "Teaches [Move Name] to a compatible" at the start of an effect string.
const TEACHES_RE = /^(Teaches )(.+?)( to a compatible)/;

function renderEffectText(text: string) {
  const match = TEACHES_RE.exec(text);
  if (!match) return text;
  const [, prefix, moveName, suffix] = match;
  const rest = text.slice(match[0].length);
  const moveSlug = moveName.toLowerCase().replace(/\s+/g, '-');
  return (
    <>
      {prefix}
      <Link href={`/moves/${moveSlug}`} className="text-brand hover:text-brand-hover font-medium">
        {moveName}
      </Link>
      {suffix}
      {rest}
    </>
  );
}

interface ItemDescriptionProps {
  effectText: string;
  description: string;
}

export function renderItemDescription({ effectText, description }: ItemDescriptionProps) {
  return (
    <div className="space-y-1">
      {effectText && <p>{renderEffectText(effectText)}</p>}
      {description && <p className="italic opacity-80">{description}</p>}
    </div>
  );
}
