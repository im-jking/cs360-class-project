import { HOST_WITH_PORT_API } from "@/util/environment";
import { ProductFinal } from "@/util/interface";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [products, setProducts] = useState<ProductFinal[] | null>(null);
  const [productsRetrieved, setProductsRetrieved] = useState(false);

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
              Name
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Description
            </Text>
          </View>
          <View style={{ flex: 1, alignSelf: "stretch" }}>
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Price (USD)
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
      </View>
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
            <ProductList />
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
