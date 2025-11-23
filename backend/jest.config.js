/**
 * Jest configuration tailored for the backend API layer.
 */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "services/**/*.js",
    "middleware/**/*.js",
    "models/**/*.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
  modulePathIgnorePatterns: ["<rootDir>/node_modules"],
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
};

