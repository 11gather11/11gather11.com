// Wires up the Copy and Back to top buttons that Ox Content's reader chrome adds to blog posts
// (src/config/reader-chrome.ts). The page works without it: the buttons simply do nothing.
import { initReaderChrome } from '@ox-content/vite-plugin/reader-chrome/client'

initReaderChrome(document)
