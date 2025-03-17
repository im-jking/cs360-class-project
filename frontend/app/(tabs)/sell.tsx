import { getToken } from "@/util/credentials";
import { HOST_WITH_PORT_API } from "@/util/environment";
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
    //Prevent unauthenticated users from adding items
    const isLoggedIn = await getToken("user");
    if (!isLoggedIn) {
      alert("Must log in to post products.");
      return;
    }

    new_prod["posted_by"] = isLoggedIn;

    await fetch(`${HOST_WITH_PORT_API}/products`, {
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
        setCurProdInfo({
          prodName: "",
          prodDesc: "",
          price: null,
          posted_by: null,
        });
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
          <Button title="Submit" onPress={() => add_prod(curProdInfo)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
