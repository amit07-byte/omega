import assert from "node:assert/strict";
import test from "node:test";
import { parseLogin, parseSignup } from "./credentials.ts";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

test("parseSignup accepts a business account", () => {
  const result = parseSignup(
    form({
      email: " Owner@Example.com ",
      password: "correct-horse",
      role: "business",
      displayName: "  North   Market  ",
    }),
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value, {
      email: "owner@example.com",
      password: "correct-horse",
      role: "business",
      displayName: "North Market",
    });
  }
});

test("parseSignup rejects a short password and an unknown role", () => {
  const shortPassword = parseSignup(
    form({
      email: "owner@example.com",
      password: "short",
      role: "creator",
      displayName: "Ada",
    }),
  );
  assert.equal(shortPassword.ok, false);

  const role = parseSignup(
    form({
      email: "owner@example.com",
      password: "correct-horse",
      role: "admin",
      displayName: "Ada",
    }),
  );
  assert.equal(role.ok, false);
});

test("parseLogin requires an email and a password", () => {
  const missing = parseLogin(form({ email: "not-an-email", password: "secret" }));
  assert.equal(missing.ok, false);

  const result = parseLogin(
    form({ email: "Creator@Example.com", password: "secret" }),
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.email, "creator@example.com");
  }
});
