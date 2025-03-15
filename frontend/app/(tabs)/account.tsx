import { useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Input } from "@rneui/themed";

import { RegistrationInfo, LoginInfo } from "@/util/interface";
import { parse } from "@babel/core";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function Index() {
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

  //Register a new user through the backend
  const register = async (info: RegistrationInfo) => {
    await fetch("http://127.0.0.1:8000/register", {
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
    await fetch("http://127.0.0.1:8000/login", {
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
      .catch((error) => console.error("Login error:" + error));
  };

  const bottomBarHeight = useBottomTabBarHeight();

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
          {menuOpen === 0 && (
            <>
              <Button title="Register" onPress={() => setMenuOpen(1)}></Button>
              <Button title="Log In" onPress={() => setMenuOpen(2)}></Button>
            </>
          )}

          {/* All registration components are in this section */}
          {menuOpen === 1 && (
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
          {menuOpen === 2 && (
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
