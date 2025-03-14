import { Tabs } from "expo-router";
import { IconSymbol } from "@/app-example/components/ui/IconSymbol";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="buy"
        options={{
          title: "Buy",
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
        }}
      />
    </Tabs>
  );
}
