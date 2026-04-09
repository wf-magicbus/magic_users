const HEADSCALE_URL = process.env.HEADSCALE_URL ?? "http://65.1.54.28:8080";
const HEADSCALE_API_KEY = process.env.HEADSCALE_API_KEY ?? "";

export async function headscaleFetch(path: string, init?: RequestInit) {
  const url = `${HEADSCALE_URL}/api/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Authorization": `Bearer ${HEADSCALE_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return res;
}
