import { Text, View } from "react-native";
import { Input } from "@rneui/themed";

export default function Index() {
  const register = async (
    username: string,
    password: string,
    phoneNum: number,
    streetNum: string,
    city: string,
    state: string,
    zip: number,
    email: string
  ) => {
    const loginInfo = await fetch("localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `${username}`,
        password: `${password}`,
        phone_num: `${phoneNum}`,
        street_num: `${streetNum}`,
        city: `${city}`,
        state: `${state}`,
        zip_code: `${zip}`,
        email: `${email}`,
      }),
    })
      .then((response) => console.log(response))
      .catch((error) => console.error("Registration error:" + error));
  };

  const login = (username: string, password: string) => {};

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Input></Input>
    </View>
  );
}
