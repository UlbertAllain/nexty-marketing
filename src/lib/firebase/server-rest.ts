type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
}

function getFirebaseApiKey(): string {
  const value = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!value) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  return value;
}

function getFirebaseProjectId(): string {
  const value = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!value) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured.");
  return value;
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedFirebaseUser> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(getFirebaseApiKey())}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("INVALID_FIREBASE_TOKEN");
  }

  const payload = (await response.json()) as {
    users?: Array<{ localId?: string; email?: string }>;
  };
  const user = payload.users?.[0];

  if (!user?.localId) {
    throw new Error("INVALID_FIREBASE_TOKEN");
  }

  return {
    uid: user.localId,
    email: user.email,
  };
}

function decodeValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue ?? "";
  if ("integerValue" in value) return Number(value.integerValue ?? 0);
  if ("doubleValue" in value) return value.doubleValue ?? 0;
  if ("booleanValue" in value) return value.booleanValue ?? false;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue ?? null;
  if ("arrayValue" in value) {
    return (value.arrayValue?.values ?? []).map(decodeValue);
  }
  if ("mapValue" in value) {
    return decodeFields(value.mapValue?.fields ?? {});
  }
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]),
  );
}

function encodeValue(value: unknown): FirestoreValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value
          .map(encodeValue)
          .filter((item): item is FirestoreValue => item !== undefined),
      },
    };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: encodeFields(value as Record<string, unknown>),
      },
    };
  }
  return undefined;
}

function encodeFields(
  data: Record<string, unknown>,
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};

  for (const [key, value] of Object.entries(data)) {
    const encoded = encodeValue(value);
    if (encoded) fields[key] = encoded;
  }

  return fields;
}

function documentUrl(collection: string, documentId: string): string {
  const projectId = encodeURIComponent(getFirebaseProjectId());
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(documentId)}`;
}

export async function getFirestoreDocument<T>(
  collection: string,
  documentId: string,
  idToken: string,
): Promise<T | null> {
  const response = await fetch(documentUrl(collection, documentId), {
    headers: { authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`FIRESTORE_READ_FAILED_${response.status}`);
  }

  const document = (await response.json()) as FirestoreDocument;
  return decodeFields(document.fields ?? {}) as T;
}

export async function setFirestoreDocument(
  collection: string,
  documentId: string,
  data: Record<string, unknown>,
  idToken: string,
): Promise<void> {
  const response = await fetch(documentUrl(collection, documentId), {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields: encodeFields(data) }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FIRESTORE_WRITE_FAILED_${response.status}`);
  }
}

export async function patchFirestoreDocument(
  collection: string,
  documentId: string,
  data: Record<string, unknown>,
  idToken: string,
): Promise<void> {
  const fieldPaths = Object.keys(data);
  if (!fieldPaths.length) return;

  const url = new URL(documentUrl(collection, documentId));
  for (const fieldPath of fieldPaths) {
    url.searchParams.append("updateMask.fieldPaths", fieldPath);
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields: encodeFields(data) }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FIRESTORE_PATCH_FAILED_${response.status}`);
  }
}

type FirestoreListResponse = {
  documents?: Array<FirestoreDocument & { name?: string }>;
  nextPageToken?: string;
};

function collectionUrl(collection: string): string {
  const projectId = encodeURIComponent(getFirebaseProjectId());
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodeURIComponent(collection)}`;
}

export async function listFirestoreCollection<T>(
  collection: string,
  idToken: string,
): Promise<Array<T & { id: string }>> {
  const items: Array<T & { id: string }> = [];
  let pageToken = "";

  do {
    const url = new URL(collectionUrl(collection));
    url.searchParams.set("pageSize", "500");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`FIRESTORE_LIST_FAILED_${response.status}`);

    const payload = (await response.json()) as FirestoreListResponse;
    for (const document of payload.documents ?? []) {
      const rawId = document.name?.split("/").pop() || "";
      if (!rawId) continue;
      items.push({
        ...(decodeFields(document.fields ?? {}) as T),
        id: decodeURIComponent(rawId),
      });
    }

    pageToken = payload.nextPageToken || "";
  } while (pageToken);

  return items;
}
