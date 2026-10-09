// Settings for the browser tests, resolved once and shared by the config and the tests.
// Order: environment variables, then the worktree env file (ENV_FILE, default .env), then
// ops/project.conf. KEY=value files are parsed, never executed.
import * as fs from 'fs';
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '..');

function readKeyValues(file: string): Record<string, string> {
  const values: Record<string, string> = {};
  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return values;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.endsWith(value[0])) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const projectConf = readKeyValues(path.join(repoRoot, 'ops', 'project.conf'));
const envFile = readKeyValues(
  path.join(repoRoot, process.env.ENV_FILE || projectConf.ENV_FILE || '.env'),
);

function first(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    if (candidate && candidate.trim()) return candidate.trim();
  }
  return '';
}

function validTimeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(0);
  } catch {
    throw new Error(
      `e2e: "${timeZone}" is not an IANA timezone. Set APP_TIMEZONE (or PROJECT_TIMEZONE in ops/project.conf), e.g. Asia/Manila.`,
    );
  }
  return timeZone;
}

const healthPath = first(process.env.HEALTH_PATH, projectConf.HEALTH_PATH, '/health');
const basicAuthUser = first(process.env.BASIC_AUTH_USER);
const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD || '';

export const settings = {
  repoRoot,
  /** The app under test; empty means "not set", and every test then fails with a hint. */
  baseURL: first(process.env.BASE_URL, process.env.APP_URL, envFile.APP_URL),
  /** Must return 200 without auth (the deploy and uptime checks rely on it). */
  healthPath: healthPath.startsWith('/') ? healthPath : `/${healthPath}`,
  /** The project's timezone: the browser runs in it, whatever the machine's own timezone is. */
  timezone: validTimeZone(
    first(
      process.env.APP_TIMEZONE,
      process.env.PROJECT_TIMEZONE,
      envFile.APP_TIMEZONE,
      projectConf.PROJECT_TIMEZONE,
      'UTC',
    ),
  ),
  /** Staging sits behind basic auth; CI passes the login as secrets. */
  httpCredentials: basicAuthUser
    ? { username: basicAuthUser, password: basicAuthPassword }
    : undefined,
};

export const missingBaseURL =
  'No app URL: set BASE_URL or APP_URL (a worktree has APP_URL in its env file), then start the app (team-app up).';
