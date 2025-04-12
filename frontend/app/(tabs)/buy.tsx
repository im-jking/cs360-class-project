import { getToken } from "@/util/credentials";
import { HOST_WITH_PORT_API } from "@/util/environment";
import { ProductFinal } from "@/util/interface";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Modal, Pressable } from "react-native";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [products, setProducts] = useState<ProductFinal[] | null>(null);
  const [productsRetrieved, setProductsRetrieved] = useState(false);
  const [bartInfo, setBartInfo] = useState<ProductFinal | null>(null);
  const [offerInfo, setOfferInfo] = useState<ProductFinal | null>(null);

  useEffect(() => {
    fetch(`${HOST_WITH_PORT_API}/products`)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setProducts(response);
        setProductsRetrieved(true);
      })
      .catch((error) => console.error(error));
  }, []);

  //Create a transaction on the database with populated info
  const beginBarter = async () => {
    const isLoggedIn = await getToken("user");
    if (!isLoggedIn) {
      console.error("Must log in to barter");
      return;
    }
  };

  const ProductList = () => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <View style={{ flex: 1, alignSelf: "stretch", flexDirection: "row" }}>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Quant.
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Name
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Desc.
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Est. Value (USD)
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Begin Barter
            </Text>
          </View>
        </View>
        <Text>{"\n"}</Text>
        {products?.map((product) => (
          <>
            <View
              style={{ flex: 1, alignSelf: "stretch", flexDirection: "row" }}
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
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Button title="Barter" onPress={() => setBartInfo(product)} />
              </View>
            </View>
            <Text>{"\n"}</Text>
          </>
        ))}
      </View>
    );
  };

  const BarterScreen = () => {
    return (
      <Modal
        animationType="fade"
        transparent
        visible={bartInfo !== null}
        onRequestClose={() => setBartInfo(null)}
      >
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
                textDecorationLine: "underline",
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Product Info
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Title:
              <Text style={{ fontWeight: "normal" }}>
                {" "}
                {bartInfo?.prodName}
              </Text>
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Description:
              <Text style={{ fontWeight: "normal" }}>
                {" "}
                {bartInfo?.prodDesc}
              </Text>
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Value:
              <Text style={{ fontWeight: "normal" }}> {bartInfo?.price}</Text>
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[
                  { borderRadius: 20, padding: 10, elevation: 2 },
                  { backgroundColor: "#c5c5c5" },
                ]}
                onPress={() => setBartInfo(null)}
              >
                <Text style={{ color: "white" }}>Hide Modal</Text>
              </Pressable>
              <Pressable
                style={[
                  { borderRadius: 20, padding: 10, elevation: 2 },
                  { backgroundColor: "#1892ff" },
                ]}
                onPress={() => {
                  setOfferInfo(bartInfo);
                  setBartInfo(null);
                }}
              >
                <Text style={{ color: "white" }}>Start Barter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const OfferScreen = () => {
    return (
      <Modal
        animationType="fade"
        transparent
        visible={offerInfo !== null}
        onRequestClose={() => setOfferInfo(null)}
      >
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
                textDecorationLine: "underline",
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Offer Details
            </Text>

            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Value:
              <Text style={{ fontWeight: "normal" }}> {offerInfo?.price}</Text>
            </Text>

            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[
                  { borderRadius: 20, padding: 10, elevation: 2 },
                  { backgroundColor: "#c5c5c5" },
                ]}
                onPress={() => setOfferInfo(null)}
              >
                <Text style={{ color: "white" }}>Hide Modal</Text>
              </Pressable>
              <Pressable
                style={[
                  { borderRadius: 20, padding: 10, elevation: 2 },
                  { backgroundColor: "#1892ff" },
                ]}
                onPress={() => {
                  setOfferInfo(null);
                }}
              >
                <Text style={{ color: "white" }}>Send Offer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
          {productsRetrieved ? (
            <>
              <ProductList />
              <BarterScreen />
              <OfferScreen />
            </>
          ) : (
            <>
              <ActivityIndicator size="large" />
              <Text>Loading products...</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
