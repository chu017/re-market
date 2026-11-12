// Cloudflare Worker that rebuilds the Pages site every morning so the dashboard shows fresh MLS data.
//
// Setup (Cloudflare dashboard):
//   1. Pages project -> Settings -> Builds -> Deploy hooks -> add one for branch "main"; copy its URL.
//   2. Workers & Pages -> Create -> Worker -> paste this file -> Deploy.
//   3. Worker -> Settings -> Variables and Secrets -> add secret DEPLOY_HOOK_URL = the URL from step 1.
//   4. Worker -> Settings -> Trigger events -> Cron trigger: 0 14 * * *   (14:00 UTC = 6-7am Pacific)

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(trigger(env));
  },
  // Opening the worker URL shows whether the hook is configured; it never triggers a build.
  async fetch(_request, env) {
    return new Response(env.DEPLOY_HOOK_URL ? 'Daily rebuild is configured.' : 'DEPLOY_HOOK_URL secret is not set.', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};

async function trigger(env) {
  if (!env.DEPLOY_HOOK_URL) throw new Error('DEPLOY_HOOK_URL secret is not set');
  const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
  if (!res.ok) throw new Error(`Deploy hook failed: ${res.status} ${await res.text()}`);
}
