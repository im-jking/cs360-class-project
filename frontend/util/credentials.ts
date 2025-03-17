//Store credentials for logged in users with AsyncStorage
import * as SecureStore from "expo-secure-store";

export const storeToken = async (user: string, token: string) => {
  await SecureStore.setItemAsync(user, token).catch(
    (error) => "Token storage error: " + error
  );
};

export const getToken = async (user: string) => {
  const result = await SecureStore.getItemAsync(user);
  if (result) {
    return result;
  } else {
    return null;
  }
};

export const clearTokens = async () => {
  let user = await getToken("user");
  await SecureStore.deleteItemAsync("user");
  if (user) {
    await SecureStore.deleteItemAsync(user);
  }
};
