export function generateOTP(): string {
  const max = 1_000_000;
  const maxValid = Math.floor(2 ** 32 / max) * max;
  let n: number;
  do {
    n = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (n >= maxValid);
  return String(n % max).padStart(6, "0");
}
