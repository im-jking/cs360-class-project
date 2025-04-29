import { checkAdmin, getApproved, getUser } from "@/util/environment";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const AccountGuide = () => {
    return (
      <Modal
        animationType="none"
        transparent
        visible={menuOpen == 0}
        onRequestClose={() => setMenuOpen(null)}
      >
        <ScrollView style={{ marginTop: 100, marginBottom: 90 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                margin: 5,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 10,
                }}
              >
                Account Management
              </Text>
              <Text style={{ marginBottom: 10 }}>
                All account management is done through the{" "}
                <Text style={{ fontStyle: "italic" }}>Account</Text> tab,
                located at the right side of the navigation bar. The user must
                have an approved account before selling or bartering on the
                platform. Specific actions and guidelines are listed below.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Registration
              </Text>
              <Text style={{ marginBottom: 10 }}>
                If the user does not have an account, they must first register.
                Do this by pressing the{" "}
                <Text style={{ fontStyle: "italic" }}>Register</Text> button,
                filling in all information in the registration form, and
                pressing <Text style={{ fontStyle: "italic" }}>Submit</Text>. If
                the entered data is valid, the user may proceed to{" "}
                <Text style={{ fontStyle: "italic" }}>Login</Text>.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Login/Logout
              </Text>
              <Text style={{ marginBottom: 10 }}>
                If the user has a preexisting account or has just finished
                registration, they may log into the application by pressing the{" "}
                <Text style={{ fontStyle: "italic" }}>Login</Text> button,
                filling the login form with their credentials, and pressing{" "}
                <Text style={{ fontStyle: "italic" }}>Submit</Text>.
              </Text>
              <Text
                style={{
                  textAlign: "left",
                  textDecorationLine: "underline",
                }}
              >
                Approval
              </Text>
              <Text style={{ marginBottom: 10 }}>
                An account must be approved by an admin before it can be used
                for sale or bartering. After making an account, the user may
                have to wait up to a day for approval. If you have created an
                account and have not been approved after more than a day, please
                send an email to{" "}
                <Text style={{ fontStyle: "italic", color: "blue" }}>
                  example@admin.org
                </Text>{" "}
                with the subject line "BarterApp Account Approval".
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={[
                    {
                      marginRight: 10,
                      borderRadius: 10,
                      padding: 10,
                      elevation: 2,
                    },
                    { backgroundColor: "grey" },
                  ]}
                  onPress={() => {
                    setMenuOpen(null);
                  }}
                >
                  <Text style={{ color: "white" }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const ProductsGuide = () => {
    return (
      <Modal
        animationType="none"
        transparent
        visible={menuOpen == 1}
        onRequestClose={() => setMenuOpen(null)}
      >
        <ScrollView style={{ marginTop: 100, marginBottom: 90 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                margin: 5,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 10,
                }}
              >
                Products
              </Text>
              <Text style={{ marginBottom: 10 }}>
                The current user's products are managed in the top section of
                the <Text style={{ fontStyle: "italic" }}>Account</Text> page,
                and new products are posted on the{" "}
                <Text style={{ fontStyle: "italic" }}>Sell</Text> page.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Product View
              </Text>
              <Text style={{ marginBottom: 10 }}>
                The user may view their products in the top section of the{" "}
                <Text style={{ fontStyle: "italic" }}>Account</Text> page. Each
                product may be deleted by pressing the "X" icon to the right of
                the target product. This table shows the product quantity
                (number remaining), name, description, and value (per unit).
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Delete Products (Admin)
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Admins may delete other user's products by pressing the{" "}
                <Text style={{ fontStyle: "italic" }}>Remove</Text> button next
                to the target product on the{" "}
                <Text style={{ fontStyle: "italic" }}>Buy</Text> page.
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={[
                    {
                      marginRight: 10,
                      borderRadius: 10,
                      padding: 10,
                      elevation: 2,
                    },
                    { backgroundColor: "grey" },
                  ]}
                  onPress={() => {
                    setMenuOpen(null);
                  }}
                >
                  <Text style={{ color: "white" }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const SellingGuide = () => {
    return (
      <Modal
        animationType="none"
        transparent
        visible={menuOpen == 2}
        onRequestClose={() => setMenuOpen(null)}
      >
        <ScrollView style={{ marginTop: 100, marginBottom: 90 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                margin: 5,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 10,
                }}
              >
                Selling
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Users may post items that they have to barter publicly to see if
                other users would like to make a barter offer on those items.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Posting Products
              </Text>
              <Text style={{ marginBottom: 10 }}>
                To post a product, the user must fill out all fields in the "Add
                Item Listing" input on the{" "}
                <Text style={{ fontStyle: "italic" }}>Sell</Text> page and then
                press <Text style={{ fontStyle: "italic" }}>Submit</Text>. Once
                the product is submitted, it will show on the current user's{" "}
                <Text style={{ fontStyle: "italic" }}>Account</Text> tab and on
                all other users'{" "}
                <Text style={{ fontStyle: "italic" }}>Buy</Text> page. Please
                see the <Text style={{ fontStyle: "italic" }}>Bartering</Text>{" "}
                guide for information on bartering for other users' posted
                products.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Barter Requests
              </Text>
              <Text style={{ marginBottom: 10 }}>
                When another user makes an offer on one of the current user's
                products, this offer will show under "Open Requests" on the
                current user's{" "}
                <Text style={{ fontStyle: "italic" }}>Account</Text> page. This
                request may then be accepted (immediately transferring involved
                products) or denied (deleting the transaction) by pressing the
                corresponding button next to the target request. Past accepted
                offers will be shown under "Closed Transactions".
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={[
                    {
                      marginRight: 10,
                      borderRadius: 10,
                      padding: 10,
                      elevation: 2,
                    },
                    { backgroundColor: "grey" },
                  ]}
                  onPress={() => {
                    setMenuOpen(null);
                  }}
                >
                  <Text style={{ color: "white" }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const BarteringGuide = () => {
    return (
      <Modal
        animationType="none"
        transparent
        visible={menuOpen == 3}
        onRequestClose={() => setMenuOpen(null)}
      >
        <ScrollView style={{ marginTop: 100, marginBottom: 90 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                margin: 5,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 10,
                }}
              >
                Bartering
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Users may make barter offers on any products posted by another
                user. The offering user may either offer their own products in
                this trade or request another user provides the trade value
                (partner trading). More information is given below.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Make Barter Offer
              </Text>
              <Text style={{ marginBottom: 10 }}>
                To make an offer on another user's product, the current user
                must navigate to the{" "}
                <Text style={{ fontStyle: "italic" }}>Buy</Text> page and press
                the <Text style={{ fontStyle: "italic" }}>Barter</Text> button
                next to the desired product. This will begin a trade
                customization flow where the current user may review the desired
                product, select the desired quantity, choose the product and
                quantity of their own products to trade, request a partner
                provide the trade value, and send the final barter offer. Once
                the offer is sent, the user can see the transaction in the "Open
                Transactions" section on the{" "}
                <Text style={{ fontStyle: "italic" }}>Account</Text> page. If
                the trade partner accepts the transaction, products will be
                automatically traded and the transaction will be moved to the
                "Closed Transactions" section on the same page. If the trade
                partner rejects the transaction, it will be completely deleted
                from the database and no longer visible.
              </Text>
              <Text
                style={{ textAlign: "left", textDecorationLine: "underline" }}
              >
                Partner Trading
              </Text>
              <Text style={{ marginBottom: 10 }}>
                If the current user decides to contact a trade partner, they
                will need to select that partner's product and product quantity
                desired from the{" "}
                <Text style={{ fontStyle: "italic" }}>Request Goods</Text> modal
                during the trade customization flow. Sending a partner trade
                offer will first deliver a request to the targeted partner
                reflecting a 1 unit reduction in desired product quantity. If
                the partner accepts this request, the quantity will be changed
                back to normal and sent to the original trade requestee. If this
                user accepts the transaction, they will receive all offered
                products while the trade initiator receives 1 of the desired
                product and their partner receives the remainder of the desired
                product quantity.
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={[
                    {
                      marginRight: 10,
                      borderRadius: 10,
                      padding: 10,
                      elevation: 2,
                    },
                    { backgroundColor: "grey" },
                  ]}
                  onPress={() => {
                    setMenuOpen(null);
                  }}
                >
                  <Text style={{ color: "white" }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
            fontFamily: "Georgia",
          }}
        >
          BarterApp
        </Text>
        <Text
          style={{
            marginBottom: 10,
            marginLeft: 5,
            marginRight: 5,
            textAlign: "center",
          }}
        >
          Use BarterApp to post your products, make barter offers, or act as a
          "middle man" between traders! Sign up or log in to get started!
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Guides
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable
            style={{
              backgroundColor: "#3936F6",
              marginRight: "10%",
              marginLeft: "auto",
              padding: 10,
            }}
            onPress={() => setMenuOpen(0)}
          >
            <Text style={{ fontSize: 30, color: "white" }}>Account</Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#3936F6",
              marginRight: "auto",
              padding: 10,
            }}
            onPress={() => setMenuOpen(1)}
          >
            <Text style={{ fontSize: 30, color: "white" }}>Products</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", marginTop: "10%" }}>
          <Pressable
            style={{
              backgroundColor: "#3936F6",
              marginRight: "10%",
              marginLeft: "auto",
              padding: 10,
            }}
            onPress={() => setMenuOpen(2)}
          >
            <Text style={{ fontSize: 30, color: "white" }}>Selling</Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#3936F6",
              marginRight: "auto",
              padding: 10,
            }}
            onPress={() => setMenuOpen(3)}
          >
            <Text style={{ fontSize: 30, color: "white" }}>Bartering</Text>
          </Pressable>
        </View>
        <AccountGuide />
        <ProductsGuide />
        <SellingGuide />
        <BarteringGuide />
      </ScrollView>
    </SafeAreaView>
  );
}
