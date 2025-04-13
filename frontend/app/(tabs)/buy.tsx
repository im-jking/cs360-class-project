import { getToken } from "@/util/credentials";
import { getUser, HOST_WITH_PORT_API } from "@/util/environment";
import { ProductFinal } from "@/util/interface";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [products, setProducts] = useState<ProductFinal[] | null>(null);
  const [ownProducts, setOwnProducts] = useState<ProductFinal[] | null>(null);
  const [productsRetrieved, setProductsRetrieved] = useState(false);
  const [bartInfo, setBartInfo] = useState<ProductFinal | null>(null);
  const [offerInfo, setOfferInfo] = useState<ProductFinal | null>(null);
  const [offerSelected, setOfferSelected] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    prod: ProductFinal;
    quant: number;
  } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<{
    prod: ProductFinal;
    quant: number;
  } | null>(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    fetch(`${HOST_WITH_PORT_API}/products`)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        const my_products = response.filter(
          (product: ProductFinal) => product.posted_by === getUser()
        );
        const other_products = response.filter(
          (product: ProductFinal) => product.posted_by !== getUser()
        );
        setOwnProducts(my_products);
        setProducts(other_products);
        setProductsRetrieved(true);
      })
      .catch((error) => console.error(error));
  }, [isFocused]);

  //Check if user is logged in and start barter flow
  const beginBarter = async (product: ProductFinal) => {
    const isLoggedIn = await getToken("user").then((response) => {
      if (response == null || response === "") {
        console.error("Must log in to barter");
        alert("Must log in to barter");
        return;
      } else {
        setBartInfo(product);
        setSelectedProduct({ prod: product, quant: 1 });
      }
    });
  };

  //Create a transaction on the database with populated info
  const sendBarter = async () => {
    if (selectedProduct && selectedOffer) {
      //EDIT BELOW IF ROUTED THROUGH MIDDLE MEN
      const barterInfo = {
        item_exchanged_1: selectedProduct.prod.idProducts,
        item_exchanged_2: selectedOffer.prod.idProducts,
        party_1: selectedProduct.prod.posted_by,
        party_2: getUser(),
        // via_1: null,
        // via_2: null,
        quantity_1: selectedProduct.quant,
        quantity_2: selectedOffer.quant,
        value_1: selectedProduct.prod.price * selectedProduct.quant,
        value_2: selectedOffer.prod.price * selectedOffer.quant,
        is_active: true,
      };

      console.log(barterInfo);

      try {
        const response = await fetch(`${HOST_WITH_PORT_API}/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken("user")}`,
          },
          body: JSON.stringify(barterInfo),
        });
        if (response.ok) {
          alert("Barter sent successfully!");
          setBartInfo(null);
          setSelectedProduct(null);
          setSelectedOffer(null);
          setOfferInfo(null);
          setOfferSelected(false);
        } else {
          alert("Error sending barter offer");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please select a product and an offer to barter.");
    }
  };

  const handleProdQuant = (value: string) => {
    const quant = parseInt(value, 10);
    if (
      !isNaN(quant) &&
      selectedProduct &&
      quant >= 0 &&
      quant <= selectedProduct.prod.quantity
    ) {
      setSelectedProduct({ ...selectedProduct, quant });
    } else if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, quant: 1 });
    }
  };

  const handleOfferQuant = (value: string) => {
    const quant = parseInt(value, 10);
    if (
      !isNaN(quant) &&
      selectedOffer &&
      quant >= 0 &&
      quant <= selectedOffer.prod.quantity
    ) {
      setSelectedOffer({ ...selectedOffer, quant });
    } else if (selectedOffer) {
      setSelectedOffer({ ...selectedOffer, quant: 1 });
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
                <Text style={{ textAlign: "center" }}>{product.price}</Text>
              </View>
              <View style={{ flex: 1, alignSelf: "stretch" }}>
                <Button
                  title="Barter"
                  onPress={() => {
                    beginBarter(product);
                  }}
                />
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
                  {
                    marginRight: 10,
                    borderRadius: 10,
                    padding: 10,
                    elevation: 2,
                  },
                  { backgroundColor: "red" },
                ]}
                onPress={() => {
                  setBartInfo(null);
                  setSelectedOffer(null);
                }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  { borderRadius: 10, padding: 10, elevation: 2 },
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

            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Quantity:{"    "}
              <TextInput
                keyboardType="numeric"
                // value={selectedProduct?.quant.toString()}
                defaultValue={
                  selectedProduct ? selectedProduct?.quant.toString() : "0"
                }
                onEndEditing={(e) => handleProdQuant(e.nativeEvent.text)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 5,
                  marginLeft: 5,
                  width: 50,
                }}
              />
              / {offerInfo?.quantity}
            </Text>

            {selectedProduct && (
              <>
                <Text
                  style={{
                    fontWeight: "bold",
                    marginBottom: 10,
                  }}
                >
                  Your Request:
                </Text>
                <View style={{ marginBottom: 10 }}>
                  <Text>
                    {selectedProduct?.quant.toString()} x{" "}
                    {selectedProduct?.prod.prodName} (Total Value{" "}
                    {selectedProduct?.prod.price * selectedProduct?.quant})
                  </Text>
                </View>
              </>
            )}

            <Text style={{ fontWeight: "bold" }}>Your Offer:</Text>

            {selectedOffer ? (
              <View style={{ marginBottom: 10 }}>
                <Text>
                  {selectedOffer.quant.toString()} x{" "}
                  {selectedOffer.prod.prodName} (Total Value{" "}
                  {selectedOffer.prod.price * selectedOffer.quant})
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <Pressable
                  style={[
                    {
                      marginRight: 10,
                      borderRadius: 10,
                      padding: 10,
                      elevation: 2,
                    },
                    { backgroundColor: "#c5c5c5" },
                  ]}
                  onPress={() => {
                    setOfferInfo(null);
                    setOfferSelected(true);
                  }}
                >
                  <Text style={{ color: "white" }}>Choose Goods</Text>
                </Pressable>
                {/*  TO CHANGE: OPEN MENU OF OTHERS' RESOURCES */}
                <Pressable
                  style={[
                    { padding: 10, borderRadius: 10, elevation: 2 },
                    { backgroundColor: "#c5c5c5" },
                  ]}
                  onPress={() => setOfferInfo(null)}
                >
                  <Text style={{ color: "white" }}>Request Goods</Text>
                </Pressable>
              </View>
            )}

            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[
                  {
                    marginRight: 10,
                    borderRadius: 10,
                    padding: 10,
                    elevation: 2,
                  },
                  { backgroundColor: "red" },
                ]}
                onPress={() => {
                  setOfferInfo(null);
                  setSelectedOffer(null);
                }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  { borderRadius: 10, padding: 10, elevation: 2 },
                  { backgroundColor: "#1892ff" },
                ]}
                onPress={sendBarter}
              >
                <Text style={{ color: "white" }}>Send Offer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Where the user selects what to offer
  const OfferSelectionScreen = () => {
    return (
      <Modal animationType="fade" transparent visible={offerSelected}>
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
                marginBottom: 20,
              }}
            >
              What do you offer?
            </Text>

            <>
              <View
                style={{
                  alignSelf: "stretch",
                  flexDirection: "row",
                }}
              >
                <View style={{ marginRight: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Quant.</Text>
                </View>
                <View style={{ marginRight: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Title</Text>
                </View>
                <View style={{ marginRight: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Value</Text>
                </View>
                <View>
                  <Pressable
                    style={[
                      {
                        borderRadius: 10,
                        padding: 5,
                        elevation: 2,
                        visibility: "hidden",
                      },
                    ]}
                  >
                    <Text style={{ color: "white" }}>Select</Text>
                  </Pressable>
                </View>
              </View>
            </>

            <View>
              {ownProducts?.map((product) => (
                <>
                  <View
                    style={{
                      // width: "100%",
                      // flex: 1,
                      alignSelf: "stretch",
                      flexDirection: "row",
                      marginBottom: 10,
                    }}
                    key={product.idProducts}
                  >
                    <View style={{ marginRight: 10 }}>
                      <Text>{product.quantity}</Text>
                    </View>
                    <View style={{ marginRight: 10 }}>
                      <Text>{product.prodName}</Text>
                    </View>
                    <View style={{ marginRight: 10 }}>
                      <Text>{product.price}</Text>
                    </View>
                    <View>
                      <Pressable
                        style={[
                          {
                            borderRadius: 10,
                            padding: 5,
                            elevation: 2,
                          },
                          selectedOffer?.prod.idProducts == product.idProducts
                            ? { backgroundColor: "#1892ff" }
                            : { backgroundColor: "#c5c5c5" },
                        ]}
                        onPress={() => {
                          setSelectedOffer({ prod: product, quant: 1 });
                        }}
                      >
                        <Text style={{ color: "white" }}>Select</Text>
                      </Pressable>
                    </View>
                  </View>
                  <Text>{"\n"}</Text>
                </>
              ))}
            </View>

            {selectedOffer && (
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Quantity:{"    "}
                <TextInput
                  keyboardType="numeric"
                  defaultValue={
                    selectedOffer ? selectedOffer?.quant.toString() : "0"
                  }
                  onEndEditing={(e) => handleOfferQuant(e.nativeEvent.text)}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 5,
                    marginLeft: 5,
                    width: 50,
                  }}
                />
                / {selectedOffer.prod.quantity}
                {"\n"}
              </Text>
            )}

            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[
                  {
                    marginRight: 10,
                    borderRadius: 10,
                    padding: 10,
                    elevation: 2,
                  },
                  { backgroundColor: "red" },
                ]}
                onPress={() => {
                  setOfferSelected(false);
                  setSelectedOffer(null);
                }}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  { borderRadius: 10, padding: 10, elevation: 2 },
                  { backgroundColor: "#1892ff" },
                ]}
                onPress={() => {
                  setOfferSelected(false);
                  setOfferInfo(selectedProduct?.prod as ProductFinal);
                }}
                disabled={selectedOffer === null}
              >
                <Text style={{ color: "white" }}>Confirm</Text>
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
              <OfferSelectionScreen />
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
