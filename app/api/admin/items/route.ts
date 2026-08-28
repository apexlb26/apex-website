import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { createItem, deleteItem, listItems, reorderItems, updateItem } from "@/shared/store";
import { publishContentUpdate } from "@/shared/realtime";
import type { AdminItemKind, AdminItemResponse, AdminItemsResponse, Locale } from "@/shared/types";

/*
 * CRUD for the lists an editor owns: products, blog posts, blog updates and
 * career roles. Each is its own MongoDB document, so adding and deleting are
 * real operations rather than a rewrite of the whole content document.
 *
 * Every mutation ends with publishContentUpdate(), which pushes over Socket.IO
 * so open pages show the change immediately.
 */

const KINDS = new Set<AdminItemKind>(["product", "post", "update", "role"]);

function parseLocale(value: unknown): Locale {
  return value === "ar" ? "ar" : "en";
}

function parseKind(value: unknown): AdminItemKind | null {
  return KINDS.has(value as AdminItemKind) ? (value as AdminItemKind) : null;
}

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  const url = new URL(request.url);
  const kind = parseKind(url.searchParams.get("kind"));
  if (!kind) return fail("Unknown item type.", 422);

  try {
    const items = await listItems(parseLocale(url.searchParams.get("locale")), kind);
    return NextResponse.json<AdminItemsResponse>({ ok: true, items });
  } catch (error) {
    return fail(message(error, "Could not load items"), 500);
  }
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { locale?: string; kind?: string; data?: Record<string, unknown> };
    const kind = parseKind(body.kind);
    if (!kind) return fail("Unknown item type.", 422);
    const locale = parseLocale(body.locale);

    const item = await createItem(locale, kind, body.data);
    await publishContentUpdate(locale, "item");
    return NextResponse.json<AdminItemResponse>({ ok: true, item }, { status: 201 });
  } catch (error) {
    return fail(message(error, "Could not add the item"), 500);
  }
}

export async function PUT(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { locale?: string; id?: string; data?: Record<string, unknown>; order?: string[] };
    const locale = parseLocale(body.locale);

    // A reorder sends the full id list for one kind; an edit sends one item.
    if (Array.isArray(body.order)) {
      await reorderItems(body.order);
      await publishContentUpdate(locale, "item");
      return NextResponse.json({ ok: true });
    }

    if (!body.id || !body.data) return fail("An item id and its fields are required.", 422);
    await updateItem(body.id, body.data);
    await publishContentUpdate(locale, "item");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(message(error, "Could not save the item"), 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return fail("An item id is required.", 422);

  try {
    await deleteItem(id);
    await publishContentUpdate(parseLocale(url.searchParams.get("locale")), "item");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(message(error, "Could not delete the item"), 500);
  }
}
