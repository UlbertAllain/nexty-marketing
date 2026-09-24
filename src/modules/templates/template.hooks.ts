"use client";

import { useEffect, useState } from "react";
import { subscribeCustomMessageTemplates } from "./template.repository";
import type { CustomMessageTemplate } from "./template.types";

export function useCustomMessageTemplates() {
  const [items, setItems] = useState<CustomMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeCustomMessageTemplates((nextItems) => {
    setItems(nextItems);
    setLoading(false);
  }), []);

  return { items, loading };
}
