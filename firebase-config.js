(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBBKgwaYowTZu_XqqiEoPn5VhKBU8fgLD0",
    authDomain: "haul-mart.firebaseapp.com",
    projectId: "haul-mart",
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
  const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

  const COLLECTIONS = {
    products: "products",
    mapSections: "mapSections",
    groceryLists: "groceryLists",
    promotions: "promotions"
  };

  const remote = {
    auth,
    db,
    onAuthChanged(callback) {
      return auth.onAuthStateChanged(callback);
    },
    signInWithEmailAndPassword(email, password) {
      return auth.signInWithEmailAndPassword(email, password);
    },
    signOut() {
      return auth.signOut();
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
    onGroceryList(clientId, callback, onError) {
      return db.collection(COLLECTIONS.groceryLists).doc(clientId).onSnapshot((snapshot) => {
        callback(snapshot.exists ? snapshot.data() : null);
      }, onError);
    },
    saveGroceryList(clientId, items, updatedAtMillis) {
      return db.collection(COLLECTIONS.groceryLists).doc(clientId).set({
        items: stripUndefined(items),
        updatedAtMillis,
        updatedAt: serverTimestamp()
      }, { merge: true });
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
    async replaceMapSections(sections) {
      const snapshot = await db.collection(COLLECTIONS.mapSections).get();
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

      for (const section of sections) {
        const id = section.id || section.key;
        batch.set(db.collection(COLLECTIONS.mapSections).doc(id), {
          ...stripUndefined(section),
          updatedAt: serverTimestamp()
        });
        count += 1;
        if (count >= 450) await commit();
      }
      await commit();
    },
    onPromotions(callback, onError) {
      return db.collection(COLLECTIONS.promotions).onSnapshot((snapshot) => {
        callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
      }, onError);
    },
    savePromotion(promotion) {
      return db.collection(COLLECTIONS.promotions).doc(promotion.id).set({
        ...stripUndefined(promotion),
        updatedAt: serverTimestamp()
      });
    },
    deletePromotion(promotionId) {
      return db.collection(COLLECTIONS.promotions).doc(promotionId).delete();
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

}());
