import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { DiscoverIcon, ExploreIcon, LibraryIcon, ReviewIcon, YouIcon } from './icons';

export const NAV_ITEMS = [
  { to: '/app/discover', key: 'discover', Icon: DiscoverIcon },
  { to: '/app/explore', key: 'explore', Icon: ExploreIcon },
  { to: '/app/review', key: 'review', Icon: ReviewIcon },
  { to: '/app/library', key: 'library', Icon: LibraryIcon },
  { to: '/app/you', key: 'you', Icon: YouIcon },
] as const;

/**
 * Five-tab navigation. Bottom bar on phones; vertical rail on wide screens.
 * `enabled={false}` renders the tabs as visibly unavailable ("Soon") instead of dead links.
 */
export function BottomNav({
  enabled = true,
  badges = {},
}: {
  enabled?: boolean;
  badges?: Partial<Record<string, number>>;
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[var(--safe-bottom)] backdrop-blur-xl lg:static lg:inset-auto lg:border-t-0 lg:bg-transparent lg:pb-0 lg:backdrop-blur-none"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-1 lg:max-w-none lg:flex-col lg:gap-1 lg:px-0">
        {NAV_ITEMS.map(({ to, key, Icon }) => {
          const label = t(`nav.${key}`);
          const badge = badges[key];
          if (!enabled) {
            return (
              <li key={key} className="flex-1 lg:flex-none">
                <span
                  aria-disabled="true"
                  className="flex min-h-[var(--nav-height)] flex-col items-center justify-center gap-0.5 px-1 text-muted opacity-60 lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:px-4"
                >
                  <Icon size={22} />
                  <span className="text-[11px] leading-tight font-medium lg:text-sm">{label}</span>
                  <span className="text-[10px] leading-tight lg:ml-auto lg:text-xs">
                    {t('nav.soon')}
                  </span>
                </span>
              </li>
            );
          }
          return (
            <li key={key} className="flex-1 lg:flex-none">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `pressable group relative flex min-h-[var(--nav-height)] flex-col items-center justify-center gap-1 px-1 lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:px-4 ${
                    isActive
                      ? 'text-primary lg:bg-accent-soft'
                      : 'text-muted hover:text-ink lg:hover:bg-sunken'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-[var(--dur)] lg:h-auto lg:w-auto ${
                        isActive ? 'bg-accent-soft lg:bg-transparent' : ''
                      }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                      {badge !== undefined && badge > 0 && (
                        <span className="absolute -top-0.5 right-2 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 font-bold text-on-primary lg:-top-1 lg:-right-2">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[11px] leading-tight lg:text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
