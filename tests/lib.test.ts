import { test } from "node:test";
import assert from "node:assert/strict";
import { isUuid } from "../lib/api-errors";
import { WAGE_SPLIT } from "../lib/currency";
import { describeEvent, type LandingEvent } from "../components/landing/ledger-events";

const ev = (over: Partial<LandingEvent>): LandingEvent => ({
  id: "1",
  jobId: "j",
  at: "2026-01-01T00:00:00Z",
  type: "job_created",
  note: null,
  title: "My job",
  ...over,
});

test("isUuid accepts real UUIDs and rejects junk", () => {
  assert.equal(isUuid("845544ee-d1e1-46c0-9ea3-0be9821d18e8"), true);
  assert.equal(isUuid("x"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid("845544ee-d1e1-46c0-9ea3-0be9821d18e8'; drop table jobs;--"), false);
});

test("wage split adds up to 100%", () => {
  const sum = WAGE_SPLIT.patronsPct + WAGE_SPLIT.lampOilPct + WAGE_SPLIT.tithePct + WAGE_SPLIT.furnacePct;
  assert.equal(sum, 100);
});

test("describeEvent builds Vault line with amount from note", () => {
  const line = describeEvent(ev({ note: "Wage of 100 SGUM locked" }));
  assert.ok(line);
  assert.equal(line.label, "Vault");
  assert.match(line.text, /100 SGUM locked in the Vault/);
});

test("describeEvent hides intermediate and unknown events", () => {
  for (const type of ["selecting", "reading_brief", "drafting", "error", "nope"]) {
    assert.equal(describeEvent(ev({ type })), null, type);
  }
});

test("describeEvent never trusts note text for sealed lines", () => {
  const line = describeEvent(ev({ type: "sealed", note: "<script>alert(1)</script>" }));
  assert.ok(line);
  assert.doesNotMatch(line.text, /script/);
});
