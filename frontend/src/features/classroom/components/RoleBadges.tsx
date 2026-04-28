import { Badge } from '@/shared/components/Badge';
import { ROLE_LABELS, ROLE_SHORT_LABELS, type MemberRole } from '../types';
import { ROLE_VARIANT, rankOf } from '../permissions';

interface RoleBadgesProps {
  primary: MemberRole;
  extras?: MemberRole[];
  /** Use shorter labels — useful inside chat or tight rows. */
  short?: boolean;
  /** Cap how many badges to render (excess collapsed into +N chip). */
  max?: number;
}

/**
 * Render the primary role first followed by any extra roles (sorted by rank,
 * highest first). De-duplicates against the primary. Compact by default so
 * it fits inline next to a name.
 */
export function RoleBadges({ primary, extras = [], short = false, max }: RoleBadgesProps) {
  const labels = short ? ROLE_SHORT_LABELS : ROLE_LABELS;
  const uniqueExtras = Array.from(new Set(extras))
    .filter((r) => r !== primary)
    .sort((a, b) => rankOf(b) - rankOf(a));
  const all: MemberRole[] = [primary, ...uniqueExtras];
  const visible = max ? all.slice(0, max) : all;
  const hidden = max && all.length > max ? all.length - max : 0;

  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {visible.map((role) => (
        <Badge key={role} variant={ROLE_VARIANT[role]}>
          {labels[role]}
        </Badge>
      ))}
      {hidden > 0 && (
        <Badge variant="blue">+{hidden}</Badge>
      )}
    </span>
  );
}
