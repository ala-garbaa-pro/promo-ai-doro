// This is a mock file for tests
export const getSession = async () => {
  return {
    user: { id: "test-user-id", email: "test@example.com" },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const signIn = async () => {
  return { success: true };
};

export const signOut = async () => {
  return { success: true };
};
