import { describe, expect, it } from "vitest";
import { buildPaymentRequest, normalizePhone } from "./payment";

describe("payment helpers", () => {
  it("normalizes Kenyan 07 phone numbers to 254 format", () => {
    expect(normalizePhone("0712 345 678")).toBe("254712345678");
    expect(normalizePhone("712345678")).toBe("254712345678");
  });

  it("rejects malformed numbers and non-positive amounts", () => {
    expect(normalizePhone("0112 345 678")).toBeNull();
    expect(buildPaymentRequest("0712345678", 0)).toBeNull();
  });

  it("builds the IntaSend request body", () => {
    expect(buildPaymentRequest("0712345678", 100)).toMatchObject({
      phone_number: "254712345678",
      email: "customer@courtneytech.xyz",
      amount: 100,
    });
  });
});
