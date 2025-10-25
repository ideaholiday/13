import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import * as nodeHttp from "http";
import * as nodeHttps from "https";

const tboProxy = process.env.NEXT_PUBLIC_TBO_PROXY;
let agent: any = undefined;

if (tboProxy?.startsWith("socks5://")) {
  agent = new SocksProxyAgent(tboProxy);
} else if (tboProxy?.startsWith("http://") || tboProxy?.startsWith("https://")) {
  // For HTTP proxy, let axios handle it via proxy: false + agent won't help; prefer standard env or direct proxy option.
  // Keep agent undefined and rely on axios proxy config at request time if needed.
}

export const http = axios.create({
  // Ensure Node adapters are used
  adapter: undefined,
  httpAgent: agent ?? new nodeHttp.Agent({ keepAlive: true, family: 4 }),
  httpsAgent: agent ?? new nodeHttps.Agent({ keepAlive: true, family: 4 }),
  proxy: false,
  timeout: 15000,
});
