import { getAuth } from "firebase/auth";
import {
  doc,
  getDocs,
  collection,
  setDoc,
  getFirestore,
  deleteDoc
} from "firebase/firestore";
import { firebaseApp } from "../../firebase";
import { sendMessage } from "./conversation";

const auth = getAuth();
const db = getFirestore(firebaseApp);

export async function saveSpodkest({ author, name, inputFiles, instructions }) {
  const userId = auth.currentUser.uid;
  const message = `##create-spodkest author=${author} user=${userId} requirements=${instructions} inputFiles=${inputFiles} name=${name}`;
  await sendMessage({ conversationId: "temp", message, user: userId });
}

export async function deleteSpodkest({ userId, id}) {
  const configPath = `users/${userId}/Spodkests/`;
  const docRef = doc(collection(db, configPath), `${id}`);
  await deleteDoc(docRef);
  const message = `##drop-spodkest author=${userId} spodkestId=${id}`;
  await sendMessage({ conversationId: "temp", message, user: userId });
}

export async function retrieveSpodkest({ author, Spodkest }) {
  let SpodkestId = Spodkest;
  const userId = auth.currentUser.uid;
  if (author && SpodkestId) {
    const message = `##query-spodkest user=${userId} author=${author} spodkestId=${SpodkestId}`;
    await sendMessage({ conversationId: "temp", message, user: userId });
  } else {
    console.log("Missing parameters. Creating Spodkest in cache");
    const configPath = `users/${userId}/Spodkests/`;
    //Generate hashed unique SpodkestId
    const SpodkestId = Math.random().toString(36).substring(2, 15);
    const docRef = doc(collection(db, configPath), `${SpodkestId}`);
    const newSpodkest = {
      user: userId,
      author: "",
      description: "",
      name: "",
      documents: [],
      SpodkestId: SpodkestId,
      originUrl: ""
    };
    await setDoc(docRef, newSpodkest);
    return SpodkestId;
  }
  return SpodkestId;
}

export async function fetchSpodkests() {
  try {
    const userId = auth.currentUser.uid;
    const userSpodkestsCol = collection(db, "users", userId, "spodkests");
    const userSpodkestsSnapshot = await getDocs(userSpodkestsCol);
    const userSpodkests = userSpodkestsSnapshot.docs.map((doc) => ({
      origin: "user",
      id: doc.id,
      data: doc.data(),
    }));
    const Spodkests = [...userSpodkests];
    return Spodkests;
  } catch (error) {
    console.error("Error fetching Spodkests:", error);
    return [];
  }
}
