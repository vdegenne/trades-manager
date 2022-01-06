import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

// --- Locale
TimeAgo.addDefaultLocale(en)
export const timeAgo = new TimeAgo('en-US')