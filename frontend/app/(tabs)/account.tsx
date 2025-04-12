import { useEffect, useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Input } from "@rneui/themed";

import { RegistrationInfo, LoginInfo, ProductFinal } from "@/util/interface";
import { parse } from "@babel/core";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { getUser, HOST_WITH_PORT_API, setUser } from "@/util/environment";
import { clearTokens, getToken, storeToken } from "@/util/credentials";
import { useIsFocused } from "@react-navigation/native";

export default function Index() {
  const isFocused = useIsFocused();

  //Store entered registration data
  const [curRegInfo, setCurRegInfo] = useState<RegistrationInfo>({
    username: "",
    password: "",
    passwordConf: "",
    phone_num: "",
    street_num: "",
    city: "",
    state: "",
    zip_code: null,
    email: "",
  });

  //Store entered login data
  const [curLogInfo, setCurLogInfo] = useState<LoginInfo>({
    username: "",
    password: "",
  });

  //Which menu is visible on this page?
  const [menuOpen, setMenuOpen] = useState<number>(0);

  //Current user's products
  const [ownProducts, setOwnProducts] = useState<ProductFinal[] | null>(null);

  //Request current user's products and set them
  const getOwnProducts = async () => {
    await fetch(
      `${HOST_WITH_PORT_API}/user_products?username=${curLogInfo.username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => setOwnProducts(response))
      .catch((error) => console.error(error));
  };

  //Register a new user through the backend
  const register = async (info: RegistrationInfo) => {
    await fetch(`${HOST_WITH_PORT_API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(info),
    })
      .then((response) => {
        console.log("Submitted: " + JSON.stringify(info));
        console.log(response);
      })
      .catch((error) => console.error("Registration error:" + error));
  };

  //Login an existing user through the backend
  const login = async (info: LoginInfo) => {
    console.log("Submitted: " + JSON.stringify(info));
    await fetch(`${HOST_WITH_PORT_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(info),
    })
      .then((response) => response.json())
      .then((response) => storeToken(info.username, response.access_token))
      .then(() => {
        storeToken("user", info.username);
        setUser(info.username);
        setCurLogInfo({ username: "", password: "" });
        getOwnProducts();
      })
      .catch((error) => console.error("Login error:" + error));
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
    setCurLogInfo({ username: "", password: "" });
  };

  const bottomBarHeight = useBottomTabBarHeight();

  const OwnProducts = () => {
    return (
      <>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Your Products</Text>
        <View
          style={{
            width: "100%",
            flex: 1,
            alignSelf: "stretch",
            flexDirection: "row",
            marginBottom: 10,
          }}
        >
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold" }}>Quantity</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold" }}>Name</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold" }}>Description</Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold" }}>Value</Text>
          </View>
        </View>
        {ownProducts?.map((product) => (
          <>
            <View
              style={{
                width: "100%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                marginBottom: 10,
              }}
              key={product.idProducts}
            >
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text>{product.quantity}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text>{product.prodName}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text>{product.prodDesc}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text>{product.price}</Text>
              </View>
            </View>
            <Text>{"\n"}</Text>
          </>
        ))}
        ;
      </>
    );
  };

  useEffect(() => {
    // Check if user is logged in
    const user = getUser();
    if (user) {
      setCurLogInfo({ username: user, password: "" });
      setMenuOpen(0);
      getOwnProducts();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View
          style={{
            width: "95%",
            marginLeft: "2%",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Buttons for menu selection */}
          {menuOpen === 0 && getUser() == null && (
            <>
              <Text>{"\n"}</Text>
              <Button title="Register" onPress={() => setMenuOpen(1)}></Button>
              <Text>{"\n"}</Text>
              <Button title="Log In" onPress={() => setMenuOpen(2)}></Button>
            </>
          )}

          {/* All registration components are in this section */}
          {menuOpen === 1 && getUser() == null && (
            <>
              <Text style={{ fontSize: 24 }}>Register</Text>

              <Input
                placeholder="Username"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, username: value }))
                }
                value={curRegInfo.username}
              />
              <Input
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, password: value }))
                }
                value={curRegInfo.password}
              />
              <Input
                placeholder="Confirm Password"
                secureTextEntry={true}
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, passwordConf: value }))
                }
                value={curRegInfo.passwordConf}
              />
              <Input
                placeholder="Phone #"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, phone_num: value }))
                }
                value={curRegInfo.phone_num}
              />
              <Input
                placeholder="Street Address"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, street_num: value }))
                }
                value={curRegInfo.street_num}
              />
              <Input
                placeholder="City"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, city: value }))
                }
                value={curRegInfo.city}
              />
              <Input
                placeholder="State"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, state: value }))
                }
                value={curRegInfo.state}
              />
              <Input
                placeholder="ZIP Code"
                onChangeText={(value) => {
                  const newNum: number = parseInt(value);
                  if (!isNaN(newNum) && value.length < 8) {
                    setCurRegInfo((prev) => ({ ...prev, zip_code: newNum }));
                  }
                }}
                value={
                  curRegInfo.zip_code ? curRegInfo.zip_code.toString() : ""
                }
              />
              <Input
                placeholder="Email Address"
                onChangeText={(value) =>
                  setCurRegInfo((prev) => ({ ...prev, email: value }))
                }
                value={curRegInfo.email}
              />
              <Button title="Submit" onPress={() => register(curRegInfo)} />
              <Text>{"\n"}</Text>
              <Button title="Log In" onPress={() => setMenuOpen(2)}></Button>
            </>
          )}

          {/* All login components are in this section */}
          {menuOpen === 2 && getUser() == null && (
            <>
              <Text style={{ fontSize: 24 }}>Login</Text>

              <Input
                placeholder="Username"
                onChangeText={(value) =>
                  setCurLogInfo((prev) => ({ ...prev, username: value }))
                }
                value={curLogInfo.username}
              />
              <Input
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={(value) =>
                  setCurLogInfo((prev) => ({ ...prev, password: value }))
                }
                value={curLogInfo.password}
              />
              <Button title="Submit" onPress={() => login(curLogInfo)} />
              <Text>{"\n"}</Text>
              <Button title="Register" onPress={() => setMenuOpen(1)}></Button>
            </>
          )}

          {/* Logout and own products components */}
          {getUser() != null && (
            <View>
              <Button title="Logout" onPress={logout} />
              <OwnProducts />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
