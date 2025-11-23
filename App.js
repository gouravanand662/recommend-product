import React, { useState } from "react";
import { SafeAreaView, View, FlatList, TextInput, Button, Text, TouchableOpacity } from "react-native";

const API_URL = "http://10.0.2.2:8000/chat"; // Use localhost mapping for emulator; change to your server URL.

export default function App() {
  const [messages, setMessages] = useState([
    { id: "1", from: "bot", text: "Hi! I'm your product guide. Tap 'Start' to begin." }
  ]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState({});

  const send = async (text) => {
    if (!text) return;
    const userMsg = { id: Date.now().toString(), from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ message: text, session }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), from: "bot", text: data.reply }]);
      }
      if (data.products) {
        data.products.forEach((p, i) => {
          setMessages(prev => [...prev, { id: (Date.now()+10+i).toString(), from: "bot", text: p.title + " — ₹" + p.price + " | " + p.description }]);
        });
      }
      setSession(data.session || {});
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now()+2).toString(), from: "bot", text: "Error contacting server: " + e.message }]);
    }
  };

  return (
    <SafeAreaView style={{flex:1, padding:12}}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={{marginVertical:6, alignSelf: item.from==="user" ? "flex-end":"flex-start", maxWidth:"80%"}}>
            <Text style={{backgroundColor: item.from==="user" ? "#DCF8C6":"#EEE", padding:8, borderRadius:8}}>{item.text}</Text>
          </View>
        )}
      />
      <View style={{flexDirection:"row", alignItems:"center"}}>
        <TextInput value={input} onChangeText={setInput} placeholder="Type..." style={{flex:1, borderWidth:1, borderColor:"#CCC", padding:8, borderRadius:6}}/>
        <TouchableOpacity onPress={() => send(input)} style={{marginLeft:8, padding:10, backgroundColor:"#007AFF", borderRadius:6}}>
          <Text style={{color:"#fff"}}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => send("start")} style={{marginLeft:8, padding:10, backgroundColor:"#34C759", borderRadius:6}}>
          <Text style={{color:"#fff"}}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}