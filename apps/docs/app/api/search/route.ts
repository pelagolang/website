import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// A static export has no server to search on, so the index is built once and searched in the browser.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
