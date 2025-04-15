import { getToken } from "@/util/credentials";
import { getApproved, getUser, HOST_WITH_PORT_API } from "@/util/environment";
import { ProductInfo } from "@/util/interface";
import { useIsFocused } from "@react-navigation/native";
import { Input } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Index() {
  const isFocused = useIsFocused();

  const [curProdInfo, setCurProdInfo] = useState<ProductInfo>({
    prodName: "",
    prodDesc: "",
    price: null,
    posted_by: null,
    quantity: 0,
  });

  //Refresh the page when the user navigates back to this screen
  useEffect(() => {
    setCurProdInfo({
      prodName: "",
      prodDesc: "",
      price: null,
      posted_by: null,
      quantity: 0,
    });
  }, [isFocused]);

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
        // console.log("Submitted: " + JSON.stringify(new_prod));
        // console.log(response);
        setCurProdInfo({
          prodName: "",
          prodDesc: "",
          price: null,
          posted_by: null,
          quantity: 0,
        });
      })
      .catch((error) => console.error("Add product error:" + error));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        {getUser() !== null && getApproved() ? (
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
            <Input
              placeholder="Listing Quantity"
              onChangeText={(value) => {
                const newNum: number = parseInt(value);
                if (!isNaN(newNum) && value.length < 8) {
                  setCurProdInfo((prev) => ({ ...prev, quantity: newNum }));
                }
              }}
              value={
                curProdInfo.quantity ? curProdInfo.quantity.toString() : ""
              }
            />
            <Button title="Submit" onPress={() => add_prod(curProdInfo)} />
          </View>
        ) : (
          <View
            style={{
              width: "95%",
              marginLeft: "2%",
              marginTop: "5%",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>
              You must be logged in and approved to list items
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
