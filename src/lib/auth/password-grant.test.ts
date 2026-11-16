import assert from "node:assert/strict";
import test from "node:test";
import {
  decidePasswordLogin,
  publicAuthMessage,
  signInFailedMessage,
} from "./password-grant.ts";

const user = { id: "user-1" };

test("a flat password grant is a signed-in session", () => {
  const decision = decidePasswordLogin(
    {
      data: {
        session: { access_token: "access", refresh_token: "refresh" },
        user,
      },
      error: null,
    },
    {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
      user,
    },
  );

  assert.deepEqual(decision, { type: "signed-in" });
});

test("a nested session is restored instead of the generic auth error", () => {
  const decision = decidePasswordLogin(
    {
      data: { session: null, user: null },
      error: { message: "Auth session or user missing" },
    },
    {
      session: {
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        user,
      },
    },
  );

  assert.deepEqual(decision, {
    type: "restore",
    accessToken: "access-token",
    refreshToken: "refresh-token",
  });
});

test("a password grant error is shown instead of the generic auth error", () => {
  const decision = decidePasswordLogin(
    {
      data: { session: null, user: null },
      error: { message: "Auth session or user missing" },
    },
    {
      error_code: "invalid_credentials",
      msg: "Invalid login credentials",
    },
  );

  assert.deepEqual(decision, {
    type: "failed",
    message: "Invalid login credentials",
  });
});

test("an empty token response does not use the generic auth error", () => {
  const decision = decidePasswordLogin(
    {
      data: { session: null, user: null },
      error: { message: "Auth session or user missing" },
    },
    {},
  );

  assert.deepEqual(decision, {
    type: "failed",
    message: signInFailedMessage,
  });
});

test("email confirmation and API messages stay specific", () => {
  assert.equal(
    publicAuthMessage(
      { message: "Email not confirmed", code: "email_not_confirmed" },
      { msg: "Email not confirmed", error_code: "email_not_confirmed" },
    ),
    "Email not confirmed",
  );
});

test("token material is not copied into the login error", () => {
  const decision = decidePasswordLogin(
    {
      data: { session: null, user: null },
      error: { message: "Auth session or user missing" },
    },
    { msg: "failed access_token=secret" },
  );

  assert.equal(decision.type, "failed");
  if (decision.type === "failed") {
    assert.equal(decision.message, signInFailedMessage);
    assert.equal(decision.message.includes("secret"), false);
  }
});
