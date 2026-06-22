(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBBKgwaYowTZu_XqqiEoPn5VhKBU8fgLD0",
    authDomain: "haul-mart.firebaseapp.com",
    projectId: "haul-mart",
    storageBucket: "haul-mart.firebasestorage.app",
    messagingSenderId: "694278261304",
    appId: "1:694278261304:web:0dcf6574081804949374cd",
    measurementId: "G-1H37GCPG5G"
  };

  if (!window.firebase) {
    window.dispatchEvent(new CustomEvent("haulmart:firebase-error"));
    return;
  }

  firebase.initializeApp(firebaseConfig);

  try {
    if (firebase.analytics?.isSupported) {
      firebase.analytics.isSupported()
        .then((supported) => {
          if (supported) firebase.analytics();
        })
        .catch(() => {});
    }
  } catch {
    // Analytics is optional and can be blocked locally without affecting the app.
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

  const COLLECTIONS = {
    products: "products",
    mapSections: "mapSections"
  };

  const remote = {
    auth,
    db,
    storage,
    onAuthChanged(callback) {
      return auth.onAuthStateChanged(callback);
    },
    signIn(email, password) {
      return auth.signInWithEmailAndPassword(email, password);
    },
    signOut() {
      return auth.signOut();
    },
    async updatePassword(currentPassword, nextPassword) {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("Admin is not signed in.");
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(nextPassword);
    },
    onProducts(callback, onError) {
      return db.collection(COLLECTIONS.products).onSnapshot((snapshot) => {
        callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
      }, onError);
    },
    saveProduct(product) {
      return db.collection(COLLECTIONS.products).doc(product.id).set({
        ...stripUndefined(product),
        updatedAt: serverTimestamp()
      });
    },
    deleteProduct(productId) {
      return db.collection(COLLECTIONS.products).doc(productId).delete();
    },
    async replaceProducts(products) {
      const snapshot = await db.collection(COLLECTIONS.products).get();
      let batch = db.batch();
      let count = 0;
      const commit = async () => {
        if (!count) return;
        await batch.commit();
        batch = db.batch();
        count = 0;
      };

      for (const entry of snapshot.docs) {
        batch.delete(entry.ref);
        count += 1;
        if (count >= 450) await commit();
      }
      await commit();

      for (const product of products) {
        batch.set(db.collection(COLLECTIONS.products).doc(product.id), {
          ...stripUndefined(product),
          updatedAt: serverTimestamp()
        });
        count += 1;
        if (count >= 450) await commit();
      }
      await commit();
    },
    onMapSections(callback, onError) {
      return db.collection(COLLECTIONS.mapSections).onSnapshot((snapshot) => {
        callback(snapshot.docs.map((entry) => ({ key: entry.id, ...entry.data() })));
      }, onError);
    },
    saveMapSection(section) {
      return db.collection(COLLECTIONS.mapSections).doc(section.key).set({
        ...stripUndefined(section),
        updatedAt: serverTimestamp()
      });
    },
    deleteMapSection(sectionKey) {
      return db.collection(COLLECTIONS.mapSections).doc(sectionKey).delete();
    },
    async uploadProductImage(imageValue, fileName, productId) {
      const blob = await imageValueToBlob(imageValue);
      const cleanProductId = cleanPathPart(productId || "product");
      const cleanFileName = cleanPathPart(fileName || "product-image.png").replace(/\.(avif|gif|jpe?g|png|svg|webp)$/i, "") || "product-image";
      const storageRef = storage.ref(`product-images/${cleanProductId}/${Date.now()}-${cleanFileName}.png`);
      await storageRef.put(blob, { contentType: "image/png" });
      return storageRef.getDownloadURL();
    }
  };

  window.HaulMartFirebase = remote;
  window.dispatchEvent(new CustomEvent("haulmart:firebase-ready", { detail: remote }));

  function stripUndefined(value) {
    if (Array.isArray(value)) return value.map(stripUndefined);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, stripUndefined(entryValue)])
    );
  }

  function cleanPathPart(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96) || "image";
  }

  async function imageValueToBlob(imageValue) {
    const value = String(imageValue || "").trim();
    if (value.startsWith("data:")) {
      const response = await fetch(value);
      return response.blob();
    }
    const response = await fetch(value, { mode: "cors" });
    if (!response.ok) throw new Error("Image could not be loaded for upload.");
    return response.blob();
  }
}());
