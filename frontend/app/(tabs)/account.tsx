import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
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
  UserInfo,
} from "@/util/interface";
import { parse } from "@babel/core";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import {
  checkAdmin,
  checkApproved,
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

  //Whether and which user modal is open
  const [userModal, setUserModal] = useState<UserInfo | null>(null);

  //Whether and which transaction modal is open
  const [transModal, setTransModal] = useState<TransactionReadable | null>(
    null
  );

  const [transModalEvil, setTransModalEvil] = useState<TransactionInfo | null>(
    null
  );

  const [users, setUsers] = useState<UserInfo[]>([]);

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
    await checkApproved(user);

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

      await fetch(`${HOST_WITH_PORT_API}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((response) => response.json())
        .then((response) => setUsers(response))
        .catch((error) => console.error(error));
    } else {
      setAllTransactions([]);
      setUsers([]);
    }
  };

  //Get original transaction data
  const getTransactionEvil = async (transID: number) => {
    await fetch(`${HOST_WITH_PORT_API}/og_transaction?trans_id=${transID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      .then((response) => setTransModalEvil(response))
      .catch((error) => console.error(error));
  };

  //Get total value of all transactions
  const getTotalValue = () => {
    let totalValue = 0;
    allTransactions.forEach((transaction) => {
      totalValue += transaction.value_1 + transaction.value_2;
    });
    return totalValue;
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
        // console.log("Submitted: " + JSON.stringify(info));
        // console.log(response);
      })
      .catch((error) => console.error("Registration error:" + error));
  };

  //Login an existing user through the backend
  const login = async (info: LoginInfo) => {
    // console.log("Submitted: " + JSON.stringify(info));
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

  const acceptTrans = async (
    accept: boolean,
    this_trans: TransactionReadable
  ) => {
    if (accept) {
      await fetch(`${HOST_WITH_PORT_API}/accept_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(this_trans),
      })
        // .then((response) => response.json())
        // .then((response) => console.log(response))
        .catch((error) => console.error("Accept transaction error: " + error));

      getClosedTransactions();
    } else {
      await fetch(
        `${HOST_WITH_PORT_API}/delete_transaction?trans_id=${this_trans.idtransactions}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((response) => response.json())
        // .then((response) => console.log(response))
        .catch((error) => console.error("Delete transaction error: " + error));
    }
    getOpenRequests();
  };

  const approveUser = async (username: string) => {
    await fetch(`${HOST_WITH_PORT_API}/approve_user?username=${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      // .then((response) => console.log(response))
      .catch((error) => console.error("Error approving user: " + error));
  };

  const suspendUser = async (username: string) => {
    await fetch(`${HOST_WITH_PORT_API}/suspend_user?username=${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      // .then((response) => console.log(response))
      .catch((error) => console.error("Error suspending user: " + error));
  };

  const deleteUser = async (username: string) => {
    await fetch(`${HOST_WITH_PORT_API}/delete_user?username=${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      // .then((response) => console.log(response))
      .catch((error) => console.error("Error deleting user: " + error));
  };

  const bottomBarHeight = useBottomTabBarHeight();

  const OwnProducts = () => {
    return (
      <>
        <Text style={{ fontSize: 24, marginBottom: 10, marginTop: 10 }}>
          Your Products
        </Text>
        <View
          style={{
            width: "100%",
            flex: 1,
            alignSelf: "stretch",
            flexDirection: "row",
            borderWidth: 1,
          }}
        >
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Quantity
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Name
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Description
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Value
            </Text>
          </View>
        </View>
        {ownProducts?.map((product) => (
          <React.Fragment key={product.idProducts}>
            <View
              style={{
                width: "100%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                borderWidth: 1,
              }}
            >
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>{product.quantity}</Text>
              </View>
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>{product.prodName}</Text>
              </View>
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>{product.prodDesc}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text style={{ textAlign: "center" }}>{product.price}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
        <Text>{"\n"}</Text>
      </>
    );
  };

  const OpenTransactions = () => {
    return openTransactions.length > 0 ? (
      <>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>
          Open Transactions
        </Text>
        <View
          style={{
            width: "100%",
            alignSelf: "stretch",
            flexDirection: "row",
            borderWidth: 1,
          }}
        >
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Request
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Offer
            </Text>
          </View>
        </View>
        {openTransactions?.map((transaction) => (
          <React.Fragment key={transaction.idtransactions}>
            <View
              style={{
                width: "100%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                borderWidth: 1,
              }}
              key={transaction.idtransactions}
            >
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                  {transaction.value_1})
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                  {transaction.value_2})
                </Text>
              </View>
            </View>
            <Text>{"\n"}</Text>
          </React.Fragment>
        ))}
      </>
    ) : null;
  };

  const OpenRequests = () => {
    return openRequests.length > 0 ? (
      <>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Open Requests</Text>
        <View
          style={{
            width: "69%",
            alignSelf: "stretch",
            flexDirection: "row",
            borderWidth: 1,
          }}
        >
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Request
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Offer
            </Text>
          </View>
          {/* <View style={{ flex: 1, alignSelf: "stretch" }}></View> */}
        </View>
        {openRequests?.map((transaction) => (
          <React.Fragment key={transaction.idtransactions}>
            <View
              style={{
                width: "100%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                borderWidth: 1,
              }}
              key={transaction.idtransactions}
            >
              <View
                style={{ flex: 2, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                  {transaction.value_1})
                </Text>
              </View>
              <View
                style={{ flex: 2, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                  {transaction.value_2})
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Pressable onPress={() => acceptTrans(true, transaction)}>
                  <Text style={{ color: "blue", textAlign: "center" }}>
                    Accept
                  </Text>
                </Pressable>
              </View>
              <View>
                <Pressable onPress={() => acceptTrans(false, transaction)}>
                  <Text style={{ color: "red", textAlign: "center" }}>
                    Decline
                  </Text>
                </Pressable>
              </View>
            </View>
            <Text>{"\n"}</Text>
          </React.Fragment>
        ))}
      </>
    ) : null;
  };

  const ClosedTransactions = () => {
    return closedTransactions.length > 0 ? (
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
            borderWidth: 1,
          }}
        >
          <View style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Request
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Offer
            </Text>
          </View>
        </View>
        {closedTransactions?.map((transaction) => (
          <React.Fragment key={transaction.idtransactions}>
            <View
              style={{
                width: "100%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                borderWidth: 1,
              }}
              key={transaction.idtransactions}
            >
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                  {transaction.value_1})
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text style={{ textAlign: "center" }}>
                  {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                  {transaction.value_2})
                </Text>
              </View>
            </View>
          </React.Fragment>
        ))}
        <Text>{"\n"}</Text>
      </>
    ) : null;
  };

  const AdminInfo = () => {
    return (
      <>
        {allTransactions.length > 0 || users.length > 0 ? (
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Admin Dashboard
          </Text>
        ) : null}
        {allTransactions.length > 0 ? (
          <>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              All Transactions
            </Text>
            <View
              style={{
                width: "80%",
                flex: 1,
                alignSelf: "stretch",
                flexDirection: "row",
                borderWidth: 1,
              }}
            >
              <View
                style={{ flex: 1, alignSelf: "stretch", borderRightWidth: 1 }}
              >
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                  Request
                </Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                  Offer
                </Text>
              </View>
            </View>
            {allTransactions?.map((transaction) => (
              <React.Fragment key={transaction.idtransactions}>
                <View
                  style={{
                    width: "100%",
                    flex: 1,
                    alignSelf: "stretch",
                    flexDirection: "row",
                    borderWidth: 1,
                  }}
                  key={transaction.idtransactions}
                >
                  <View
                    style={{
                      flex: 2,
                      alignSelf: "stretch",
                      borderRightWidth: 1,
                    }}
                  >
                    <Text style={{ textAlign: "center" }}>
                      {transaction.quant_1} x {transaction.prod_1} (Val.{" "}
                      {transaction.value_1})
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 2,
                      alignSelf: "stretch",
                      borderRightWidth: 1,
                    }}
                  >
                    <Text style={{ textAlign: "center" }}>
                      {transaction.quant_2} x {transaction.prod_2} (Val.{" "}
                      {transaction.value_2})
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignSelf: "stretch" }}>
                    <Pressable
                      onPress={() => {
                        getTransactionEvil(transaction.idtransactions);
                        setTransModal(transaction);
                      }}
                    >
                      <Text style={{ color: "blue", textAlign: "center" }}>
                        View
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </React.Fragment>
            ))}
            <Text
              style={{ fontWeight: "bold", marginBottom: 10, marginTop: 10 }}
            >
              Total Value Traded = {getTotalValue()}
            </Text>
            <Text>{"\n"}</Text>
          </>
        ) : null}

        {users.length > 0 ? (
          <>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Users</Text>
            {users.map((user) => (
              <React.Fragment key={user.username}>
                <View
                  style={{
                    width: "100%",
                    flex: 1,
                    flexDirection: "row",
                    marginBottom: 5,
                    borderWidth: 1,
                  }}
                >
                  <View style={{ flex: 1, borderRightWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>{user.username}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Pressable onPress={() => setUserModal(user)}>
                      <Text style={{ color: "blue", textAlign: "center" }}>
                        View Account
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </React.Fragment>
            ))}
            <Text>{"\n"}</Text>
          </>
        ) : null}
      </>
    );
  };

  const UserModal = () => {
    return (
      <Modal transparent visible={userModal !== null}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 10 }}>
              {userModal?.username}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>Phone #: </Text>
              {userModal?.phone_num}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>Street Address: </Text>
              {userModal?.street_num}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>City: </Text>{" "}
              {userModal?.city}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>State: </Text>{" "}
              {userModal?.state}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>ZIP Code: </Text>{" "}
              {userModal?.zip_code}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>Email Address: </Text>{" "}
              {userModal?.email}
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable onPress={() => setUserModal(null)}>
                <Text style={{ color: "blue" }}>Close</Text>
              </Pressable>
              {userModal?.is_approved ? (
                <Pressable onPress={() => suspendUser(userModal?.username)}>
                  <Text style={{ color: "orange" }}>Suspend</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => approveUser(userModal?.username as string)}
                >
                  <Text style={{ color: "green" }}>Approve</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => deleteUser(userModal?.username as string)}
              >
                <Text style={{ color: "red" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const TransModal = () => {
    return (
      <Modal transparent visible={transModal !== null}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 10 }}>
              Transaction #{transModal?.idtransactions}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>Items exchanged:</Text>
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  alignSelf: "stretch",
                  flexDirection: "row",
                  marginBottom: 10,
                }}
                key={transModal?.idtransactions}
              >
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transModal?.quant_1} x {transModal?.prod_1} (Val.{" "}
                    {transModal?.value_1})
                  </Text>
                </View>
                <View style={{ flex: 1, alignSelf: "stretch" }}>
                  <Text>
                    {transModal?.quant_2} x {transModal?.prod_2} (Val.{" "}
                    {transModal?.value_2})
                  </Text>
                </View>
              </View>
            </Text>
            {transModalEvil ? (
              <>
                <Text style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Parties: </Text>
                  {transModalEvil.party_1} and {transModalEvil.party_2}
                </Text>
                <Text style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Date Started: </Text>
                  {transModalEvil.date_started}
                </Text>
                <Text style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Date Ended: </Text>
                  {transModalEvil.date_ended}
                </Text>
                <Text style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Hash Key: </Text>
                  {transModalEvil.hash_key}
                </Text>
              </>
            ) : null}
            <Pressable onPress={() => setTransModal(null)}>
              <Text style={{ color: "blue" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  8;

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
          {menuOpen === 0 && getUser() == null ? (
            <>
              <Text>{"\n"}</Text>
              <Button title="Register" onPress={() => setMenuOpen(1)}></Button>
              <Text>{"\n"}</Text>
              <Button title="Log In" onPress={() => setMenuOpen(2)}></Button>
            </>
          ) : null}

          {/* All registration components are in this section */}
          {menuOpen === 1 && getUser() == null ? (
            <>
              <Text style={{ fontSize: 24, margin: "2.5%" }}>Register</Text>

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
          ) : null}

          {/* All login components are in this section */}
          {menuOpen === 2 && getUser() == null ? (
            <>
              <Text style={{ fontSize: 24, margin: "2.5%" }}>Login</Text>

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
          ) : null}

          {/* Logout and all display items */}
          {getUser() != null ? (
            <View>
              <OwnProducts />
              <OpenTransactions />
              <OpenRequests />
              <ClosedTransactions />
              <AdminInfo />
              <UserModal />
              <TransModal />
              <Button title="Logout" onPress={logout} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
