const successMessage = (message: string) => {
  console.error(`✅ ${message}`);
  return true;
};
const errorMessage = (message: string) => {
  console.error(`⛔ ${message}`);
  return false;
};

export { successMessage, errorMessage };
