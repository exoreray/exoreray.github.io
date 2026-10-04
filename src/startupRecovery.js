// A browser handoff can interrupt one chunk request. Webpack clears failed
// chunk loads, so a second import can recover without throwing away the page.
export async function loadWithRetry(load) {
  try { return await load(); }
  catch {
    await new Promise(resolve=>setTimeout(resolve,300));
    return load();
  }
}

export function recoveryUrl(href,stamp=Date.now()) {
  const url=new URL(href);
  url.searchParams.set('reload',String(stamp));
  return url.href;
}
