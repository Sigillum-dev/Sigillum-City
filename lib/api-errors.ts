import { NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True bila `id` berbentuk UUID. Dipakai sebelum query supaya ID asal-asalan
 *  menghasilkan 404 biasa, bukan pesan error mentah dari Postgres. */
export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** Jawaban 500 generik: detail error database hanya dicatat di log server,
 *  tidak dikirim ke klien. */
export function dbError(error: { message: string }, context: string) {
  console.error(`[api] ${context}:`, error.message);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
