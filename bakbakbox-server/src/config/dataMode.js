/**
 * When true, services serve in-memory dummy data instead of MongoDB.
 * Auto-enabled when MONGODB_URI is missing or connection fails.
 * Set USE_MOCK_DATA=true to force mock mode even with a URI.
 */
let mockMode = false;

export const isMockMode = () => mockMode;

export const enableMockMode = (reason = 'unknown') => {
  if (!mockMode) {
    mockMode = true;
    console.warn(`[Mock Data] Enabled — ${reason}`);
  }
};

export const disableMockMode = () => {
  mockMode = false;
};

export const shouldForceMock = () => process.env.USE_MOCK_DATA === 'true';

export const hasMongoUri = () => Boolean(process.env.MONGODB_URI?.trim());
