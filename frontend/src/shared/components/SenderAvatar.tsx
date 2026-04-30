import { useAuthenticatedImage } from '@/shared/hooks/useAuthenticatedImage';

interface Props {
  name: string;
  avatarUrl: string | null | undefined;
  size?: number;
}

export function SenderAvatar({ name, avatarUrl, size = 28 }: Props) {
  const src = useAuthenticatedImage(avatarUrl)
    ?? (avatarUrl?.startsWith('http') ? avatarUrl : null);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: 'var(--sidebar-accent)', fontSize: size * 0.43 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
