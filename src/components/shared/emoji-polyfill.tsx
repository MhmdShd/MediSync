"use client";

import { useEffect } from "react";

export function EmojiPolyfill() {
  useEffect(() => {
    import("country-flag-emoji-polyfill").then(({ polyfillCountryFlagEmojis }) => {
      polyfillCountryFlagEmojis();
    });
  }, []);

  return null;
}
