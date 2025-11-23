const { logAnomaly } = require("../../middleware/filterValidation");

/**
 * Unit tests for filter validation middleware
 */
describe("Filter Validation Middleware", () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      ip: "127.0.0.1",
    };
    console.warn = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("detects invalid price range", () => {
    const filters = {
      minPrice: 100,
      maxPrice: 50,
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toContain("Invalid price range");
    expect(console.warn).toHaveBeenCalled();
  });

  test("detects oversized search query", () => {
    const filters = {
      search: "a".repeat(101),
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toContain("Oversized search query");
    expect(console.warn).toHaveBeenCalled();
  });

  test("detects multiple anomalies", () => {
    const filters = {
      minPrice: 100,
      maxPrice: 50,
      search: "a".repeat(101),
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toHaveLength(2);
    expect(anomalies).toContain("Invalid price range");
    expect(anomalies).toContain("Oversized search query");
  });

  test("returns empty array for valid filters", () => {
    const filters = {
      minPrice: 10,
      maxPrice: 100,
      search: "valid search",
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toHaveLength(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  test("handles empty filters", () => {
    const filters = {};

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toHaveLength(0);
  });

  test("handles valid price range", () => {
    const filters = {
      minPrice: 10,
      maxPrice: 100,
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toHaveLength(0);
  });

  test("handles search query at boundary (100 chars)", () => {
    const filters = {
      search: "a".repeat(100),
    };

    const anomalies = logAnomaly(mockReq, filters);

    expect(anomalies).toHaveLength(0);
  });
});

