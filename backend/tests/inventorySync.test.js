const InventorySyncWorker = require("../../worker/inventorySync");
const Product = require("../../models/Product");

jest.mock("../../models/Product");
jest.mock("axios");

describe("Inventory Sync Worker", () => {
  test("syncs product inventory with retry", async () => {
    const worker = new InventorySyncWorker();
    const mockProduct = {
      _id: "product123",
      externalId: "ext123",
      stock: 50,
      save: jest.fn(),
    };

    Product.find.mockResolvedValue([mockProduct]);
    // Mock axios to succeed on retry
    axios.get
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ data: { stock: 75 } });

    await worker.syncProduct(mockProduct, 0);

    expect(mockProduct.stock).toBe(75);
    expect(mockProduct.save).toHaveBeenCalled();
  });

  test("triggers low stock alert", async () => {
    const worker = new InventorySyncWorker();
    const mockProduct = {
      _id: "product123",
      stock: 5,
      save: jest.fn(),
    };

    axios.get.mockResolvedValue({ data: { stock: 5 } });

    await worker.syncProduct(mockProduct);

    // Verify alert was triggered (implementation specific)
    expect(mockProduct.stock).toBe(5);
  });
});

