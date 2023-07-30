import { getAuth } from "firebase/auth";
import { firebaseApp, getIdToken } from "@/firebase";

// Initialize Firebase and PubSub here
const auth = getAuth(firebaseApp);

export async function retrieveOutputs({
  author,
  user,
  startDate,
  endDate,
  spoke,
}) {
  const idToken = await getIdToken(); // Get the Firebase ID token

  if (!idToken) {
    throw new Error("User not authenticated");
  }

  const command_author = author ? author : "#frontendAgent#";
  const command_user = user ? user : auth.currentUser.uid;
  const command_startDate = startDate ? startDate : "undefined";
  const command_endDate = endDate ? endDate : "undefined";
  const command_spoke = spoke ? spoke : "all";

  const message = `##retrieve-outputs author=${command_author} user=${command_user} minDate=${command_startDate} maxDate=${command_endDate} spokeId=${command_spoke}`;
  const response = await sendMessage({
    conversationId: "temp",
    message,
    user: command_author,
  });
  const json_response = JSON.stringify(JSON.parse(response), null, 2);

  const blob = new Blob([json_response], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "output.json";
  a.click();

  // Clean up the object URL
  URL.revokeObjectURL(url);
}

export async function cleanConversations({ author, user }) {
  const idToken = await getIdToken(); // Get the Firebase ID token

  if (!idToken) {
    throw new Error("User not authenticated");
  }
  const command_author = author ? author : "#frontendAgent#";
  const command_user = user ? user : auth.currentUser.uid;

  console.log("Cleaning conversations for user", command_user);

  const message = `##clean-conversations author=${command_author} user=${command_user}`;
  await sendMessage({ conversationId: "temp", message, user: command_author });
}

export async function createConversation({
  author,
  spokeUser,
  brain,
  spokeId,
  forUser,
  conversationId,
  owner,
  channel,
  type,
}) {
  const user = author ? author : auth.currentUser.uid;
  const myType = type ? type : "lite";
  const data = {
    channel,
    author: user,
    spokeUser,
    brain,
    spokeId,
    forUser,
    owner: owner,
    type: myType,
  };
  console.log("Creating conversation with data", data);

  const message = `##create-conversation author=${user} spokeUser=${data.spokeUser} brain=${data.brain} spokeId=${data.spokeId} forUser=${data.forUser} owner=${data.owner} conversationId=${conversationId} type=${data.type}`;
  await sendMessage({ conversationId: "temp", message, user });
}

export async function deleteConversation({ author, conversationId }) {
  const user = author ? author : auth.currentUser.uid;
  const message = `##delete-conversation author=${user} conversationId=${conversationId}`;
  await sendMessage({ conversationId: "temp", message, user });
}

export async function fetchFinishedConversation({ author, conversationId }) {
  const user = author ? author : auth.currentUser.uid;
  const message = `##retrieve-conversation author=${user} conversationId=${conversationId}`;
  const response = await sendMessage({ conversationId: "temp", message, user });
  const json_response = JSON.parse(response);
  return json_response;
}

export async function sendMessage({ conversationId, message, user }) {
  console.log("Sending message to conversation", conversationId, ":", message);
  const userId = user ? user : auth.currentUser.uid;
  const idToken = await getIdToken(); // Get the Firebase ID token

  if (!idToken) {
    throw new Error("User not authenticated");
  }

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`, // Add the Authorization header
    },
    body: JSON.stringify({
      author: userId,
      role: "user",
      conversationId,
      message,
    }),
  };

  const response = await fetch(
    "https://conversational-bot-ai32xjq4va-ew.a.run.app",
    requestOptions
  );

  if (!response.ok) {
    throw new Error(`Error sending message: ${response.statusText}`);
  }
  const result = await response.json();
  return result.message;
}
