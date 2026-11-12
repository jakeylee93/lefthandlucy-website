import Home from './home'
import { sitePublished } from './content/anyvendor-server'
import { viewFromV1 } from './content/anyvendor-v1'

/**
 * Public page. Today the content source is anyOS (edit.js), exactly as before.
 * AnyVendor becomes the public source only when ANYVENDOR_PUBLIC_CONTENT=1 is set
 * on the deployment (the activation step) AND AnyVendor has published content;
 * unknown, unpublished or unreachable keeps the built-in content with anyOS.
 */
export default async function Page() {
  const site = process.env.ANYVENDOR_PUBLIC_CONTENT === '1' ? await sitePublished() : null
  return site ? <Home source="anyvendor" av={viewFromV1(site.content)} /> : <Home source="anyos" />
}
