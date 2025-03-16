import { ProductInfo } from "@/util/interface";
import { Input } from "@rneui/themed";
import { useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [curProdInfo, setCurProdInfo] = useState<ProductInfo>({
    prodName: "",
    prodDesc: "",
    price: null,
    posted_by: null,
  });

  const add_prod = async (new_prod: ProductInfo) => {
    await fetch("http://127.0.0.1:8000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(new_prod),
    })
      .then((response) => {
        console.log("Submitted: " + JSON.stringify(new_prod));
        console.log(response);
      })
      .catch((error) => console.error("Add product error:" + error));
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
          <Text style={{ fontSize: 24 }}>Add Item Listing</Text>

          <Input
            placeholder="Listing Title"
            onChangeText={(value) =>
              setCurProdInfo((prev) => ({ ...prev, prodName: value }))
            }
            value={curProdInfo.prodName}
          />
          <Input
            placeholder="Listing Description"
            onChangeText={(value) =>
              setCurProdInfo((prev) => ({ ...prev, prodDesc: value }))
            }
            value={curProdInfo.prodDesc}
          />
          <Input
            placeholder="Listing Value"
            onChangeText={(value) => {
              const newNum: number = parseInt(value);
              if (!isNaN(newNum) && value.length < 8) {
                setCurProdInfo((prev) => ({ ...prev, price: newNum }));
              }
            }}
            value={curProdInfo.price ? curProdInfo.price.toString() : ""}
          />
          {/* <Input
            placeholder="ZIP Code"
            onChangeText={(value) => {
              const newNum: number = parseInt(value);
              if (!isNaN(newNum) && value.length < 8) {
                setCurProdInfo((prev) => ({ ...prev, zip_code: newNum }));
              }
            }}
            value={
              curProdInfo.posted_by ? curProdInfo.posted_by.toString() : ""
            }
          /> */}
          <Button title="Submit" onPress={() => add_prod(curProdInfo)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
