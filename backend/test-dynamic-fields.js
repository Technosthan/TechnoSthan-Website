/**
 * Test dynamic field normalization and scoring system
 * Run: node test-dynamic-fields.js
 */

const {
  normalizeHeaderWithAliases,
  detectFieldType,
  buildFieldWeights,
  calculateMergeScore,
  DEFAULT_FIELD_ALIASES,
  DEFAULT_FIELD_WEIGHTS,
  DEFAULT_MERGE_THRESHOLD,
} = require("./utils/fieldNormalization");

console.log("=".repeat(70));
console.log("DYNAMIC FIELD NORMALIZATION TEST");
console.log("=".repeat(70));

// ============================================================================
// TEST 1: Header Alias Normalization
// ============================================================================
console.log("\n[TEST 1] Header Alias Normalization\n");

const testHeaders = [
  "email",
  "work email",
  "work_email",
  "work mail",
  "contact number",
  "contact_no",
  "mobile",
  "phone",
  "full name",
  "employee_id",
  "aadhaar",
  "city",
];

testHeaders.forEach((header) => {
  const normalized = normalizeHeaderWithAliases(header, DEFAULT_FIELD_ALIASES);
  console.log(`  "${header}" → "${normalized}"`);
});

// ============================================================================
// TEST 2: Field Type Detection
// ============================================================================
console.log("\n[TEST 2] Field Type Detection\n");

const testCases = [
  {
    header: "work_mail",
    values: ["john@company.com", "jane@company.com", "bob@company.com"],
  },
  {
    header: "contact_no",
    values: ["9876543210", "8765432109", "7654321098"],
  },
  {
    header: "employee_id",
    values: ["EMP001", "EMP002", "EMP003"],
  },
  {
    header: "location",
    values: ["New York", "San Francisco", "Los Angeles"],
  },
];

testCases.forEach(({ header, values }) => {
  const detection = detectFieldType(header, values, DEFAULT_FIELD_ALIASES);
  console.log(
    `  "${header}": type="${detection.type}", confidence=${(detection.confidence * 100).toFixed(0)}%, weight=${detection.weight}`,
  );
});

// ============================================================================
// TEST 3: Dynamic Merge Score Calculation
// ============================================================================
console.log("\n[TEST 3] Dynamic Merge Score Calculation\n");

const existing = {
  email: "john@company.com",
  phone: "9876543210",
  name: "John Doe",
  employee_id: "EMP001",
};

const scenarios = [
  {
    name: "Exact duplicate",
    incoming: { ...existing },
  },
  {
    name: "Same email + name",
    incoming: {
      email: "john@company.com",
      phone: "9999999999", // Different phone
      name: "John Doe",
    },
  },
  {
    name: "Same employee_id only",
    incoming: {
      employee_id: "EMP001",
      email: "john.doe@newcompany.com",
      phone: "1111111111",
      name: "John D.",
    },
  },
  {
    name: "Same email + different everything else",
    incoming: {
      email: "john@company.com",
      phone: "2222222222",
      name: "Jonathan Doe",
      employee_id: "EMP999",
    },
  },
];

const fieldWeights = buildFieldWeights(
  ["email", "phone", "name", "employee_id"],
  DEFAULT_FIELD_WEIGHTS,
);

console.log(`Merge Threshold: ${DEFAULT_MERGE_THRESHOLD}`);
console.log(`Field Weights:`, fieldWeights);
console.log();

scenarios.forEach(({ name, incoming }) => {
  const score = calculateMergeScore(existing, incoming, fieldWeights);
  const willMerge = score >= DEFAULT_MERGE_THRESHOLD;
  console.log(`  "${name}"`);
  console.log(
    `    Score: ${score} | Decision: ${willMerge ? "✓ MERGE" : "✗ NEW ROW"}`,
  );
});

// ============================================================================
// TEST 4: Corporate Dataset Example
// ============================================================================
console.log("\n[TEST 4] Corporate Dataset (Dynamic Fields)\n");

const corporateRecord1 = {
  employee_id: "EMP001",
  work_mail: "john@acme.com",
  contact_no: "9876543210",
  telegram: "@johndoe",
  aadhaar: "1234-5678-9012",
  city: "New York",
};

const corporateRecord2 = {
  employee_id: "EMP001",
  work_mail: "john@acme.com",
  contact_no: "9876543210",
  telegram: "@johndoe_updated",
  aadhaar: "1234-5678-9012",
  city: "NYC",
};

console.log("Record 1:", corporateRecord1);
console.log("Record 2:", corporateRecord2);
console.log();

// Normalize headers like upload would do
const headers = [
  "employee_id",
  "work_mail",
  "contact_no",
  "telegram",
  "aadhaar",
  "city",
];
const normalized1 = {};
const normalized2 = {};

headers.forEach((h) => {
  normalized1[normalizeHeaderWithAliases(h, DEFAULT_FIELD_ALIASES)] =
    corporateRecord1[h];
  normalized2[normalizeHeaderWithAliases(h, DEFAULT_FIELD_ALIASES)] =
    corporateRecord2[h];
});

console.log("Normalized Record 1:", normalized1);
console.log("Normalized Record 2:", normalized2);

const corporateWeights = buildFieldWeights(
  ["employee_id", "email", "phone", "telegram", "aadhaar", "address"],
  DEFAULT_FIELD_WEIGHTS,
);

const corporateScore = calculateMergeScore(
  normalized1,
  normalized2,
  corporateWeights,
);

console.log(`\nCorporate Merge Score: ${corporateScore}`);
console.log(`Threshold: ${DEFAULT_MERGE_THRESHOLD}`);
console.log(
  `Decision: ${corporateScore >= DEFAULT_MERGE_THRESHOLD ? "✓ MERGE (Same Employee)" : "✗ NEW ROW"}`,
);

// ============================================================================
// TEST 5: Settings Initialization
// ============================================================================
console.log("\n[TEST 5] Default Settings for MongoDB\n");
console.log("fieldAliases count:", Object.keys(DEFAULT_FIELD_ALIASES).length);
console.log("Sample aliases (email):", DEFAULT_FIELD_ALIASES.email);
console.log();
console.log("fieldWeights defined:", Object.keys(DEFAULT_FIELD_WEIGHTS).length);
console.log("Sample weights:", {
  email: DEFAULT_FIELD_WEIGHTS.email,
  phone: DEFAULT_FIELD_WEIGHTS.phone,
  employee_id: DEFAULT_FIELD_WEIGHTS.employee_id,
  aadhaar: DEFAULT_FIELD_WEIGHTS.aadhaar,
});
console.log();
console.log("mergeThreshold:", DEFAULT_MERGE_THRESHOLD);

console.log("\n" + "=".repeat(70));
console.log("ALL TESTS COMPLETED ✓");
console.log("=".repeat(70));
