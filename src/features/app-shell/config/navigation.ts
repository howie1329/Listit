export type AppNavigationItem = {
  label: string
  to: '/app/bookmarks' | '/app/collections' | '/app/notes' | '/app/settings'
}

export const APP_NAV_ITEMS: AppNavigationItem[] = [
  { label: 'Bookmarks', to: '/app/bookmarks' },
  { label: 'Collections', to: '/app/collections' },
  { label: 'Notes', to: '/app/notes' },
  { label: 'Settings', to: '/app/settings' },
]
