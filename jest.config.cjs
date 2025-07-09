module.exports = {
  // Use ts-jest preset for TypeScript files
  preset: 'ts-jest',

  // Simulate a browser environment for testing React components
  testEnvironment: 'jest-environment-jsdom',

  // Specify the setup file to run before each test file (e.g., for @testing-library/jest-dom)
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Map module paths for non-JavaScript assets (like CSS and SVGs)
  moduleNameMapper: {
    // Mock CSS/SCSS/Less imports using identity-obj-proxy
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    // Example: map path aliases defined in tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock SVG imports if you have any
    '\\.(svg)$': '<rootDir>/__mocks__/svg.js',
  },

  // Define how Jest should transform files
  transform: {
    // Transform TS/TSX files using ts-jest
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // If you use other assets that need specific transformations (like images or SVGs)
    // '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Specify where Jest should look for test files
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],

  // Pass options directly to ts-jest
  globals: {
    'ts-jest': {
      // Explicitly tell ts-jest which tsconfig to use for compiling tests
      tsconfig: './tsconfig.json', // Or './tsconfig.app.json' if you have one
    },
  },
};