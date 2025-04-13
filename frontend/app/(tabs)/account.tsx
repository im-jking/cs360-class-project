import { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Input } from "@rneui/themed";

import {
  RegistrationInfo,
  LoginInfo,
  ProductFinal,
  TransactionInfo,
  TransactionReadable,
} from "@/util/interface";
import { parse } from "@babel/core";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import {
  checkAdmin,
  getUser,
  HOST_WITH_PORT_API,
  setUser,
} from "@/util/environment";
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

  //Current user's open transactions
  const [openTransactions, setOpenTransactions] = useState<
    TransactionReadable[]
  >([]);

  //Current user's open requests
  const [openRequests, setOpenRequests] = useState<TransactionReadable[]>([]);

  //Current user's closed transactions
  const [closedTransactions, setClosedTransactions] = useState<
    TransactionReadable[]
  >([]);

  //All transactions, for admin view
  const [allTransactions, setAllTransactions] = useState<TransactionReadable[]>(
    []
  );

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

  //Request open transactions and set them
  const getOpenTransactions = async () => {
    await fetch(
      `${HOST_WITH_PORT_API}/transactions?username=${curLogInfo.username}&active_status=true&requested=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
      .then((response) => response.json())
      // .then((response) => console.log("Open transactions: ", response))
      .then((response) => setOpenTransactions(response))
      .catch((error) => console.error(error));
  };

  //Request open requests and set them
  const getOpenRequests = async () => {
    await fetch(
      `${HOST_WITH_PORT_API}/transactions?username=${curLogInfo.username}&active_status=true&requested=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
      .then((response) => response.json())
      // .then((response) => console.log("Open requests: ", response))
      .then((response) => setOpenRequests(response))
      .catch((error) => console.error(error));
  };

  //Request closed transactions and set them
  const getClosedTransactions = async () => {
    await fetch(
      `${HOST_WITH_PORT_API}/transactions?username=${curLogInfo.username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
      .then((response) => response.json())
      // .then((response) => console.log("Closed transactions: ", response))
      .then((response) => setClosedTransactions(response))
      .catch((error) => console.error(error));
  };

  //Request admin info and set it
  const getAdminInfo = async (user: string) => {
    const isAdmin = await checkAdmin(user);

    if (isAdmin) {
      await fetch(`${HOST_WITH_PORT_API}/transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((response) => response.json())
        // .then((response) => console.log("All transactions: ", response))
        .then((response) => setAllTransactions(response))
        .catch((error) => console.error(error));
    } else {
      setAllTransactions([]);
    }
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
      .then((response) => {
        storeToken(info.username, response.access_token);
      })
      .then(() => {
        storeToken("user", info.username);
        setUser(info.username);
        setCurLogInfo({ username: "", password: "" });
        getOwnProducts();
        getOpenTransactions();
        getOpenRequests();
        getClosedTransactions();
      })
      .catch((error) => console.error("Login error:" + error));

    getAdminInfo(info.username);
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
    setCurLogInfo({ username: "", password: "" });
  };

  const acceptTrans = async (accept: boolean, this_id: number) => {
    if (accept) {
      await fetch(
        `${HOST_WITH_PORT_API}/accept_transaction?trans_id=${this_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((error) => console.error("Accept transaction error: " + error));
    } else {
      await fetch(
        `${HOST_WITH_PORT_API}/delete_transaction?trans_id=${this_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((error) => console.error("Delete transaction error: " + error));
    }
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

  const OpenTransactions = () => {
    return (
      openTransactions.length > 0 && (
        <>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>
            Open Transactions
          </Text>
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
              <Text style={{ fontWeight: "bold" }}>Request</Text>
            </View>
            <View style={{ flex: 1, alignSelf: "stretch" }}>
              <Text style={{ fontWeight: "bold" }}>Offer</Text>
            </View>
          </View>
          {openTransactions?.map((transaction) => (
            <>
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignSelf: "stretch",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
                key={transaction.idtransactions}
              >
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                    {transaction.value_1})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                    {transaction.value_2})
                  </Text>
                </View>
              </View>
              <Text>{"\n"}</Text>
            </>
          ))}
          ;
        </>
      )
    );
  };

  const OpenRequests = () => {
    return (
      openRequests.length > 0 && (
        <>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>Open Requests</Text>
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
              <Text style={{ fontWeight: "bold" }}>Request</Text>
            </View>
            <View style={{ flex: 1, alignSelf: "stretch" }}>
              <Text style={{ fontWeight: "bold" }}>Offer</Text>
            </View>
            <View style={{ flex: 1, alignSelf: "stretch" }}></View>
          </View>
          {openRequests?.map((transaction) => (
            <>
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignSelf: "stretch",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
                key={transaction.idtransactions}
              >
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                    {transaction.value_1})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                    {transaction.value_2})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Pressable
                    onPress={() =>
                      acceptTrans(true, transaction.idtransactions)
                    }
                  >
                    <Text style={{ color: "blue" }}>Accept</Text>
                  </Pressable>
                </View>
                <View>
                  <Pressable
                    onPress={() =>
                      acceptTrans(false, transaction.idtransactions)
                    }
                  >
                    <Text style={{ color: "red" }}>Decline</Text>
                  </Pressable>
                </View>
              </View>
              <Text>{"\n"}</Text>
            </>
          ))}
          ;
        </>
      )
    );
  };

  const ClosedTransactions = () => {
    return (
      closedTransactions.length > 0 && (
        <>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>
            Closed Transactions
          </Text>
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
              <Text style={{ fontWeight: "bold" }}>Request</Text>
            </View>
            <View style={{ flex: 1, alignSelf: "stretch" }}>
              <Text style={{ fontWeight: "bold" }}>Offer</Text>
            </View>
          </View>
          {closedTransactions?.map((transaction) => (
            <>
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignSelf: "stretch",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
                key={transaction.idtransactions}
              >
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                    {transaction.value_1})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                    {transaction.value_2})
                  </Text>
                </View>
              </View>
              <Text>{"\n"}</Text>
            </>
          ))}
          ;
        </>
      )
    );
  };

  const AdminInfo = () => {
    return (
      allTransactions.length > 0 && (
        <>
          <Text style={{ fontSize: 24, marginBottom: 10 }}>
            Admins Only - All Transactions
          </Text>
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
              <Text style={{ fontWeight: "bold" }}>Request</Text>
            </View>
            <View style={{ flex: 1, alignSelf: "stretch" }}>
              <Text style={{ fontWeight: "bold" }}>Offer</Text>
            </View>
          </View>
          {allTransactions?.map((transaction) => (
            <>
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignSelf: "stretch",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
                key={transaction.idtransactions}
              >
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                    {transaction.value_1})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                    {transaction.value_2})
                  </Text>
                </View>
              </View>
              <Text>{"\n"}</Text>
            </>
          ))}
          ;
        </>
      )
    );
  };

  useEffect(() => {
    // Check if user is logged in
    const user = getUser();
    if (user) {
      setCurLogInfo({ username: user, password: "" });
      setMenuOpen(0);
      getOwnProducts();
      getOpenTransactions();
      getOpenRequests();
      getClosedTransactions();
      getAdminInfo(user);
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

          {/* Logout and all display items */}
          {getUser() != null && (
            <View>
              <Button title="Logout" onPress={logout} />
              <OwnProducts />
              <OpenTransactions />
              <OpenRequests />
              <ClosedTransactions />
              <AdminInfo />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
