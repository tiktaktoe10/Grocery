const CURRENCY = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0
});

const ADMIN_CONFIG = {
  maxFailedAttempts: 3,
  lockoutMs: 30000
};

const STORAGE_KEYS = {
  clientId: "haulmart.client.id.v1",
  products: "haulmart.products.v1",
  deletedProducts: "haulmart.products.deleted.v1",
  list: "haulmart.list.v1",
  listUpdatedAt: "haulmart.list.updatedAt.v1",
  budget: "haulmart.budget.v1",
  mapSections: "haulmart.map.sections.v1",
  promotions: "haulmart.promotions.v1",
  wallRenameMigration: "haulmart.wall.rename.456.v1"
};

const PRODUCT_IMAGE_BASE_PATH = "assets/products/";
const IMAGE_FILE_EXTENSION = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const DATA_IMAGE_PATTERN = /^data:image\/(?:avif|gif|jpe?g|png|svg\+xml|webp);base64,/i;
const ADMIN_IMAGE_MAX_WIDTH = 500;
const ADMIN_IMAGE_QUALITY = 0.6;
const ADMIN_IMAGE_MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const ADMIN_IMAGE_MAX_FIRESTORE_BYTES = 700 * 1024;
const MAP_EDITOR_GRID_SIZE = 1;
const MAP_EDITOR_SAVE_DELAY = 650;
const MAP_SECTION_TYPES = ["aisle", "freezer", "meat", "produce", "dairy", "checkout", "entrance", "wall", "restroom", "custom"];
const MAP_SECTION_COLORS = {
  aisle: "",
  freezer: "",
  meat: "",
  produce: "#dff4e8",
  dairy: "#eef7ff",
  checkout: "#f6f8fa",
  entrance: "#fff7d6",
  wall: "",
  restroom: "#f4f7fa",
  custom: "#ffffff"
};
let knownProductImagePaths = null;

const LOCATION_ZONES = [
  { key: "meat-1", label: "Meat 1", order: 1, left: 21.83, top: 7.83, width: 10.44, height: 4.34 },
  { key: "meat-2", label: "Meat 2", order: 2, left: 32.27, top: 7.83, width: 10.44, height: 4.34 },
  { key: "meat-3", label: "Meat 3", order: 3, left: 42.71, top: 7.83, width: 10.44, height: 4.34 },
  { key: "meat-4", label: "Meat 4", order: 4, left: 53.14, top: 7.83, width: 10.44, height: 4.34 },
  { key: "meat-5", label: "Meat 5", order: 5, left: 63.58, top: 7.83, width: 10.44, height: 4.34 },
  { key: "frozen-1", label: "Frozen 1", order: 11, left: 17.45, top: 25.10, width: 10.45, height: 4.34 },
  { key: "frozen-2", label: "Frozen 2", order: 12, left: 33.38, top: 25.27, width: 10.45, height: 4.32 },
  { key: "frozen-3", label: "Frozen 3", order: 13, left: 49.31, top: 25.27, width: 10.45, height: 4.32 },
  { key: "frozen-4", label: "Frozen 4", order: 14, left: 65.23, top: 25.27, width: 10.45, height: 4.32 },
  { key: "aisle-6", label: "Aisle 6", order: 26, left: 22.74, top: 38.64, width: 3.91, height: 12.46 },
  { key: "aisle-7", label: "Aisle 7", order: 27, left: 33.13, top: 38.64, width: 3.92, height: 12.46 },
  { key: "aisle-8", label: "Aisle 8", order: 28, left: 43.53, top: 38.64, width: 3.92, height: 12.46 },
  { key: "aisle-9", label: "Aisle 9", order: 29, left: 53.94, top: 38.64, width: 3.92, height: 12.46 },
  { key: "aisle-10", label: "Aisle 10", order: 30, left: 64.34, top: 38.64, width: 3.92, height: 12.46 },
  { key: "aisle-1", label: "Aisle 1", order: 21, left: 22.74, top: 56.04, width: 3.91, height: 12.46 },
  { key: "aisle-2", label: "Aisle 2", order: 22, left: 33.15, top: 56.04, width: 3.91, height: 12.46 },
  { key: "aisle-3", label: "Aisle 3", order: 23, left: 43.55, top: 56.04, width: 3.91, height: 12.46 },
  { key: "aisle-4", label: "Aisle 4", order: 24, left: 53.95, top: 56.04, width: 3.91, height: 12.46 },
  { key: "aisle-5", label: "Aisle 5", order: 25, left: 64.35, top: 56.04, width: 3.91, height: 12.46 },
  { key: "wall-6", label: "Wall 6", order: 41, left: 7.49, top: 9.51, width: 3.78, height: 15.30 },
  { key: "wall-5", label: "Wall 5", order: 42, left: 7.49, top: 24.94, width: 3.78, height: 15.30 },
  { key: "wall-4", label: "Wall 4", order: 43, left: 7.49, top: 40.37, width: 3.78, height: 15.30 },
  { key: "wall-3", label: "Wall 3", order: 44, left: 80.12, top: 9.68, width: 3.79, height: 15.28 },
  { key: "wall-2", label: "Wall 2", order: 45, left: 80.12, top: 25.12, width: 3.79, height: 15.28 },
  { key: "wall-1", label: "Wall 1", order: 46, left: 80.12, top: 40.53, width: 3.79, height: 15.30 }
];

const LEGACY_WALL_LOCATION_RENAMES = {
  "wall-6": "wall-4",
  "wall-7": "wall-5",
  "wall-8": "wall-6"
};

const EXTRA_PRODUCTS = [
  { id: "fresh-chicken-breast", name: "Fresh Chicken Breast", price: 180, category: "Meat - Chicken", locationKey: "meat-1", inStock: true },
  { id: "chicken-thigh", name: "Chicken Thigh", price: 165, category: "Meat - Chicken", locationKey: "meat-1", inStock: true },
  { id: "chicken-wings", name: "Chicken Wings", price: 170, category: "Meat - Chicken", locationKey: "meat-1", inStock: true },
  { id: "whole-chicken", name: "Whole Chicken", price: 220, category: "Meat - Chicken", locationKey: "meat-1", inStock: true },
  { id: "pork-belly", name: "Pork Belly", price: 260, category: "Meat - Pork", locationKey: "meat-2", inStock: true },
  { id: "pork-chop", name: "Pork Chop", price: 230, category: "Meat - Pork", locationKey: "meat-2", inStock: true },
  { id: "ground-pork", name: "Ground Pork", price: 190, category: "Meat - Pork", locationKey: "meat-2", inStock: true },
  { id: "pork-tenderloin", name: "Pork Tenderloin", price: 280, category: "Meat - Pork", locationKey: "meat-2", inStock: true },
  { id: "beef-sukiyaki", name: "Beef Sukiyaki", price: 380, category: "Meat - Beef", locationKey: "meat-3", inStock: true },
  { id: "ground-beef", name: "Ground Beef", price: 310, category: "Meat - Beef", locationKey: "meat-3", inStock: true },
  { id: "beef-cubes", name: "Beef Cubes", price: 340, category: "Meat - Beef", locationKey: "meat-3", inStock: true },
  { id: "beef-short-ribs", name: "Beef Short Ribs", price: 420, category: "Meat - Beef", locationKey: "meat-3", inStock: true },
  { id: "bacon", name: "Bacon", price: 180, category: "Meat - Processed", locationKey: "meat-4", inStock: true },
  { id: "ham-slices", name: "Ham Slices", price: 150, category: "Meat - Processed", locationKey: "meat-4", inStock: true },
  { id: "hotdog", name: "Hotdog", price: 135, category: "Meat - Processed", locationKey: "meat-4", inStock: true },
  { id: "hungarian-sausage", name: "Hungarian Sausage", price: 220, category: "Meat - Processed", locationKey: "meat-4", inStock: true },
  { id: "pork-bbq-skewers", name: "Pork BBQ Skewers", price: 180, category: "Meat - Marinated", locationKey: "meat-5", inStock: true },
  { id: "chicken-inasal-cut", name: "Chicken Inasal Cut", price: 210, category: "Meat - Marinated", locationKey: "meat-5", inStock: true },
  { id: "beef-tapa", name: "Beef Tapa", price: 240, category: "Meat - Marinated", locationKey: "meat-5", inStock: true },
  { id: "pork-tocino", name: "Pork Tocino", price: 180, category: "Meat - Marinated", locationKey: "meat-5", inStock: true },
  { id: "ice-cream-tub", name: "Ice Cream Tub", price: 250, category: "Frozen Desserts", locationKey: "frozen-1", inStock: true },
  { id: "frozen-mango-bars", name: "Frozen Mango Bars", price: 180, category: "Frozen Desserts", locationKey: "frozen-1", inStock: true },
  { id: "frozen-dumplings", name: "Frozen Dumplings", price: 220, category: "Frozen Meals", locationKey: "frozen-2", inStock: true },
  { id: "frozen-siomai", name: "Frozen Siomai", price: 160, category: "Frozen Meals", locationKey: "frozen-2", inStock: true },
  { id: "frozen-fries", name: "Frozen Fries", price: 145, category: "Frozen Sides", locationKey: "frozen-3", inStock: true },
  { id: "frozen-vegetables", name: "Frozen Vegetables", price: 130, category: "Frozen Sides", locationKey: "frozen-3", inStock: true },
  { id: "fish-fillet", name: "Fish Fillet", price: 210, category: "Frozen Seafood", locationKey: "frozen-4", image: "assets/products/fish-fillet.png", inStock: true },
  { id: "shrimp-pack", name: "Shrimp Pack", price: 320, category: "Frozen Seafood", locationKey: "frozen-4", image: "assets/products/shrimp-pack.png", inStock: true },
  { id: "garlic-bulb", name: "Garlic Bulb", price: 25, category: "Wall Produce", locationKey: "wall-1", inStock: true },
  { id: "red-onion", name: "Red Onion", price: 35, category: "Wall Produce", locationKey: "wall-1", inStock: true },
  { id: "tomato", name: "Tomato", price: 45, category: "Wall Produce", locationKey: "wall-1", inStock: true },
  { id: "potato", name: "Potato", price: 70, category: "Wall Produce", locationKey: "wall-1", inStock: true },
  { id: "fresh-milk", name: "Fresh Milk", price: 95, category: "Dairy & Eggs", locationKey: "wall-2", inStock: true },
  { id: "cheese-slices", name: "Cheese Slices", price: 120, category: "Dairy & Eggs", locationKey: "wall-2", inStock: true },
  { id: "butter", name: "Butter", price: 130, category: "Dairy & Eggs", locationKey: "wall-2", inStock: true },
  { id: "eggs-12pcs", name: "Eggs 12pcs", price: 115, category: "Dairy & Eggs", locationKey: "wall-2", inStock: true },
  { id: "ensaymada", name: "Ensaymada", price: 35, category: "Wall Bakery", locationKey: "wall-3", inStock: true },
  { id: "spanish-bread", name: "Spanish Bread", price: 40, category: "Wall Bakery", locationKey: "wall-3", inStock: true },
  { id: "loaf-cake", name: "Loaf Cake", price: 120, category: "Wall Bakery", locationKey: "wall-3", inStock: true },
  { id: "donuts", name: "Donuts", price: 55, category: "Wall Bakery", locationKey: "wall-3", inStock: true },
  { id: "lettuce", name: "Lettuce", price: 85, category: "Fresh Produce", locationKey: "wall-4", inStock: true },
  { id: "cucumber", name: "Cucumber", price: 45, category: "Fresh Produce", locationKey: "wall-4", inStock: true },
  { id: "carrots", name: "Carrots", price: 65, category: "Fresh Produce", locationKey: "wall-4", inStock: true },
  { id: "cabbage", name: "Cabbage", price: 80, category: "Fresh Produce", locationKey: "wall-4", inStock: true },
  { id: "tofu", name: "Tofu", price: 45, category: "Refrigerated Asian Items", locationKey: "wall-5", inStock: true },
  { id: "kimchi", name: "Kimchi", price: 180, category: "Refrigerated Asian Items", locationKey: "wall-5", inStock: true },
  { id: "miso-paste", name: "Miso Paste", price: 140, category: "Refrigerated Asian Items", locationKey: "wall-5", inStock: true },
  { id: "fish-cake", name: "Fish Cake", price: 110, category: "Refrigerated Asian Items", locationKey: "wall-5", inStock: true },
  { id: "banana", name: "Banana", price: 85, category: "Wall Fruits", locationKey: "wall-6", inStock: true },
  { id: "apple", name: "Apple", price: 35, category: "Wall Fruits", locationKey: "wall-6", inStock: true },
  { id: "mango", name: "Mango", price: 120, category: "Wall Fruits", locationKey: "wall-6", inStock: true },
  { id: "orange", name: "Orange", price: 45, category: "Wall Fruits", locationKey: "wall-6", inStock: true }
];

const LOCATION_BY_KEY = new Map(LOCATION_ZONES.map((location) => [location.key, location]));

const LOCATION_PRODUCT_GROUPS = {
  "aisle-1": ["Rice", "Cooking Oil", "Soy & Vinegar", "Sauces", "Seasonings"],
  "aisle-2": ["Instant Noodles", "Canned Fish", "Canned Meat", "Canned Vegetables", "Pantry Milk"],
  "aisle-3": ["Coffee", "Powdered Milk", "Chocolate Drinks", "Spreads", "Breakfast Syrups"],
  "aisle-4": ["Cereal", "Oats", "Bread", "Flour", "Baking Ingredients"],
  "aisle-5": ["Cookies", "Crackers", "Chips", "Nuts", "Chocolate", "Candy"],
  "aisle-6": ["Soft Drinks", "Juice", "Tea", "Dairy Drinks", "Water"],
  "aisle-7": ["Energy Drinks", "Sports Drinks", "Imported Drinks", "Ready-to-Drink Coffee", "Tea"],
  "aisle-8": ["Hair Care", "Bath & Soap", "Deodorant", "Oral Care", "Shaving", "Skin & Feminine Care"],
  "aisle-9": ["Laundry", "Dishwashing", "Bleach & Cleaners", "Air Care", "Cleaning Tools", "Trash Bags"],
  "aisle-10": ["Baby Care", "Pharmacy", "Vitamins", "Personal Care", "Feminine Care", "First Aid"],
  "meat-1": ["Chicken Breast", "Chicken Thigh", "Wings", "Whole Chicken"],
  "meat-2": ["Pork Belly", "Pork Chop", "Ground Pork", "Tenderloin"],
  "meat-3": ["Beef Cuts", "Ground Beef", "Short Ribs"],
  "meat-4": ["Bacon", "Ham", "Hotdog", "Sausage"],
  "meat-5": ["BBQ Skewers", "Marinated Chicken", "Tapa", "Tocino"],
  "frozen-1": ["Ice Cream", "Frozen Desserts"],
  "frozen-2": ["Dumplings", "Siomai", "Frozen Meals"],
  "frozen-3": ["Fries", "Frozen Vegetables", "Frozen Sides"],
  "frozen-4": ["Fish Fillet", "Shrimp", "Frozen Seafood"],
  "wall-1": ["Garlic & Onion", "Tomatoes", "Potatoes", "Produce Staples"],
  "wall-2": ["Milk", "Cheese", "Butter", "Eggs"],
  "wall-3": ["Bread", "Pastries", "Cakes", "Donuts"],
  "wall-4": ["Leafy Greens", "Vegetables", "Salad Produce"],
  "wall-5": ["Tofu", "Kimchi", "Miso", "Refrigerated Asian Items"],
  "wall-6": ["Bananas", "Apples", "Mangoes", "Citrus"]
};

const MAP_LANDMARKS = [
  { label: "C1", type: "cashier", left: 28.8, top: 75.7, width: 7.0, height: 5.9 },
  { label: "C2", type: "cashier", left: 39.7, top: 75.7, width: 7.0, height: 5.9 },
  { label: "C3", type: "cashier", left: 50.6, top: 75.7, width: 7.0, height: 5.9 },
  { label: "C4", type: "cashier", left: 61.4, top: 75.7, width: 7.0, height: 5.9 },
  { label: "C5", type: "cashier", left: 72.3, top: 75.7, width: 7.0, height: 5.9 },
  { label: "Entrance", type: "entrance-word", left: 8.4, top: 76.1, width: 15.2, height: 5.6 },
  { label: "Entrance", type: "entry", left: 31.0, top: 89.9, width: 16.5, height: 3.8 },
  { label: "Exit", type: "exit", left: 55.8, top: 89.9, width: 16.5, height: 3.8 },
  { label: "Restroom", type: "restroom", left: 87.4, top: 78.8, width: 11.0, height: 10.4 }
];

const DEFAULT_PRODUCTS = Array.isArray(window.HAULMART_PRODUCTS)
  ? [...window.HAULMART_PRODUCTS, ...EXTRA_PRODUCTS]
  : [];
const DEFAULT_PRODUCT_IDS = new Set(DEFAULT_PRODUCTS.map((product) => product.id));
let stateReady = false;

const state = {
  clientId: getClientId(),
  role: "customer",
  tab: "navigation",
  products: loadProducts(),
  deletedProductIds: readJSON(STORAGE_KEYS.deletedProducts, []),
  groceryList: loadGroceryList(),
  groceryListUpdatedAt: readNumber(STORAGE_KEYS.listUpdatedAt, 0),
  budget: readJSON(STORAGE_KEYS.budget, []),
  mapSections: loadMapSections(),
  promotions: loadPromotions(),
  category: "all",
  activeLocationKey: null,
  activeProductId: null,
  editingProductId: null,
  editingPromotionId: null,
  mapEditorSelectedId: null,
  mapEditorDrag: null,
  mapEditorSnapToGrid: true,
  mapEditorSaveTimer: null,
  selectedVariants: {},
  mapOpen: true,
  mapProductId: null,
  mapFocusTimer: null,
  mobileDetailProductId: null,
  imagePreviewProductId: null,
  imagePreviewIndex: 0,
  imagePreviewScale: 1,
  imagePreviewTouchStartX: 0,
  imagePreviewPinchDistance: 0,
  imagePreviewPinchScale: 1,
  firebase: null,
  firebaseReady: false,
  firebaseProductsLoaded: false,
  firebaseMapSectionsLoaded: false,
  firebasePromotionsLoaded: false,
  firebaseUnsubscribes: [],
  firebaseCatalogSeedInProgress: false,
  remoteProductsEmpty: false,
  remoteUser: null,
  adminFailedAttempts: 0,
  adminLockoutUntil: 0,
  adminUnlocked: false
};
stateReady = true;

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  renderLocationOptions();
  renderMapZones();
  renderProductOptions();
  renderCategoryChips();
  wireEvents();
  connectFirebase();
  renderAll();
  setRole("customer");
}

function cacheElements() {
  els.roleButtons = [...document.querySelectorAll("[data-role]")];
  els.roleViews = [...document.querySelectorAll("[data-role-view]")];
  els.tabButtons = [...document.querySelectorAll("[data-tab]")];
  els.tabScreens = [...document.querySelectorAll("[data-screen]")];
  els.navSearchForm = document.querySelector("#navSearchForm");
  els.navSearch = document.querySelector("#navSearch");
  els.clearNavSearch = document.querySelector("#clearNavSearch");
  els.categoryChips = document.querySelector("#categoryChips");
  els.promotionPanel = document.querySelector("#promotionPanel");
  els.promotionCarousel = document.querySelector("#promotionCarousel");
  els.navResults = document.querySelector("#navResults");
  els.resultsPanel = document.querySelector(".results-panel");
  els.navigationGrid = document.querySelector(".navigation-grid");
  els.navResultCount = document.querySelector("#navResultCount");
  els.mapPanel = document.querySelector("#mapPanel");
  els.closeMap = document.querySelector("#closeMap");
  els.mapZones = document.querySelector("#mapZones");
  els.mapLandmarks = document.querySelector("#mapLandmarks");
  els.mapTitle = document.querySelector("#mapTitle");
  els.mapRoute = document.querySelector("#mapRoute");
  els.mapGroups = document.querySelector("#mapGroups");
  els.activeAisleBadge = document.querySelector("#activeAisleBadge");
  els.productOptions = document.querySelector("#productOptions");
  els.listForm = document.querySelector("#listForm");
  els.listInput = document.querySelector("#listInput");
  els.listSuggestions = document.querySelector("#listSuggestions");
  els.groceryList = document.querySelector("#groceryList");
  els.listCount = document.querySelector("#listCount");
  els.listRoute = document.querySelector("#listRoute");
  els.listMessage = document.querySelector("#listMessage");
  els.clearList = document.querySelector("#clearList");
  els.budgetForm = document.querySelector("#budgetForm");
  els.budgetInput = document.querySelector("#budgetInput");
  els.budgetQty = document.querySelector("#budgetQty");
  els.budgetSuggestions = document.querySelector("#budgetSuggestions");
  els.budgetItems = document.querySelector("#budgetItems");
  els.budgetCount = document.querySelector("#budgetCount");
  els.budgetTotal = document.querySelector("#budgetTotal");
  els.makeChecklist = document.querySelector("#makeChecklist");
  els.clearBudget = document.querySelector("#clearBudget");
  els.adminLock = document.querySelector("#adminLock");
  els.adminPanel = document.querySelector("#adminPanel");
  els.adminLogin = document.querySelector("#adminLogin");
  els.adminEmail = document.querySelector("#adminEmail");
  els.adminPassword = document.querySelector("#adminPassword");
  els.adminLoginMessage = document.querySelector("#adminLoginMessage");
  els.adminAccessLink = document.querySelector("#adminAccessLink");
  els.adminBackButton = document.querySelector("#adminBackButton");
  els.adminBackFromLock = document.querySelector("#adminBackFromLock");
  els.adminLockButton = document.querySelector("#adminLockButton");
  els.exportProducts = document.querySelector("#exportProducts");
  els.importProducts = document.querySelector("#importProducts");
  els.importProductsFile = document.querySelector("#importProductsFile");
  els.resetInventory = document.querySelector("#resetInventory");
  els.adminSearch = document.querySelector("#adminSearch");
  els.clearAdminSearch = document.querySelector("#clearAdminSearch");
  els.adminProductList = document.querySelector("#adminProductList");
  els.adminCount = document.querySelector("#adminCount");
  els.adminStatus = document.querySelector("#adminStatus");
  els.adminAddForm = document.querySelector("#adminAddForm");
  els.newName = document.querySelector("#newName");
  els.newPrice = document.querySelector("#newPrice");
  els.newLocation = document.querySelector("#newLocation");
  els.newCategory = document.querySelector("#newCategory");
  els.newImage = document.querySelector("#newImage");
  els.newImageUpload = document.querySelector("#newImageUpload");
  els.newImagePreview = document.querySelector("#newImagePreview");
  els.mapSectionForm = document.querySelector("#mapSectionForm");
  els.mapSectionName = document.querySelector("#mapSectionName");
  els.mapSectionType = document.querySelector("#mapSectionType");
  els.mapSectionLabel = document.querySelector("#mapSectionLabel");
  els.mapSectionCategories = document.querySelector("#mapSectionCategories");
  els.mapSectionMessage = document.querySelector("#mapSectionMessage");
  els.mapSectionStatus = document.querySelector("#mapSectionStatus");
  els.mapSectionList = document.querySelector("#mapSectionList");
  els.mapEditorAddSection = document.querySelector("#mapEditorAddSection");
  els.mapEditorDuplicateSection = document.querySelector("#mapEditorDuplicateSection");
  els.mapEditorDeleteSection = document.querySelector("#mapEditorDeleteSection");
  els.mapEditorSnap = document.querySelector("#mapEditorSnap");
  els.exportMapJson = document.querySelector("#exportMapJson");
  els.importMapJson = document.querySelector("#importMapJson");
  els.importMapJsonFile = document.querySelector("#importMapJsonFile");
  els.resetMapLayout = document.querySelector("#resetMapLayout");
  els.mapEditorCanvas = document.querySelector("#mapEditorCanvas");
  els.mapEditorInspector = document.querySelector("#mapEditorInspector");
  els.mapEditorName = document.querySelector("#mapEditorName");
  els.mapEditorType = document.querySelector("#mapEditorType");
  els.mapEditorLabel = document.querySelector("#mapEditorLabel");
  els.mapEditorColor = document.querySelector("#mapEditorColor");
  els.mapEditorX = document.querySelector("#mapEditorX");
  els.mapEditorY = document.querySelector("#mapEditorY");
  els.mapEditorWidth = document.querySelector("#mapEditorWidth");
  els.mapEditorHeight = document.querySelector("#mapEditorHeight");
  els.mapEditorRotation = document.querySelector("#mapEditorRotation");
  els.mapEditorDimensions = document.querySelector("#mapEditorDimensions");
  els.mapEditorCategories = document.querySelector("#mapEditorCategories");
  els.mapEditorProducts = document.querySelector("#mapEditorProducts");
  els.promotionForm = document.querySelector("#promotionForm");
  els.promoTitle = document.querySelector("#promoTitle");
  els.promoDescription = document.querySelector("#promoDescription");
  els.promoText = document.querySelector("#promoText");
  els.promoImage = document.querySelector("#promoImage");
  els.promoImageUpload = document.querySelector("#promoImageUpload");
  els.promoImagePreview = document.querySelector("#promoImagePreview");
  els.promoButtonText = document.querySelector("#promoButtonText");
  els.promoLink = document.querySelector("#promoLink");
  els.promoStartDate = document.querySelector("#promoStartDate");
  els.promoEndDate = document.querySelector("#promoEndDate");
  els.promoActive = document.querySelector("#promoActive");
  els.promoMessage = document.querySelector("#promoMessage");
  els.promoStatus = document.querySelector("#promoStatus");
  els.promotionList = document.querySelector("#promotionList");
  els.productDetailModal = document.querySelector("#productDetailModal");
  els.productDetailContent = document.querySelector("#productDetailContent");
  els.closeProductDetail = document.querySelector("#closeProductDetail");
  els.imagePreviewModal = document.querySelector("#imagePreviewModal");
  els.imagePreviewFrame = document.querySelector("#imagePreviewFrame");
  els.imagePreviewThumbs = document.querySelector("#imagePreviewThumbs");
  els.closeImagePreview = document.querySelector("#closeImagePreview");
  els.imagePreviewPrev = document.querySelector("#imagePreviewPrev");
  els.imagePreviewNext = document.querySelector("#imagePreviewNext");
}

function wireEvents() {
  els.roleButtons.forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  els.navSearch.addEventListener("input", () => {
    state.activeProductId = null;
    state.activeLocationKey = null;
    state.category = "all";
    state.mapProductId = null;
    setMapPanelVisible(!normalize(els.navSearch.value));
    renderNavigation();
  });

  els.navSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.activeProductId = null;
    state.activeLocationKey = null;
    state.category = "all";
    state.mapProductId = null;
    setMapPanelVisible(!normalize(els.navSearch.value));
    renderNavigation();
  });

  els.clearNavSearch.addEventListener("click", () => {
    els.navSearch.value = "";
    state.category = "all";
    state.activeLocationKey = null;
    state.activeProductId = null;
    state.mapProductId = null;
    openMapPanel();
    renderCategoryChips();
    renderNavigation();
  });

  els.categoryChips?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    state.activeLocationKey = chip.dataset.location || null;
    state.activeProductId = null;
    state.mapProductId = null;
    els.navSearch.value = "";
    renderCategoryChips();
    renderNavigation();
  });

  els.navResults.addEventListener("click", handleProductAction);
  els.closeMap?.addEventListener("click", closeMapPanel);
  els.closeProductDetail?.addEventListener("click", closeProductDetail);
  els.productDetailModal?.addEventListener("click", handleProductDetailClick);
  els.closeImagePreview?.addEventListener("click", closeImagePreview);
  els.imagePreviewModal?.addEventListener("click", handleImagePreviewClick);
  els.imagePreviewModal?.addEventListener("touchstart", handleImagePreviewTouchStart, { passive: true });
  els.imagePreviewModal?.addEventListener("touchmove", handleImagePreviewTouchMove, { passive: false });
  els.imagePreviewModal?.addEventListener("touchend", handleImagePreviewTouchEnd);
  els.imagePreviewModal?.addEventListener("wheel", handleImagePreviewWheel, { passive: false });
  els.imagePreviewPrev?.addEventListener("click", () => moveImagePreview(-1));
  els.imagePreviewNext?.addEventListener("click", () => moveImagePreview(1));
  els.mapZones.addEventListener("click", handleMapZone);
  document.addEventListener("keydown", handlePageKeydown);
  els.listInput.addEventListener("input", () => renderProductSuggestions("list"));
  els.listInput.addEventListener("focus", () => renderProductSuggestions("list"));
  els.listSuggestions.addEventListener("click", handleListSuggestionClick);
  els.listForm.addEventListener("submit", handleListSubmit);
  els.groceryList.addEventListener("click", handleListClick);
  els.groceryList.addEventListener("change", handleListChange);
  els.clearList.addEventListener("click", clearCompletedListItems);
  els.budgetInput.addEventListener("input", () => renderProductSuggestions("budget"));
  els.budgetInput.addEventListener("focus", () => renderProductSuggestions("budget"));
  els.budgetSuggestions.addEventListener("click", handleBudgetSuggestionClick);
  els.budgetForm.addEventListener("submit", handleBudgetSubmit);
  els.budgetItems.addEventListener("click", handleBudgetClick);
  els.budgetItems.addEventListener("change", handleBudgetChange);
  els.makeChecklist.addEventListener("click", makeBudgetChecklist);
  els.clearBudget.addEventListener("click", clearBudget);
  els.adminAccessLink?.addEventListener("click", showAdminAccess);
  els.adminBackButton?.addEventListener("click", showCustomerView);
  els.adminBackFromLock?.addEventListener("click", showCustomerView);
  els.adminLogin.addEventListener("submit", handleAdminLogin);
  els.adminLockButton.addEventListener("click", lockAdmin);
  els.exportProducts?.addEventListener("click", exportProductBackup);
  els.importProducts?.addEventListener("click", () => els.importProductsFile?.click());
  els.importProductsFile?.addEventListener("change", importProductBackup);
  els.resetInventory.addEventListener("click", resetInventory);
  els.adminSearch.addEventListener("input", renderAdminList);
  els.clearAdminSearch.addEventListener("click", () => {
    els.adminSearch.value = "";
    renderAdminList();
  });
  els.adminProductList.addEventListener("click", handleAdminListClick);
  els.adminProductList.addEventListener("submit", saveInlineAdminProduct);
  els.adminProductList.addEventListener("input", handleInlineAdminInput);
  els.adminProductList.addEventListener("change", handleInlineAdminChange);
  els.adminProductList.addEventListener("paste", handleInlineImagePaste);
  els.newImage.addEventListener("input", () => updateImagePreview(els.newImagePreview, els.newImage.value));
  els.newImage.addEventListener("paste", (event) => handleImagePaste(event, els.newImage, els.newImagePreview, els.newImageUpload));
  els.newImageUpload.addEventListener("change", () => handleImageUpload(els.newImageUpload, els.newImage, els.newImagePreview));
  els.adminAddForm.addEventListener("submit", addAdminProduct);
  els.mapSectionForm?.addEventListener("submit", saveMapSection);
  els.mapEditorAddSection?.addEventListener("click", addMapEditorSection);
  els.mapEditorDuplicateSection?.addEventListener("click", duplicateSelectedMapSection);
  els.mapEditorDeleteSection?.addEventListener("click", deleteSelectedMapSection);
  els.mapEditorSnap?.addEventListener("change", () => {
    state.mapEditorSnapToGrid = els.mapEditorSnap.checked;
  });
  els.exportMapJson?.addEventListener("click", exportMapBackup);
  els.importMapJson?.addEventListener("click", () => els.importMapJsonFile?.click());
  els.importMapJsonFile?.addEventListener("change", importMapBackup);
  els.resetMapLayout?.addEventListener("click", resetMapLayout);
  els.mapEditorCanvas?.addEventListener("pointerdown", handleMapEditorPointerDown);
  els.mapEditorInspector?.addEventListener("input", handleMapEditorInspectorInput);
  els.mapEditorInspector?.addEventListener("change", handleMapEditorInspectorInput);
  els.promotionForm?.addEventListener("submit", savePromotion);
  els.promoImage?.addEventListener("input", () => updateImagePreview(els.promoImagePreview, els.promoImage.value));
  els.promoImage?.addEventListener("paste", (event) => handleImagePaste(event, els.promoImage, els.promoImagePreview, els.promoImageUpload));
  els.promoImageUpload?.addEventListener("change", () => handleImageUpload(els.promoImageUpload, els.promoImage, els.promoImagePreview));
  els.promotionList?.addEventListener("click", handlePromotionListClick);
  els.promotionList?.addEventListener("submit", saveInlinePromotion);
  els.promotionList?.addEventListener("input", handlePromotionListInput);
  els.promotionList?.addEventListener("change", handlePromotionListChange);
  els.promotionList?.addEventListener("paste", handlePromotionListPaste);
}

function setRole(role) {
  state.role = role;
  els.roleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.role === role);
  });
  els.roleViews.forEach((view) => {
    view.classList.toggle("is-hidden", view.dataset.roleView !== role);
  });
  els.adminAccessLink?.classList.toggle("is-hidden", role !== "customer");

  if (role === "admin") {
    renderAdminGate();
  }
}

function showAdminAccess() {
  setRole("admin");
  const adminTarget = state.adminUnlocked ? els.adminPanel : els.adminLock;
  window.requestAnimationFrame(() => {
    adminTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!state.adminUnlocked) {
      els.adminPassword?.focus();
    }
  });
}

function showCustomerView() {
  setRole("customer");
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setTab(tab) {
  state.tab = tab;
  els.tabButtons.forEach((button) => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  els.tabScreens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === tab);
  });
}

function renderAll() {
  renderPromotions();
  renderNavigation();
  renderGroceryList();
  renderBudget();
  renderPromotionSettings();
  renderMapSettings();
  renderAdminGate();
}

function connectFirebase() {
  if (state.firebaseReady) return;
  const remote = window.HaulMartFirebase;
  if (!remote) {
    window.addEventListener("haulmart:firebase-ready", connectFirebase, { once: true });
    window.setTimeout(() => {
      if (!state.firebaseReady) setAdminStatus("Firebase unavailable. Local defaults loaded.");
    }, 3500);
    return;
  }

  state.firebase = remote;
  state.firebaseReady = true;
  setAdminStatus("Firebase connected");

  state.firebaseUnsubscribes.push(remote.onAuthChanged((user) => {
    state.remoteUser = user || null;
    state.adminUnlocked = Boolean(user);
    if (state.adminUnlocked) {
      state.adminFailedAttempts = 0;
      state.adminLockoutUntil = 0;
      showAdminLoginMessage("", "");
    }
    renderAdminGate();
  }));

  state.firebaseUnsubscribes.push(remote.onProducts((products) => {
    state.firebaseProductsLoaded = true;
    const remoteProducts = products.map(normalizeProduct);
    state.remoteProductsEmpty = remoteProducts.length === 0;
    state.products = mergeProductCatalog(DEFAULT_PRODUCTS, remoteProducts);
    renderInventoryViews();
    restoreMissingRemoteCatalog(remoteProducts);
  }, (error) => {
    state.firebaseProductsLoaded = false;
    setAdminStatus("Firebase product sync failed");
    console.error(error);
  }));

  state.firebaseUnsubscribes.push(remote.onMapSections((sections) => {
    state.firebaseMapSectionsLoaded = true;
    state.mapSections = normalizeLoadedMapSections(sections);
    if (!state.mapEditorSelectedId || !getLocationZone(state.mapEditorSelectedId)) {
      state.mapEditorSelectedId = state.mapSections[0]?.key || null;
    }
    renderMapZones();
    renderNavigation();
    renderMapSettings();
  }, (error) => {
    state.firebaseMapSectionsLoaded = false;
    setAdminStatus("Firebase map sync failed");
    console.error(error);
  }));

  if (remote.onPromotions) {
    state.firebaseUnsubscribes.push(remote.onPromotions((promotions) => {
      state.firebasePromotionsLoaded = true;
      state.promotions = promotions
        .map(normalizePromotion)
        .filter(Boolean)
        .sort((a, b) => getPromotionSortValue(a) - getPromotionSortValue(b) || a.title.localeCompare(b.title));
      renderPromotions();
      renderPromotionSettings();
    }, (error) => {
      state.firebasePromotionsLoaded = false;
      setAdminStatus("Firebase promotion sync failed");
      console.error(error);
    }));
  }

  if (remote.onGroceryList) {
    state.firebaseUnsubscribes.push(remote.onGroceryList(state.clientId, applyRemoteGroceryList, (error) => {
      console.error("Firestore shopping list sync failed:", error);
    }));
  }
}

function renderInventoryViews() {
  renderProductOptions();
  renderCategoryChips();
  renderPromotions();
  renderNavigation();
  renderGroceryList();
  renderBudget();
  renderPromotionSettings();
  renderMapSettings();
  renderAdminGate();
}

function renderProductOptions() {
  const options = state.products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((product) => [
      product.name,
      ...getProductVariants(product).map((variant) => getProductDisplayName(product, variant))
    ]);

  els.productOptions.innerHTML = options
    .map((option) => `<option value="${escapeHTML(option)}"></option>`)
    .join("");
}

function renderCategoryChips() {
  if (!els.categoryChips) return;
  els.categoryChips.innerHTML = "";
  els.categoryChips.hidden = true;
}

function renderPromotions() {
  if (!els.promotionPanel || !els.promotionCarousel) return;
  const isLandingView = !normalize(els.navSearch?.value) && !state.activeLocationKey && state.category === "all";
  const promotions = isLandingView
    ? state.promotions.filter(isPromotionVisible)
    : [];

  els.promotionPanel.classList.toggle("is-hidden", !promotions.length);
  els.promotionCarousel.innerHTML = promotions.map(renderPromotionBanner).join("");
}

function renderPromotionBanner(promotion) {
  const imageSource = getImageSource(promotion.image);
  const cta = getPromotionLinkMarkup(promotion);
  return `
    <article class="promotion-card" data-promotion-id="${escapeHTML(promotion.id)}">
      <div class="promotion-copy">
        ${promotion.promoText ? `<span class="promotion-eyebrow">${escapeHTML(promotion.promoText)}</span>` : ""}
        <h2>${escapeHTML(promotion.title)}</h2>
        ${promotion.description ? `<p>${escapeHTML(promotion.description)}</p>` : ""}
        ${cta}
      </div>
      ${imageSource
        ? `<div class="promotion-image-wrap"><img class="promotion-image" src="${escapeHTML(imageSource)}" alt="${escapeHTML(promotion.title)}" onerror="replaceBrokenPromotionImage(this)"></div>`
        : ""}
    </article>
  `;
}

function getPromotionLinkMarkup(promotion) {
  if (!promotion.buttonText) return "";
  const link = normalizePromotionLink(promotion.link);
  if (!link) return `<span class="promotion-button">${escapeHTML(promotion.buttonText)}</span>`;
  return `<a class="promotion-button" href="${escapeHTML(link)}" target="_blank" rel="noopener">${escapeHTML(promotion.buttonText)}</a>`;
}

function renderNavigation() {
  const results = getNavigationResults();
  const query = normalize(els.navSearch.value);
  const hasQuery = Boolean(query);
  renderPromotions();
  if (hasQuery) {
    applyQueryVariantSelection(results, query);
  }
  const shouldShowResults = hasQuery || Boolean(state.activeLocationKey) || state.category !== "all";
  if (els.navResultCount) {
    els.navResultCount.textContent = `${results.length} ${results.length === 1 ? "item" : "items"}`;
  }
  els.resultsPanel?.classList.toggle("is-hidden", !shouldShowResults);
  els.navResults.innerHTML = shouldShowResults
    ? results.length
      ? results.map(renderProductCard).join("")
      : `<div class="empty-state">No products matched that search.</div>`
    : "";

  const activeProduct = findProductById(state.activeProductId);
  const firstResult = activeProduct || results[0] || null;
  const mapProduct = activeProduct || (hasQuery ? firstResult : null);
  const shouldShowFilteredLocation = state.category !== "all" || Boolean(state.activeLocationKey);
  const locationKey = mapProduct
    ? getProductLocationKey(mapProduct)
    : shouldShowFilteredLocation
      ? state.activeLocationKey || (firstResult ? getProductLocationKey(firstResult) : null)
      : null;
  updateMap(locationKey, mapProduct);
  syncMapPanelVisibility();
}

function getNavigationResults() {
  const query = normalize(els.navSearch.value);
  if (!query && !state.activeLocationKey && state.category === "all") {
    return [];
  }

  let results = state.products.slice();

  if (!query && state.activeLocationKey) {
    results = results.filter((product) => getProductLocationKey(product) === state.activeLocationKey);
  }

  if (query) {
    results = results
      .map((product) => ({ product, score: searchScore(product, query) }))
      .filter((item) => item.score !== null)
      .sort((a, b) => a.score - b.score || getProductLocationOrder(a.product) - getProductLocationOrder(b.product) || a.product.name.localeCompare(b.product.name))
      .map((item) => item.product);
  } else {
    results.sort((a, b) => getProductLocationOrder(a) - getProductLocationOrder(b) || a.name.localeCompare(b.name));
  }

  return results.slice(0, 36);
}

function renderProductCard(product) {
  const selectedVariant = getSelectedVariant(product);
  const display = getProductDisplayDetails(product, selectedVariant);
  const stockClass = display.inStock ? "in" : "out";
  const stockText = display.inStock ? "In stock" : "Sold out";
  const active = state.activeProductId === product.id;
  const locationLabel = getProductLocationLabel(product);
  const imageSource = getImageSource(display.image);
  const productImage = imageSource
    ? `<img class="product-image" src="${escapeHTML(imageSource)}" alt="${escapeHTML(display.imageAlt)}" onerror="replaceBrokenProductImage(this)">`
    : `<div class="missing-image">Image not available</div>`;
  return `
    <article class="product-card ${active ? "is-active" : ""}" data-product-id="${escapeHTML(product.id)}">
      <div class="product-shot ${imageSource ? "has-image" : "is-missing"}" data-aisle="${getProductShotSlot(product)}" aria-label="Product photo for ${escapeHTML(display.imageAlt)}">
        ${productImage}
      </div>
      <div class="product-body">
        <div>
          <h2 class="product-name">${escapeHTML(product.name)}</h2>
          ${selectedVariant ? `<span class="variant-selected-label">${escapeHTML(selectedVariant.name)}</span>` : ""}
          <span class="stock-pill ${stockClass}">${stockText}</span>
        </div>
        ${renderVariantPicker(product, selectedVariant)}
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Price</span>
            <span class="meta-value">${CURRENCY.format(display.price)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Location</span>
            <span class="meta-value">${escapeHTML(locationLabel)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value" title="${escapeHTML(product.category)}">${escapeHTML(product.category)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <span class="meta-value status-value ${stockClass}">${stockText}</span>
          </div>
        </div>
        <div class="card-actions">
          <button type="button" data-action="map" data-id="${escapeHTML(product.id)}">View Map</button>
          <button type="button" data-action="list" data-id="${escapeHTML(product.id)}">List</button>
          <button type="button" data-action="budget" data-id="${escapeHTML(product.id)}">Budget</button>
        </div>
      </div>
    </article>
  `;
}

function renderVariantPicker(product, selectedVariant) {
  const variants = getProductVariants(product);
  if (!variants.length) return "";

  return `
    <div class="variant-picker" aria-label="Product variants for ${escapeHTML(product.name)}">
      ${variants.map((variant) => renderVariantOption(product, variant, selectedVariant)).join("")}
    </div>
  `;
}

function renderVariantOption(product, variant, selectedVariant) {
  const selected = selectedVariant?.id === variant.id;
  const stockText = variant.inStock ? "In stock" : "Sold out";
  const imageSource = getImageSource(variant.image || product.image);
  return `
    <button class="variant-option ${selected ? "is-selected" : ""}" type="button" data-action="variant" data-id="${escapeHTML(product.id)}" data-variant-id="${escapeHTML(variant.id)}" aria-pressed="${selected ? "true" : "false"}">
      <span class="variant-thumb ${imageSource ? "" : "is-empty"}">
        ${imageSource ? `<img src="${escapeHTML(imageSource)}" alt="${escapeHTML(`${product.name} ${variant.name}`)}" onerror="replaceBrokenVariantThumb(this)">` : "No image"}
      </span>
      <span class="variant-copy">
        <span class="variant-name">${escapeHTML(variant.name)}</span>
        <span class="variant-meta">${CURRENCY.format(variant.price)} &middot; ${stockText}</span>
      </span>
    </button>
  `;
}

function handleProductAction(event) {
  const button = event.target.closest("[data-action]");
  if (button) {
    const product = findProductById(button.dataset.id);
    if (!product) return;

    if (button.dataset.action === "map") {
      openProductMap(product.id);
    }

    if (button.dataset.action === "variant") {
      state.selectedVariants[product.id] = button.dataset.variantId;
      state.activeProductId = product.id;
      renderNavigation();
    }

    if (button.dataset.action === "list") {
      const variant = getSelectedVariant(product);
      addListItem(getProductDisplayName(product, variant), product.id, variant?.id || null);
      setTab("list");
    }

    if (button.dataset.action === "budget") {
      addBudgetItem(product.id, 1, getSelectedVariant(product)?.id || null);
      setTab("budget");
    }
    return;
  }

  const card = event.target.closest(".product-card");
  if (!card) return;
  const product = findProductById(card.dataset.productId);
  if (!product) return;

  if (event.target.closest(".product-shot")) {
    event.preventDefault();
    event.stopPropagation();
    openSelectedProductImagePreview(product);
    return;
  }

  if (!isMobileView()) return;
  openProductDetail(product.id);
}

function openProductDetail(productId) {
  if (!isMobileView()) return;
  const product = findProductById(productId);
  if (!product) return;
  state.mobileDetailProductId = product.id;
  renderProductDetail();
  els.productDetailModal?.classList.remove("is-hidden");
  els.productDetailModal?.setAttribute("aria-hidden", "false");
  syncModalBodyLock();
  window.requestAnimationFrame(() => els.closeProductDetail?.focus());
}

function closeProductDetail() {
  state.mobileDetailProductId = null;
  els.productDetailModal?.classList.add("is-hidden");
  els.productDetailModal?.setAttribute("aria-hidden", "true");
  syncModalBodyLock();
}

function renderProductDetail() {
  const product = findProductById(state.mobileDetailProductId);
  if (!product || !els.productDetailContent) return;
  const selectedVariant = getSelectedVariant(product);
  const display = getProductDisplayDetails(product, selectedVariant);
  const imageSource = getImageSource(display.image);
  const stockClass = display.inStock ? "in" : "out";
  const stockText = display.inStock ? "In stock" : "Not available";
  const locationLabel = getProductLocationLabel(product);

  els.productDetailContent.innerHTML = `
    <div class="mobile-product-detail">
      <button class="product-detail-image-button ${imageSource ? "" : "is-missing"}" type="button" data-detail-preview aria-label="Preview image for ${escapeHTML(display.imageAlt)}">
        ${imageSource
          ? `<img class="product-detail-image" src="${escapeHTML(imageSource)}" alt="${escapeHTML(display.imageAlt)}" onerror="replaceBrokenDetailImage(this)">`
          : `<span class="missing-image">Image not available</span>`}
      </button>
      <div class="product-detail-copy">
        <span class="stock-pill ${stockClass}">${stockText}</span>
        <h2 id="productDetailTitle">${escapeHTML(product.name)}</h2>
        ${selectedVariant ? `<p class="product-detail-variant-label">${escapeHTML(selectedVariant.name)}</p>` : ""}
        <div class="product-detail-meta">
          <div>
            <span class="meta-label">Price</span>
            <strong>${CURRENCY.format(display.price)}</strong>
          </div>
          <div>
            <span class="meta-label">Location</span>
            <span>${escapeHTML(locationLabel)}</span>
          </div>
          <div>
            <span class="meta-label">Category</span>
            <span>${escapeHTML(product.category)}</span>
          </div>
        </div>
        <section class="product-description">
          <h3>Description</h3>
          <p>${escapeHTML(getProductDescription(product, locationLabel))}</p>
        </section>
        ${renderProductDetailVariants(product, selectedVariant)}
      </div>
    </div>
  `;
}

function renderProductDetailVariants(product, selectedVariant) {
  const variants = getProductVariants(product);
  if (!variants.length) return "";
  return `
    <section class="product-detail-variants" aria-label="Product variants">
      <h3>Variants</h3>
      <div class="product-detail-variant-grid">
        ${variants.map((variant) => renderProductDetailVariant(product, variant, selectedVariant)).join("")}
      </div>
    </section>
  `;
}

function renderProductDetailVariant(product, variant, selectedVariant) {
  const selected = selectedVariant?.id === variant.id;
  const imageSource = getImageSource(variant.image || product.image);
  const stockText = variant.inStock ? "In stock" : "Not available";
  return `
    <button class="product-detail-variant ${selected ? "is-selected" : ""}" type="button" data-detail-variant="${escapeHTML(variant.id)}" aria-pressed="${selected ? "true" : "false"}">
      <span class="variant-thumb ${imageSource ? "" : "is-empty"}">
        ${imageSource ? `<img src="${escapeHTML(imageSource)}" alt="${escapeHTML(`${product.name} ${variant.name}`)}" onerror="replaceBrokenVariantThumb(this)">` : "No image"}
      </span>
      <span class="variant-copy">
        <span class="variant-name">${escapeHTML(variant.name)}</span>
        <span class="variant-meta">${CURRENCY.format(variant.price)} &middot; ${stockText}</span>
      </span>
    </button>
  `;
}

function handleProductDetailClick(event) {
  if (event.target === els.productDetailModal) {
    closeProductDetail();
    return;
  }

  const product = findProductById(state.mobileDetailProductId);
  if (!product) return;

  if (event.target.closest("[data-detail-preview]")) {
    event.preventDefault();
    event.stopPropagation();
    openSelectedProductImagePreview(product);
    return;
  }

  const variantButton = event.target.closest("[data-detail-variant]");
  if (!variantButton) return;
  state.selectedVariants[product.id] = variantButton.dataset.detailVariant;
  renderProductDetail();
  renderNavigation();
}

function getProductDescription(product, locationLabel = getProductLocationLabel(product)) {
  if (product.description) return product.description;
  const category = product.category || "Grocery";
  return `${product.name} is a ${category} item available in ${locationLabel}. Check the product package and choose a variant when available.`;
}

function openImagePreview(productId, index = 0) {
  const gallery = getProductImageGallery(findProductById(productId));
  if (!gallery.length) return;
  state.imagePreviewProductId = productId;
  state.imagePreviewIndex = clamp(index, 0, gallery.length - 1);
  state.imagePreviewScale = 1;
  renderImagePreview();
  els.imagePreviewModal?.classList.remove("is-hidden");
  els.imagePreviewModal?.setAttribute("aria-hidden", "false");
  syncModalBodyLock();
  window.requestAnimationFrame(() => els.closeImagePreview?.focus());
}

function openSelectedProductImagePreview(product) {
  if (!product) return;
  const selectedVariant = getSelectedVariant(product);
  const display = getProductDisplayDetails(product, selectedVariant);
  const imageSource = getImageSource(display.image);
  const imageIndex = getProductImageGallery(product).findIndex((entry) => entry.src === imageSource);
  openImagePreview(product.id, Math.max(0, imageIndex));
}

function closeImagePreview() {
  state.imagePreviewProductId = null;
  state.imagePreviewIndex = 0;
  state.imagePreviewScale = 1;
  els.imagePreviewModal?.classList.add("is-hidden");
  els.imagePreviewModal?.setAttribute("aria-hidden", "true");
  syncModalBodyLock();
}

function renderImagePreview() {
  const gallery = getProductImageGallery(findProductById(state.imagePreviewProductId));
  if (!gallery.length || !els.imagePreviewFrame || !els.imagePreviewThumbs) return;
  state.imagePreviewIndex = clamp(state.imagePreviewIndex, 0, gallery.length - 1);
  const activeImage = gallery[state.imagePreviewIndex];
  els.imagePreviewFrame.innerHTML = `
    <img class="image-preview-main-image" src="${escapeHTML(activeImage.src)}" alt="${escapeHTML(activeImage.label)}" style="transform: scale(${state.imagePreviewScale})" onerror="replaceBrokenImagePreview(this)">
  `;
  els.imagePreviewThumbs.innerHTML = gallery.map((entry, index) => `
    <button class="image-preview-thumb ${index === state.imagePreviewIndex ? "is-active" : ""}" type="button" data-preview-index="${index}" aria-label="View ${escapeHTML(entry.label)}">
      <img src="${escapeHTML(entry.src)}" alt="">
    </button>
  `).join("");
  const multipleImages = gallery.length > 1;
  els.imagePreviewPrev.hidden = !multipleImages;
  els.imagePreviewNext.hidden = !multipleImages;
}

function handleImagePreviewClick(event) {
  const thumb = event.target.closest("[data-preview-index]");
  if (thumb) {
    state.imagePreviewIndex = Number(thumb.dataset.previewIndex) || 0;
    state.imagePreviewScale = 1;
    renderImagePreview();
    return;
  }

  if (event.target === els.imagePreviewModal || event.target === els.imagePreviewFrame) {
    closeImagePreview();
  }
}

function moveImagePreview(direction) {
  const gallery = getProductImageGallery(findProductById(state.imagePreviewProductId));
  if (gallery.length < 2) return;
  state.imagePreviewIndex = (state.imagePreviewIndex + direction + gallery.length) % gallery.length;
  state.imagePreviewScale = 1;
  renderImagePreview();
}

function handleImagePreviewTouchStart(event) {
  if (els.imagePreviewModal?.classList.contains("is-hidden")) return;
  if (event.touches.length === 2) {
    state.imagePreviewPinchDistance = getTouchDistance(event.touches);
    state.imagePreviewPinchScale = state.imagePreviewScale;
    return;
  }
  if (event.touches.length === 1) {
    state.imagePreviewTouchStartX = event.touches[0].clientX;
  }
}

function handleImagePreviewTouchMove(event) {
  if (event.touches.length !== 2 || !state.imagePreviewPinchDistance) return;
  event.preventDefault();
  const distance = getTouchDistance(event.touches);
  state.imagePreviewScale = clamp(state.imagePreviewPinchScale * (distance / state.imagePreviewPinchDistance), 1, 3);
  updatePreviewImageScale();
}

function handleImagePreviewTouchEnd(event) {
  if (state.imagePreviewPinchDistance) {
    state.imagePreviewPinchDistance = 0;
    return;
  }
  const changedTouch = event.changedTouches?.[0];
  if (!changedTouch || !state.imagePreviewTouchStartX) return;
  const deltaX = changedTouch.clientX - state.imagePreviewTouchStartX;
  state.imagePreviewTouchStartX = 0;
  if (Math.abs(deltaX) < 44 || state.imagePreviewScale > 1.05) return;
  moveImagePreview(deltaX < 0 ? 1 : -1);
}

function handleImagePreviewWheel(event) {
  if (!event.ctrlKey && Math.abs(event.deltaY) < 35) return;
  event.preventDefault();
  const delta = event.deltaY < 0 ? 0.12 : -0.12;
  state.imagePreviewScale = clamp(state.imagePreviewScale + delta, 1, 3);
  updatePreviewImageScale();
}

function updatePreviewImageScale() {
  const image = els.imagePreviewFrame?.querySelector(".image-preview-main-image");
  if (image) image.style.transform = `scale(${state.imagePreviewScale})`;
}

function getTouchDistance(touches) {
  const [first, second] = touches;
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function getProductImageGallery(product) {
  if (!product) return [];
  const entries = [];
  const addImage = (label, image) => {
    const src = getImageSource(image);
    if (!src || entries.some((entry) => entry.src === src)) return;
    entries.push({ label, src });
  };
  addImage(product.name, product.image);
  getProductVariants(product).forEach((variant) => {
    addImage(`${product.name} - ${variant.name}`, variant.image || product.image);
  });
  return entries;
}

function syncModalBodyLock() {
  const detailOpen = els.productDetailModal && !els.productDetailModal.classList.contains("is-hidden");
  const previewOpen = els.imagePreviewModal && !els.imagePreviewModal.classList.contains("is-hidden");
  const modalOpen = Boolean(detailOpen || previewOpen);
  document.body.classList.toggle("modal-open", modalOpen);
}

function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function renderMapZones() {
  if (els.mapLandmarks) els.mapLandmarks.innerHTML = "";

  els.mapZones.innerHTML = getLocationZones().map((zone) => `
    <button
      class="map-zone"
      type="button"
      data-location="${escapeHTML(zone.key)}"
      data-zone-type="${escapeHTML(getZoneType(zone.key))}"
      data-has-color="${zone.color ? "true" : "false"}"
      aria-label="${escapeHTML(zone.label)}"
      title="${escapeHTML(zone.label)}"
      style="${getMapSectionInlineStyle(zone)}"
    ><span class="map-zone-label">${renderLocationShortLabel(zone.key, zone.label)}</span></button>
  `).join("");
}

function getMapSectionInlineStyle(zone) {
  const styles = [
    `left:${formatMapNumber(zone.left)}%`,
    `top:${formatMapNumber(zone.top)}%`,
    `width:${formatMapNumber(zone.width)}%`,
    `height:${formatMapNumber(zone.height)}%`,
    `transform:rotate(${formatMapNumber(zone.rotation || 0)}deg)`
  ];
  if (zone.color) {
    styles.push(`background:${zone.color}`);
    styles.push(`border-color:${zone.color}`);
    styles.push(`color:${getContrastTextColor(zone.color)}`);
  }
  return styles.join(";");
}

function updateMap(locationKey, product) {
  document.querySelectorAll(".map-zone").forEach((zone) => {
    zone.classList.toggle("is-active", zone.dataset.location === locationKey);
  });

  if (!locationKey) {
    els.mapTitle.textContent = "Location Guide";
    els.mapRoute.textContent = "Search or tap a section to view details.";
    els.mapGroups.classList.add("is-hidden");
    els.mapGroups.innerHTML = "";
    if (els.activeAisleBadge) els.activeAisleBadge.textContent = "All locations";
    return;
  }

  const locationLabel = getLocationLabel(locationKey);
  const category = product?.category || getCategoryByLocation(locationKey) || "Selected products";
  els.mapTitle.textContent = locationLabel;
  els.mapRoute.textContent = category;
  renderMapGroups(locationKey);
  if (els.activeAisleBadge) els.activeAisleBadge.textContent = locationLabel;
}

function renderMapGroups(locationKey) {
  const groups = getLocationProductGroups(locationKey);
  if (!groups.length) {
    els.mapGroups.classList.add("is-hidden");
    els.mapGroups.innerHTML = "";
    return;
  }

  els.mapGroups.classList.remove("is-hidden");
  els.mapGroups.innerHTML = `
    <p class="map-groups-title">Categories:</p>
    <ul class="map-group-list">
      ${groups.map((group) => `<li>${escapeHTML(group)}</li>`).join("")}
    </ul>
  `;
}

function handleMapZone(event) {
  const zone = event.target.closest("[data-location]");
  if (!zone) return;
  const locationKey = zone.dataset.location;
  const category = getCategoryByLocation(locationKey);
  state.activeLocationKey = locationKey;
  state.category = category || "all";
  state.activeProductId = null;
  state.mapProductId = null;
  els.navSearch.value = "";
  renderCategoryChips();
  renderNavigation();
  closeMapPanel();
}

function navigateToProduct(productId, variantId = null) {
  const product = findProductById(productId);
  if (!product) return;
  const variant = findProductVariant(product, variantId);
  if (variant) state.selectedVariants[product.id] = variant.id;
  state.activeProductId = product.id;
  state.activeLocationKey = getProductLocationKey(product);
  state.category = "all";
  state.mapProductId = null;
  els.navSearch.value = product.name;
  setRole("customer");
  setTab("navigation");
  renderCategoryChips();
  renderNavigation();
}

function openProductMap(productId) {
  const product = findProductById(productId);
  if (!product) return;
  state.activeProductId = product.id;
  state.activeLocationKey = getProductLocationKey(product);
  state.category = "all";
  state.mapProductId = product.id;
  state.mapOpen = true;
  renderCategoryChips();
  renderNavigation();
}

function openMapPanel() {
  state.mapProductId = null;
  setMapPanelVisible(true);
}

function closeMapPanel() {
  state.mapProductId = null;
  setMapPanelVisible(false);
}

function setMapPanelVisible(isVisible) {
  state.mapOpen = Boolean(isVisible);
  syncMapPanelVisibility();
}

function syncMapPanelVisibility() {
  syncMapPanelPlacement();
  els.mapPanel?.classList.toggle("is-hidden", !state.mapOpen);
  els.mapPanel?.setAttribute("aria-hidden", state.mapOpen ? "false" : "true");
  if (els.closeMap) {
    els.closeMap.hidden = !state.mapProductId;
  }
}

function syncMapPanelPlacement() {
  if (!els.mapPanel) return;
  els.navResults?.classList.remove("has-inline-map");

  if (state.mapProductId) {
    const targetCard = [...els.navResults.querySelectorAll(".product-card")]
      .find((card) => card.dataset.productId === state.mapProductId);
    if (targetCard) {
      targetCard.insertAdjacentElement("afterend", els.mapPanel);
      els.navResults.classList.add("has-inline-map");
      return;
    }
  }

  if (els.navigationGrid && els.mapPanel.parentElement !== els.navigationGrid) {
    els.navigationGrid.insertBefore(els.mapPanel, els.resultsPanel);
  }
}

function handlePageKeydown(event) {
  if (event.key !== "Escape") return;

  if (els.imagePreviewModal && !els.imagePreviewModal.classList.contains("is-hidden")) {
    closeImagePreview();
    return;
  }

  if (els.productDetailModal && !els.productDetailModal.classList.contains("is-hidden")) {
    closeProductDetail();
    return;
  }

  if (state.mapOpen) {
    closeMapPanel();
  }
}

function handleListSubmit(event) {
  event.preventDefault();
  addListItem(els.listInput.value);
  els.listInput.value = "";
  clearProductSuggestions("list");
}

function handleListSuggestionClick(event) {
  const suggestion = event.target.closest("[data-suggestion-product]");
  if (!suggestion) return;
  const product = findProductById(suggestion.dataset.suggestionProduct);
  if (!product) return;
  const variant = findProductVariant(product, suggestion.dataset.suggestionVariant);
  addListItem(getProductDisplayName(product, variant), product.id, variant?.id || null);
  els.listInput.value = "";
  clearProductSuggestions("list");
}

function addListItem(label, productId = null, variantId = null) {
  const trimmed = label.trim();
  if (!trimmed && !productId) return;
  const entry = productId
    ? { product: findProductById(productId), variant: null }
    : findBestProductEntry(trimmed);
  const product = entry?.product || null;
  const variant = product ? findProductVariant(product, variantId) || entry?.variant || null : null;
  const itemLabel = product ? getProductDisplayName(product, variant) : trimmed;
  const duplicate = state.groceryList.some((item) =>
    normalize(item.label) === normalize(itemLabel)
    && !item.done
    && (item.variantId || null) === (variant?.id || null)
  );
  if (duplicate) return;

  state.groceryList.push({
    id: createId("list"),
    label: itemLabel,
    productId: product?.id || null,
    variantId: variant?.id || null,
    done: false
  });

  persistGroceryList();
  showListMessage("", "");
  renderGroceryList();
}

function renderGroceryList() {
  const pending = state.groceryList.filter((item) => !item.done).length;
  els.listCount.textContent = `${pending} pending`;

  els.groceryList.innerHTML = state.groceryList.length
    ? state.groceryList.map(renderListItem).join("")
    : `<div class="empty-state">Your list is empty.</div>`;

  renderListRoute();
}

function renderListItem(item) {
  const product = getListProduct(item);
  const variant = product ? findProductVariant(product, item.variantId) : null;
  const meta = product ? `${variant ? `${variant.name} | ` : ""}${product.category} | ${getProductLocationLabel(product)}` : "Custom item";
  return `
    <article class="list-item ${item.done ? "is-done" : ""}" data-id="${escapeHTML(item.id)}">
      <input type="checkbox" ${item.done ? "checked" : ""} data-action="toggle-list" aria-label="Mark ${escapeHTML(item.label)} finished">
      <div>
        <span class="item-title">${escapeHTML(item.label)}</span>
        <span class="item-meta">${escapeHTML(meta)}</span>
      </div>
      <div class="mini-actions">
        ${product ? `<button class="mini-button" type="button" data-action="navigate-list" data-id="${escapeHTML(item.id)}">Find</button>` : ""}
        <button class="mini-button" type="button" data-action="delete-list" data-id="${escapeHTML(item.id)}">Remove</button>
      </div>
    </article>
  `;
}

function renderListRoute() {
  const routeEntries = state.groceryList
    .filter((item) => !item.done)
    .map((item) => ({ item, product: getListProduct(item) }))
    .filter((entry) => entry.product)
    .sort((a, b) => getProductLocationOrder(a.product) - getProductLocationOrder(b.product) || a.product.name.localeCompare(b.product.name));

  if (!routeEntries.length) {
    els.listRoute.innerHTML = `<div class="empty-state">No mapped products on the list.</div>`;
    return;
  }

  const grouped = new Map();
  routeEntries.forEach(({ item, product }) => {
    const key = getProductLocationKey(product);
    const variant = findProductVariant(product, item.variantId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(getProductDisplayName(product, variant));
  });

  els.listRoute.innerHTML = [...grouped.entries()].map(([locationKey, names]) => `
    <article class="route-card">
      <strong>${escapeHTML(getLocationLabel(locationKey))}</strong>
      <span class="item-meta">${escapeHTML(names.join(", "))}</span>
    </article>
  `).join("");
}

function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const item = state.groceryList.find((listItem) => listItem.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "navigate-list") {
    const product = getListProduct(item);
    if (product) navigateToProduct(product.id, item.variantId || null);
  }

  if (button.dataset.action === "delete-list") {
    state.groceryList = state.groceryList.filter((listItem) => listItem.id !== item.id);
    persistGroceryList();
    showListMessage("", "");
    renderGroceryList();
  }
}

function handleListChange(event) {
  const checkbox = event.target.closest("[data-action='toggle-list']");
  if (!checkbox) return;
  const itemNode = checkbox.closest(".list-item");
  const item = state.groceryList.find((listItem) => listItem.id === itemNode.dataset.id);
  if (!item) return;
  item.done = checkbox.checked;
  persistGroceryList();
  showListMessage("", "");
  renderGroceryList();
}

function clearCompletedListItems() {
  const completed = state.groceryList.filter((item) => item.done);
  if (!completed.length) {
    showListMessage("No completed items selected.", "");
    return;
  }

  state.groceryList = state.groceryList.filter((item) => !item.done);
  persistGroceryList({ showSyncError: true });
  renderGroceryList();
  showListMessage(`Cleared ${completed.length} completed ${completed.length === 1 ? "item" : "items"}.`, "success");
}

function persistGroceryList(options = {}) {
  const updatedAt = Date.now();
  state.groceryList = state.groceryList.map(normalizeGroceryListItem).filter(Boolean);
  state.groceryListUpdatedAt = updatedAt;
  saveJSON(STORAGE_KEYS.list, state.groceryList);
  saveJSON(STORAGE_KEYS.listUpdatedAt, updatedAt);
  saveRemoteGroceryList(updatedAt, options.showSyncError);
}

async function saveRemoteGroceryList(updatedAt = state.groceryListUpdatedAt, showSyncError = false) {
  if (!state.firebaseReady || !state.firebase?.saveGroceryList) return;
  try {
    await state.firebase.saveGroceryList(state.clientId, state.groceryList, updatedAt);
  } catch (error) {
    console.error("Firestore shopping list sync failed:", error);
    if (showSyncError) {
      showListMessage("List updated on this device. Firestore sync failed.", "error");
    }
  }
}

function applyRemoteGroceryList(remoteList) {
  if (!remoteList) {
    if (state.groceryList.length) saveRemoteGroceryList();
    return;
  }

  const remoteUpdatedAt = Number(remoteList.updatedAtMillis) || 0;
  if (remoteUpdatedAt > state.groceryListUpdatedAt) {
    state.groceryList = normalizeGroceryListItems(remoteList.items);
    state.groceryListUpdatedAt = remoteUpdatedAt;
    saveJSON(STORAGE_KEYS.list, state.groceryList);
    saveJSON(STORAGE_KEYS.listUpdatedAt, remoteUpdatedAt);
    renderGroceryList();
    return;
  }

  if (state.groceryListUpdatedAt > remoteUpdatedAt) {
    saveRemoteGroceryList();
  }
}

function showListMessage(message, type) {
  showAdminMessage(els.listMessage, message, type);
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const entry = findBestProductEntry(els.budgetInput.value);
  const qty = Math.max(1, Number(els.budgetQty.value) || 1);
  if (!entry?.product) return;
  addBudgetItem(entry.product.id, qty, entry.variant?.id || null);
  els.budgetInput.value = "";
  els.budgetQty.value = "1";
  clearProductSuggestions("budget");
}

function handleBudgetSuggestionClick(event) {
  const suggestion = event.target.closest("[data-suggestion-product]");
  if (!suggestion) return;
  const product = findProductById(suggestion.dataset.suggestionProduct);
  if (!product) return;
  const variant = findProductVariant(product, suggestion.dataset.suggestionVariant);
  const qty = Math.max(1, Number(els.budgetQty.value) || 1);
  addBudgetItem(product.id, qty, variant?.id || null);
  els.budgetInput.value = "";
  els.budgetQty.value = "1";
  clearProductSuggestions("budget");
}

function addBudgetItem(productId, qty, variantId = null) {
  const product = findProductById(productId);
  if (!product) return;
  const variant = findProductVariant(product, variantId);
  const existing = state.budget.find((item) => item.productId === product.id && (item.variantId || null) === (variant?.id || null));
  if (existing) {
    existing.qty += qty;
  } else {
    state.budget.push({ id: createId("budget"), productId: product.id, variantId: variant?.id || null, qty });
  }
  saveJSON(STORAGE_KEYS.budget, state.budget);
  renderBudget();
}

function renderBudget() {
  const products = state.budget
    .map((item) => ({ item, product: findProductById(item.productId) }))
    .filter((entry) => entry.product)
    .map((entry) => ({ ...entry, variant: findProductVariant(entry.product, entry.item.variantId) }));
  const total = products.reduce((sum, entry) => sum + getProductDisplayDetails(entry.product, entry.variant).price * entry.item.qty, 0);
  const count = products.reduce((sum, entry) => sum + entry.item.qty, 0);

  els.budgetCount.textContent = `${count} ${count === 1 ? "product" : "products"}`;
  els.budgetTotal.textContent = CURRENCY.format(total);
  els.budgetItems.innerHTML = products.length
    ? products.map(renderBudgetItem).join("")
    : `<div class="empty-state">No budget products selected.</div>`;
}

function renderBudgetItem({ item, product, variant }) {
  const details = getProductDisplayDetails(product, variant);
  return `
    <article class="budget-item" data-id="${escapeHTML(item.id)}">
      <div>
        <span class="item-title">${escapeHTML(getProductDisplayName(product, variant))}</span>
        <span class="item-meta">${escapeHTML(getProductLocationLabel(product))} | ${CURRENCY.format(details.price)} each</span>
      </div>
      <input class="qty-input" type="number" min="1" value="${item.qty}" data-action="budget-qty" aria-label="Quantity for ${escapeHTML(getProductDisplayName(product, variant))}">
      <span class="line-total">${CURRENCY.format(details.price * item.qty)}</span>
      <button class="mini-button" type="button" data-action="remove-budget" data-id="${escapeHTML(item.id)}">Remove</button>
    </article>
  `;
}

function renderProductSuggestions(target) {
  const input = target === "budget" ? els.budgetInput : els.listInput;
  const container = target === "budget" ? els.budgetSuggestions : els.listSuggestions;
  const query = normalize(input.value);

  if (!query) {
    clearProductSuggestions(target);
    return;
  }

  const suggestions = getProductSuggestions(query);
  container.classList.remove("is-hidden");
  container.innerHTML = suggestions.length
    ? suggestions.map(renderProductSuggestion).join("")
    : `<div class="suggestion-empty">No matching products found.</div>`;
}

function renderProductSuggestion({ product, variant }) {
  const details = getProductDisplayDetails(product, variant);
  const stockText = details.inStock ? "In stock" : "Sold out";
  return `
    <button class="product-suggestion" type="button" data-suggestion-product="${escapeHTML(product.id)}" ${variant ? `data-suggestion-variant="${escapeHTML(variant.id)}"` : ""}>
      <span class="suggestion-main">
        <strong>${escapeHTML(getProductDisplayName(product, variant))}</strong>
        <span>${escapeHTML(getProductLocationLabel(product))}</span>
      </span>
      <span class="suggestion-meta">
        <span>${CURRENCY.format(details.price)}</span>
        <span class="stock-pill ${details.inStock ? "in" : "out"}">${stockText}</span>
      </span>
    </button>
  `;
}

function clearProductSuggestions(target) {
  const container = target === "budget" ? els.budgetSuggestions : els.listSuggestions;
  container.classList.add("is-hidden");
  container.innerHTML = "";
}

function handleBudgetClick(event) {
  const button = event.target.closest("[data-action='remove-budget']");
  if (!button) return;
  state.budget = state.budget.filter((item) => item.id !== button.dataset.id);
  saveJSON(STORAGE_KEYS.budget, state.budget);
  renderBudget();
}

function handleBudgetChange(event) {
  const input = event.target.closest("[data-action='budget-qty']");
  if (!input) return;
  const row = input.closest(".budget-item");
  const item = state.budget.find((budgetItem) => budgetItem.id === row.dataset.id);
  if (!item) return;
  item.qty = Math.max(1, Number(input.value) || 1);
  saveJSON(STORAGE_KEYS.budget, state.budget);
  renderBudget();
}

function makeBudgetChecklist() {
  state.budget.forEach((budgetItem) => {
    const product = findProductById(budgetItem.productId);
    if (product) {
      const variant = findProductVariant(product, budgetItem.variantId);
      addListItem(getProductDisplayName(product, variant), product.id, variant?.id || null);
    }
  });
  setTab("list");
}

function clearBudget() {
  state.budget = [];
  saveJSON(STORAGE_KEYS.budget, state.budget);
  renderBudget();
}

function renderAdminGate() {
  els.adminLock.classList.toggle("is-hidden", state.adminUnlocked);
  els.adminPanel.classList.toggle("is-hidden", !state.adminUnlocked);
  if (!state.adminUnlocked) {
    updateAdminLoginState();
  }
  if (state.adminUnlocked) {
    renderAdminList();
    renderPromotionSettings();
    renderMapSettings();
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const remainingMs = state.adminLockoutUntil - Date.now();
  if (remainingMs > 0) {
    showAdminLoginMessage(`Access temporarily locked. Try again in ${Math.ceil(remainingMs / 1000)} seconds.`, "error");
    updateAdminLoginState();
    return;
  }

  if (!state.firebase?.signInWithEmailAndPassword) {
    showAdminLoginMessage("Firebase is still connecting. Try again in a moment.", "error");
    return;
  }

  const email = els.adminEmail.value.trim();
  const password = els.adminPassword.value;
  if (!email || !password) {
    showAdminLoginMessage("Enter the admin email and password.", "error");
    return;
  }

  try {
    await state.firebase.signInWithEmailAndPassword(email, password);
    state.adminUnlocked = true;
    state.adminFailedAttempts = 0;
    state.adminLockoutUntil = 0;
    els.adminEmail.value = "";
    els.adminPassword.value = "";
    showAdminLoginMessage("", "");
    renderAdminGate();
  } catch (error) {
    console.error("Firebase authentication error:", error);
    state.adminFailedAttempts += 1;
    els.adminPassword.value = "";
    const firebaseMessage = getFirebaseErrorMessage(error);
    const attemptsLeft = ADMIN_CONFIG.maxFailedAttempts - state.adminFailedAttempts;
    if (attemptsLeft <= 0) {
      state.adminFailedAttempts = 0;
      state.adminLockoutUntil = Date.now() + ADMIN_CONFIG.lockoutMs;
      showAdminLoginMessage(`${firebaseMessage} Access temporarily locked. Try again in ${Math.ceil(ADMIN_CONFIG.lockoutMs / 1000)} seconds.`, "error");
      updateAdminLoginState();
      return;
    }
    showAdminLoginMessage(firebaseMessage, "error");
  }
}

async function lockAdmin() {
  state.adminUnlocked = false;
  await state.firebase?.signOut?.();
  renderAdminGate();
}

function updateAdminLoginState() {
  const locked = state.adminLockoutUntil > Date.now();
  if (els.adminEmail) els.adminEmail.disabled = locked;
  els.adminPassword.disabled = locked;
  const submit = els.adminLogin.querySelector("button[type='submit']");
  if (submit) submit.disabled = locked;
  if (!locked) return;

  window.setTimeout(() => {
    if (state.adminUnlocked) return;
    if (state.adminLockoutUntil > Date.now()) {
      updateAdminLoginState();
      return;
    }
    showAdminLoginMessage("You can try again now.", "success");
    if (els.adminEmail) els.adminEmail.disabled = false;
    els.adminPassword.disabled = false;
    if (submit) submit.disabled = false;
  }, Math.min(state.adminLockoutUntil - Date.now(), 1000));
}

function showAdminLoginMessage(message, type) {
  showAdminMessage(els.adminLoginMessage, message, type);
}

function getFirebaseErrorMessage(error) {
  return error?.message || error?.code || String(error || "Firebase authentication failed.");
}

function showAdminMessage(node, message, type) {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("is-hidden", !message);
  node.classList.toggle("is-error", type === "error");
  node.classList.toggle("is-success", type === "success");
}

function renderAdminList() {
  const query = normalize(els.adminSearch.value);
  let products = state.products.slice();

  if (query) {
    products = products
      .map((product) => ({ product, score: searchScore(product, query) }))
      .filter((entry) => entry.score !== null)
      .sort((a, b) => a.score - b.score || a.product.name.localeCompare(b.product.name))
      .map((entry) => entry.product);
  } else {
    products.sort((a, b) => getProductLocationOrder(a) - getProductLocationOrder(b) || a.name.localeCompare(b.name));
  }

  els.adminCount.textContent = `${products.length} items`;
  els.adminProductList.innerHTML = products.slice(0, 80).map(renderAdminRow).join("");
}

function renderAdminRow(product) {
  const selected = state.editingProductId === product.id;
  const variantCount = getProductVariants(product).length;
  return `
    <article class="admin-row ${selected ? "is-selected" : ""}" data-id="${escapeHTML(product.id)}">
      <div class="admin-row-main">
        <span class="admin-row-title">${escapeHTML(product.name)}</span>
        <span class="item-meta">${escapeHTML(getProductLocationLabel(product))} | ${CURRENCY.format(product.price)} | ${product.inStock ? "In stock" : "Sold out"}${variantCount ? ` | ${variantCount} ${variantCount === 1 ? "variant" : "variants"}` : ""}</span>
      </div>
      <button class="mini-button" type="button" data-action="edit-admin" data-id="${escapeHTML(product.id)}">${selected ? "Editing" : "Edit"}</button>
    </article>
    ${selected ? renderInlineAdminEditor(product) : ""}
  `;
}

function renderInlineAdminEditor(product) {
  return `
    <article class="admin-inline-editor" data-editor-for="${escapeHTML(product.id)}">
      <form class="admin-form" data-inline-edit="${escapeHTML(product.id)}">
        <label>Name</label>
        <input name="name" type="text" value="${escapeHTML(product.name)}">

        <div class="inline-fields">
          <div class="form-pair">
            <label>Price</label>
            <input name="price" type="number" min="0" value="${escapeHTML(product.price)}">
          </div>
          <div class="form-pair">
            <label>Availability</label>
            <select name="stock">
              <option value="true" ${product.inStock ? "selected" : ""}>In stock</option>
              <option value="false" ${!product.inStock ? "selected" : ""}>Sold out</option>
            </select>
          </div>
        </div>

        <label>Location</label>
        <select name="location">${renderLocationSelectOptions(getProductLocationKey(product))}</select>

        <label>Category</label>
        <input name="category" type="text" value="${escapeHTML(product.category)}">

        <label>Product Image</label>
        <input name="image" type="text" value="${escapeHTML(product.image || "")}" placeholder="assets/products/product-name.jpg" data-inline-image>
        <input type="file" accept="image/*" aria-label="Upload product image" data-inline-image-upload>
        ${renderImagePreview(product.image)}

        <section class="variant-editor">
          <div class="variant-editor-heading">
            <div>
              <strong>Product Variants</strong>
              <span class="item-meta">Add flavors or versions with their own price, image, and stock.</span>
            </div>
            <button class="mini-button" type="button" data-action="add-variant">Add Variant</button>
          </div>
          <div class="variant-editor-list" data-variant-list>
            ${getProductVariants(product).map(renderVariantEditorRow).join("") || `<div class="empty-state compact">No variants added.</div>`}
          </div>
        </section>

        <div class="admin-inline-actions">
          <button class="primary-button" type="submit">Save Changes</button>
          <button class="ghost-button" type="button" data-action="cancel-admin-edit">Cancel</button>
          <button class="danger-button remove-product-button" type="button" data-action="remove-admin-product" data-id="${escapeHTML(product.id)}">Remove Product</button>
        </div>
      </form>
    </article>
  `;
}

function renderVariantEditorRow(variant = {}) {
  return `
    <article class="variant-editor-row" data-variant-row data-variant-id="${escapeHTML(variant.id || createId("variant"))}">
      <div class="inline-fields">
        <div class="form-pair">
          <label>Variant name/flavor</label>
          <input type="text" value="${escapeHTML(variant.name || "")}" placeholder="Original" data-variant-name>
        </div>
        <div class="form-pair">
          <label>Price</label>
          <input type="number" min="0" value="${escapeHTML(variant.price ?? "")}" placeholder="Price" data-variant-price>
        </div>
      </div>
      <div class="inline-fields">
        <div class="form-pair">
          <label>Stock status</label>
          <select data-variant-stock>
            <option value="true" ${variant.inStock !== false ? "selected" : ""}>In stock</option>
            <option value="false" ${variant.inStock === false ? "selected" : ""}>Sold out</option>
          </select>
        </div>
        <div class="form-pair">
          <label>Image URL</label>
          <input type="text" value="${escapeHTML(variant.image || "")}" placeholder="assets/products/product-variant.jpg" data-inline-variant-image>
          <input type="file" accept="image/*" aria-label="Upload variant image" data-inline-variant-image-upload>
        </div>
      </div>
      ${renderImagePreview(variant.image).replace("data-inline-image-preview", "data-variant-image-preview")}
      <button class="mini-button danger-mini-button" type="button" data-action="remove-variant">Delete Variant</button>
    </article>
  `;
}

function handleAdminListClick(event) {
  const addVariant = event.target.closest("[data-action='add-variant']");
  if (addVariant) {
    const form = addVariant.closest("[data-inline-edit]");
    const list = form?.querySelector("[data-variant-list]");
    if (!list) return;
    list.querySelector(".empty-state")?.remove();
    list.insertAdjacentHTML("beforeend", renderVariantEditorRow());
    return;
  }

  const removeVariant = event.target.closest("[data-action='remove-variant']");
  if (removeVariant) {
    const list = removeVariant.closest("[data-variant-list]");
    removeVariant.closest("[data-variant-row]")?.remove();
    if (list && !list.querySelector("[data-variant-row]")) {
      list.innerHTML = `<div class="empty-state compact">No variants added.</div>`;
    }
    return;
  }

  const cancel = event.target.closest("[data-action='cancel-admin-edit']");
  if (cancel) {
    state.editingProductId = null;
    renderAdminList();
    return;
  }

  const removeProduct = event.target.closest("[data-action='remove-admin-product']");
  if (removeProduct) {
    removeAdminProduct(removeProduct.dataset.id);
    return;
  }

  const button = event.target.closest("[data-action='edit-admin']");
  if (!button) return;
  state.editingProductId = button.dataset.id;
  renderAdminList();
}

async function saveInlineAdminProduct(event) {
  const form = event.target.closest("[data-inline-edit]");
  if (!form) return;
  event.preventDefault();
  const product = findProductById(form.dataset.inlineEdit);
  if (!product) return;

  const draft = {
    ...product,
    name: form.elements.name.value.trim() || product.name,
    price: Math.max(0, Number(form.elements.price.value) || 0),
    category: form.elements.category.value.trim() || product.category,
    image: normalizeProductImagePath(form.elements.image.value),
    inStock: form.elements.stock.value === "true"
  };
  setProductLocation(draft, form.elements.location.value);
  draft.variants = collectVariantRows(form, draft);
  draft.id = draft.id || slugify(draft.name);

  try {
    setAdminStatus("Saving");
    const savedProduct = await prepareProductForRemote(draft);
    if (state.firebaseReady) {
      await persistProduct(savedProduct);
      Object.assign(product, savedProduct);
    } else {
      Object.assign(product, savedProduct);
      await persistProduct(product);
    }
    state.editingProductId = null;
    renderAfterInventoryChange("Saved");
  } catch (error) {
    console.error(error);
    setAdminStatus(error.message || "Save failed");
  }
}

async function removeAdminProduct(productId) {
  const product = findProductById(productId);
  if (!product) return;
  const confirmed = window.confirm("Are you sure you want to remove this product? This cannot be undone.");
  if (!confirmed) return;

  try {
    setAdminStatus("Removing");
    await deleteRemoteProduct(product.id);
  } catch (error) {
    console.error(error);
    setAdminStatus("Remove failed");
    return;
  }

  state.products = state.products.filter((item) => item.id !== product.id);
  if (!state.firebaseReady && DEFAULT_PRODUCT_IDS.has(product.id) && !state.deletedProductIds.includes(product.id)) {
    state.deletedProductIds.push(product.id);
  }
  state.groceryList = state.groceryList.filter((item) => item.productId !== product.id);
  state.budget = state.budget.filter((item) => item.productId !== product.id);
  delete state.selectedVariants[product.id];

  if (state.activeProductId === product.id) state.activeProductId = null;
  if (state.mapProductId === product.id) state.mapProductId = null;
  state.editingProductId = null;

  persistProducts();
  if (!state.firebaseReady) saveJSON(STORAGE_KEYS.deletedProducts, state.deletedProductIds);
  persistGroceryList();
  saveJSON(STORAGE_KEYS.budget, state.budget);
  renderAfterInventoryChange("Removed");
}

function handleInlineAdminInput(event) {
  const variantImage = event.target.closest("[data-inline-variant-image]");
  if (variantImage) {
    const row = variantImage.closest("[data-variant-row]");
    updateImagePreview(row.querySelector("[data-variant-image-preview]"), variantImage.value);
    return;
  }

  const input = event.target.closest("[data-inline-image]");
  if (!input) return;
  const form = input.closest("[data-inline-edit]");
  updateImagePreview(form.querySelector("[data-inline-image-preview]"), input.value);
}

function handleInlineAdminChange(event) {
  const upload = event.target.closest("[data-inline-image-upload]");
  if (upload) {
    const form = upload.closest("[data-inline-edit]");
    handleImageUpload(upload, form.elements.image, form.querySelector("[data-inline-image-preview]"));
    return;
  }

  const variantUpload = event.target.closest("[data-inline-variant-image-upload]");
  if (!variantUpload) return;
  const row = variantUpload.closest("[data-variant-row]");
  handleImageUpload(
    variantUpload,
    row.querySelector("[data-inline-variant-image]"),
    row.querySelector("[data-variant-image-preview]")
  );
}

function handleInlineImagePaste(event) {
  const form = event.target.closest("[data-inline-edit]");
  if (!form) return;
  const variantImage = event.target.closest("[data-inline-variant-image]");
  if (variantImage) {
    const row = variantImage.closest("[data-variant-row]");
    handleImagePaste(
      event,
      variantImage,
      row.querySelector("[data-variant-image-preview]"),
      row.querySelector("[data-inline-variant-image-upload]")
    );
    return;
  }

  const isImageField = event.target.closest("[data-inline-image]");
  if (!isImageField) return;
  handleImagePaste(
    event,
    form.elements.image,
    form.querySelector("[data-inline-image-preview]"),
    form.querySelector("[data-inline-image-upload]")
  );
}

function collectVariantRows(form, product) {
  const usedIds = new Set();
  return [...form.querySelectorAll("[data-variant-row]")]
    .map((row) => {
      const name = row.querySelector("[data-variant-name]")?.value.trim() || "";
      if (!name) return null;
      const id = uniqueVariantId(row.dataset.variantId || slugify(name), usedIds);
      const priceValue = row.querySelector("[data-variant-price]")?.value;
      const price = priceValue === "" ? product.price : Math.max(0, Number(priceValue));
      return {
        id,
        name,
        price: Number.isFinite(price) ? price : product.price,
        image: normalizeProductImagePath(row.querySelector("[data-inline-variant-image]")?.value || ""),
        inStock: row.querySelector("[data-variant-stock]")?.value !== "false"
      };
    })
    .filter(Boolean);
}

async function addAdminProduct(event) {
  event.preventDefault();
  const name = els.newName.value.trim();
  if (!name) return;
  const id = uniqueProductId(slugify(name));
  const draft = {
    id,
    name,
    price: Math.max(0, Number(els.newPrice.value) || 0),
    ...createLocationFields(els.newLocation.value || "aisle-1"),
    category: els.newCategory.value.trim() || "General",
    image: normalizeProductImagePath(els.newImage.value),
    inStock: true
  };

  try {
    setAdminStatus("Saving");
    const product = await prepareProductForRemote(draft);
    if (state.firebaseReady) {
      await persistProduct(product);
      state.products.push(product);
    } else {
      state.products.push(product);
      await persistProduct(product);
    }
  } catch (error) {
    console.error(error);
    setAdminStatus(error.message || "Add failed");
    return;
  }

  els.newName.value = "";
  els.newPrice.value = "";
  els.newLocation.value = "aisle-1";
  els.newCategory.value = "";
  els.newImage.value = "";
  els.newImageUpload.value = "";
  updateImagePreview(els.newImagePreview, "");
  state.editingProductId = null;
  renderAfterInventoryChange("Added");
}

async function saveMapSection(event) {
  event.preventDefault();
  const name = els.mapSectionName.value.trim();
  const type = els.mapSectionType.value;
  const label = els.mapSectionLabel.value.trim() || name;
  const categories = parseCategoryList(els.mapSectionCategories.value);

  if (!name) {
    showAdminMessage(els.mapSectionMessage, "Enter a section name before saving.", "error");
    return;
  }

  const section = createMapSection({
    name,
    type,
    label,
    categories
  });

  try {
    setAdminStatus("Saving map");
    await persistMapSection(section);
    if (state.firebaseReady) state.mapSections.push(section);
  } catch (error) {
    console.error(error);
    showAdminMessage(els.mapSectionMessage, "Map section could not be saved.", "error");
    return;
  }
  els.mapSectionName.value = "";
  els.mapSectionLabel.value = "";
  els.mapSectionCategories.value = "";
  showAdminMessage(els.mapSectionMessage, "Map section saved.", "success");
  renderAfterMapSettingsChange("Saved");
}

function renderMapSettings() {
  if (!els.mapEditorCanvas) return;
  if (!state.mapEditorSelectedId || !getLocationZone(state.mapEditorSelectedId)) {
    state.mapEditorSelectedId = state.mapSections[0]?.key || null;
  }
  renderMapEditorCanvas();
  renderMapEditorInspector();
  if (els.mapSectionStatus) els.mapSectionStatus.textContent = `${state.mapSections.length} sections`;
}

function renderMapEditorCanvas() {
  if (!els.mapEditorCanvas) return;
  els.mapEditorCanvas.innerHTML = getLocationZones().map(renderMapEditorSection).join("");
}

function renderMapEditorSection(section) {
  const selected = state.mapEditorSelectedId === section.key;
  return `
    <button
      class="map-zone map-editor-section ${selected ? "is-selected" : ""}"
      type="button"
      data-editor-section="${escapeHTML(section.key)}"
      data-zone-type="${escapeHTML(getZoneType(section.key))}"
      data-has-color="${section.color ? "true" : "false"}"
      style="${getMapSectionInlineStyle(section)}"
      aria-label="Edit ${escapeHTML(section.name)}"
    >
      <span class="map-zone-label">${renderLocationShortLabel(section.key, section.label)}</span>
      <span class="map-editor-resize" data-editor-resize aria-hidden="true"></span>
    </button>
  `;
}

function renderMapEditorInspector() {
  const section = getSelectedMapEditorSection();
  if (els.mapEditorSectionCount) els.mapEditorSectionCount.textContent = `${state.mapSections.length} sections`;
  renderMapEditorProductOptions(section);
  const disabled = !section;
  [
    els.mapEditorName,
    els.mapEditorType,
    els.mapEditorLabel,
    els.mapEditorColor,
    els.mapEditorX,
    els.mapEditorY,
    els.mapEditorWidth,
    els.mapEditorHeight,
    els.mapEditorRotation,
    els.mapEditorCategories,
    els.mapEditorProducts
  ].filter(Boolean).forEach((field) => {
    field.disabled = disabled;
  });

  if (!section) {
    if (els.mapEditorName) els.mapEditorName.value = "";
    if (els.mapEditorLabel) els.mapEditorLabel.value = "";
    if (els.mapEditorType) els.mapEditorType.value = "aisle";
    if (els.mapEditorColor) els.mapEditorColor.value = "#ffffff";
    if (els.mapEditorCategories) els.mapEditorCategories.value = "";
    if (els.mapEditorDimensions) els.mapEditorDimensions.textContent = "Select a section to edit it.";
    return;
  }

  els.mapEditorName.value = section.name;
  els.mapEditorType.value = section.type;
  els.mapEditorLabel.value = section.label;
  els.mapEditorColor.value = normalizeHexColor(section.color) || "#ffffff";
  els.mapEditorX.value = formatMapNumber(section.left);
  els.mapEditorY.value = formatMapNumber(section.top);
  els.mapEditorWidth.value = formatMapNumber(section.width);
  els.mapEditorHeight.value = formatMapNumber(section.height);
  els.mapEditorRotation.value = Math.round(section.rotation || 0);
  els.mapEditorCategories.value = (section.categories || []).join("\n");
  updateMapEditorDimensionText(section);
}

function renderMapEditorProductOptions(section) {
  if (!els.mapEditorProducts) return;
  const assigned = new Set(section?.assignedProducts || []);
  els.mapEditorProducts.innerHTML = state.products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((product) => `<option value="${escapeHTML(product.id)}" ${assigned.has(product.id) ? "selected" : ""}>${escapeHTML(product.name)}</option>`)
    .join("");
}

function getSelectedMapEditorSection() {
  return getLocationZone(state.mapEditorSelectedId);
}

async function addMapEditorSection() {
  const index = state.mapSections.length;
  const key = uniqueMapSectionKey(`aisle-${index + 1}`);
  const section = normalizeMapSection({
    id: key,
    key,
    name: `New Section ${index + 1}`,
    type: "aisle",
    label: `S${index + 1}`,
    shortLabel: `S${index + 1}`,
    left: 44,
    top: 44,
    width: 8,
    height: 9,
    rotation: 0,
    color: "",
    categories: [],
    assignedProducts: [],
    order: getNextMapSectionOrder()
  }, index);
  upsertMapSection(section);
  state.mapEditorSelectedId = section.key;
  try {
    await replaceRemoteMapSections(state.mapSections);
    renderAfterMapSettingsChange("Section added");
  } catch (error) {
    console.error(error);
    setAdminStatus("Map save failed");
  }
}

async function duplicateSelectedMapSection() {
  const selected = getSelectedMapEditorSection();
  if (!selected) return;
  const key = uniqueMapSectionKey(`${selected.type}-${slugify(selected.name)}-copy`);
  const duplicate = normalizeMapSection({
    ...structuredCloneSafe(selected),
    id: key,
    key,
    name: `${selected.name} Copy`,
    label: `${selected.label} Copy`.slice(0, 24),
    shortLabel: `${selected.shortLabel || selected.label} Copy`.slice(0, 24),
    left: clamp(selected.left + 2, 0, 99),
    top: clamp(selected.top + 2, 0, 99),
    order: getNextMapSectionOrder()
  }, state.mapSections.length);
  upsertMapSection(duplicate);
  state.mapEditorSelectedId = duplicate.key;
  try {
    await replaceRemoteMapSections(state.mapSections);
    renderAfterMapSettingsChange("Section duplicated");
  } catch (error) {
    console.error(error);
    setAdminStatus("Map save failed");
  }
}

async function deleteSelectedMapSection() {
  const selected = getSelectedMapEditorSection();
  if (!selected) return;
  const confirmed = window.confirm(`Delete ${selected.name}? This cannot be undone.`);
  if (!confirmed) return;
  state.mapSections = state.mapSections.filter((section) => section.key !== selected.key);
  state.mapEditorSelectedId = state.mapSections[0]?.key || null;
  try {
    await replaceRemoteMapSections(state.mapSections);
    renderAfterMapSettingsChange("Section deleted");
  } catch (error) {
    console.error(error);
    setAdminStatus("Map save failed");
  }
}

function getNextMapSectionOrder() {
  return state.mapSections.reduce((max, section) => Math.max(max, Number(section.order) || 0), 0) + 1;
}

function handleMapEditorPointerDown(event) {
  const sectionButton = event.target.closest("[data-editor-section]");
  if (!sectionButton || !els.mapEditorCanvas) return;
  event.preventDefault();
  const section = getLocationZone(sectionButton.dataset.editorSection);
  if (!section) return;
  state.mapEditorSelectedId = section.key;
  renderMapEditorInspector();
  els.mapEditorCanvas.querySelectorAll(".map-editor-section").forEach((node) => {
    node.classList.toggle("is-selected", node.dataset.editorSection === section.key);
  });
  sectionButton.setPointerCapture?.(event.pointerId);
  state.mapEditorDrag = {
    key: section.key,
    mode: event.target.closest("[data-editor-resize]") ? "resize" : "move",
    startX: event.clientX,
    startY: event.clientY,
    bounds: els.mapEditorCanvas.getBoundingClientRect(),
    original: structuredCloneSafe(section)
  };
  document.addEventListener("pointermove", handleMapEditorPointerMove);
  document.addEventListener("pointerup", handleMapEditorPointerUp, { once: true });
}

function handleMapEditorPointerMove(event) {
  const drag = state.mapEditorDrag;
  if (!drag) return;
  const section = getLocationZone(drag.key);
  if (!section || !drag.bounds.width || !drag.bounds.height) return;
  const dx = ((event.clientX - drag.startX) / drag.bounds.width) * 100;
  const dy = ((event.clientY - drag.startY) / drag.bounds.height) * 100;

  if (drag.mode === "resize") {
    section.width = normalizeMapEditorValue(drag.original.width + dx, 1, 100);
    section.height = normalizeMapEditorValue(drag.original.height + dy, 1, 100);
  } else {
    section.left = normalizeMapEditorValue(drag.original.left + dx, 0, 99);
    section.top = normalizeMapEditorValue(drag.original.top + dy, 0, 99);
  }

  upsertMapSection(section);
  applyMapEditorSectionDom(section);
  updateMapEditorInspectorValues(section);
  updateMapEditorDimensionText(section);
  renderMapZones();
}

function handleMapEditorPointerUp() {
  document.removeEventListener("pointermove", handleMapEditorPointerMove);
  const section = state.mapEditorDrag ? getLocationZone(state.mapEditorDrag.key) : null;
  state.mapEditorDrag = null;
  if (section) scheduleMapEditorSave(section);
}

function handleMapEditorInspectorInput(event) {
  const section = getSelectedMapEditorSection();
  if (!section || !event.target.closest("#mapEditorInspector")) return;

  section.name = els.mapEditorName.value.trim() || section.name;
  section.type = normalizeSectionType(els.mapEditorType.value);
  section.label = els.mapEditorLabel.value.trim() || section.name;
  section.shortLabel = section.label;
  const pickedColor = normalizeHexColor(els.mapEditorColor.value);
  section.color = pickedColor === "#ffffff" && !section.color ? "" : pickedColor;
  section.left = normalizeMapEditorValue(Number(els.mapEditorX.value), 0, 99);
  section.top = normalizeMapEditorValue(Number(els.mapEditorY.value), 0, 99);
  section.width = normalizeMapEditorValue(Number(els.mapEditorWidth.value), 1, 100);
  section.height = normalizeMapEditorValue(Number(els.mapEditorHeight.value), 1, 100);
  section.rotation = clamp(Number(els.mapEditorRotation.value) || 0, -180, 180);
  section.categories = parseCategoryList(els.mapEditorCategories.value);
  section.assignedProducts = [...(els.mapEditorProducts.selectedOptions || [])].map((option) => option.value);

  upsertMapSection(section);
  applyMapEditorSectionDom(section);
  updateMapEditorDimensionText(section);
  renderMapZones();
  renderLocationOptions();
  renderNavigation();
  scheduleMapEditorSave(section);
}

function normalizeMapEditorValue(value, min, max) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : min;
  const snapped = state.mapEditorSnapToGrid ? Math.round(numericValue / MAP_EDITOR_GRID_SIZE) * MAP_EDITOR_GRID_SIZE : numericValue;
  return Number(clamp(snapped, min, max).toFixed(1));
}

function applyMapEditorSectionDom(section) {
  const node = els.mapEditorCanvas?.querySelector(`[data-editor-section="${escapeCSSSelector(section.key)}"]`);
  if (!node) return;
  node.dataset.zoneType = getZoneType(section.key);
  node.dataset.hasColor = section.color ? "true" : "false";
  node.setAttribute("style", getMapSectionInlineStyle(section));
  const label = node.querySelector(".map-zone-label");
  if (label) label.innerHTML = renderLocationShortLabel(section.key, section.label);
}

function updateMapEditorInspectorValues(section) {
  if (!section) return;
  els.mapEditorX.value = formatMapNumber(section.left);
  els.mapEditorY.value = formatMapNumber(section.top);
  els.mapEditorWidth.value = formatMapNumber(section.width);
  els.mapEditorHeight.value = formatMapNumber(section.height);
  els.mapEditorRotation.value = Math.round(section.rotation || 0);
}

function updateMapEditorDimensionText(section) {
  if (!els.mapEditorDimensions) return;
  els.mapEditorDimensions.textContent = `X ${formatMapNumber(section.left)}% | Y ${formatMapNumber(section.top)}% | W ${formatMapNumber(section.width)}% | H ${formatMapNumber(section.height)}% | ${Math.round(section.rotation || 0)} deg`;
}

function scheduleMapEditorSave(section) {
  window.clearTimeout(state.mapEditorSaveTimer);
  if (els.mapSectionStatus) els.mapSectionStatus.textContent = "Saving map";
  state.mapEditorSaveTimer = window.setTimeout(async () => {
    try {
      await persistMapSection(section);
      renderLocationOptions();
      renderNavigation();
      if (els.mapSectionStatus) els.mapSectionStatus.textContent = "Map saved";
      window.setTimeout(() => {
        if (els.mapSectionStatus) els.mapSectionStatus.textContent = `${state.mapSections.length} sections`;
      }, 1400);
    } catch (error) {
      console.error(error);
      if (els.mapSectionStatus) els.mapSectionStatus.textContent = "Map save failed";
    }
  }, MAP_EDITOR_SAVE_DELAY);
}

function renderAfterMapSettingsChange(statusText) {
  renderMapZones();
  renderLocationOptions();
  renderMapSettings();
  renderNavigation();
  renderAdminList();
  els.mapSectionStatus.textContent = statusText;
  window.setTimeout(renderMapSettings, 1600);
}

function exportMapBackup() {
  const payload = {
    app: "Haul Mart",
    type: "map-layout-backup",
    exportedAt: new Date().toISOString(),
    sectionCount: state.mapSections.length,
    sections: state.mapSections.map(serializeMapSection)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `haul-mart-map-backup-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setAdminStatus("Map exported");
}

async function importMapBackup() {
  const file = els.importMapJsonFile?.files?.[0];
  if (!file) return;

  try {
    const backup = JSON.parse(await readFileAsText(file));
    const sections = normalizeImportedMapBackup(backup);
    if (!sections.length) {
      setAdminStatus("Map import failed");
      showAdminMessage(els.mapSectionMessage, "No map sections found in that file.", "error");
      return;
    }
    await replaceRemoteMapSections(sections);
    state.mapSections = sortMapSections(sections);
    state.mapEditorSelectedId = state.mapSections[0]?.key || null;
    showAdminMessage(els.mapSectionMessage, "Map imported.", "success");
    renderAfterMapSettingsChange("Map imported");
  } catch (error) {
    console.error(error);
    setAdminStatus("Map import failed");
    showAdminMessage(els.mapSectionMessage, "Map JSON could not be imported.", "error");
  } finally {
    if (els.importMapJsonFile) els.importMapJsonFile.value = "";
  }
}

function normalizeImportedMapBackup(backup) {
  const rawSections = Array.isArray(backup) ? backup : backup?.sections;
  if (!Array.isArray(rawSections)) return [];
  const usedIds = new Set();
  return rawSections
    .map((section, index) => {
      const baseId = slugify(section?.id || section?.key || section?.name || `section-${index + 1}`);
      const id = uniqueImportedMapSectionId(baseId, usedIds);
      return normalizeMapSection({
        ...section,
        id,
        key: id
      }, index);
    })
    .filter(Boolean);
}

function uniqueImportedMapSectionId(base, usedIds) {
  let id = base || "section";
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(id);
  return id;
}

async function resetMapLayout() {
  const confirmed = window.confirm("Reset the store map to the default layout? Current map edits will be replaced.");
  if (!confirmed) return;
  const defaults = getDefaultMapSections();
  try {
    await replaceRemoteMapSections(defaults);
    state.mapSections = defaults;
    state.mapEditorSelectedId = state.mapSections[0]?.key || null;
    showAdminMessage(els.mapSectionMessage, "Default map restored.", "success");
    renderAfterMapSettingsChange("Default map restored");
  } catch (error) {
    console.error(error);
    setAdminStatus("Map reset failed");
    showAdminMessage(els.mapSectionMessage, "Default map could not be restored.", "error");
  }
}

async function savePromotion(event) {
  event.preventDefault();
  const promotion = collectPromotionFields();
  if (!promotion.title) {
    showAdminMessage(els.promoMessage, "Enter a promotion title before saving.", "error");
    return;
  }
  if (!isValidPromotionDateRange(promotion)) {
    showAdminMessage(els.promoMessage, "End date must be after the start date.", "error");
    return;
  }

  promotion.id = uniquePromotionId(slugify(promotion.title || "promotion"));

  try {
    setAdminStatus("Saving promotion");
    const savedPromotion = preparePromotionForRemote(promotion);
    await persistPromotion(savedPromotion);
    upsertPromotion(savedPromotion);
  } catch (error) {
    console.error(error);
    showAdminMessage(els.promoMessage, error.message || "Promotion could not be saved.", "error");
    setAdminStatus("Promotion save failed");
    return;
  }

  clearPromotionForm();
  showAdminMessage(els.promoMessage, "Promotion saved.", "success");
  renderAfterPromotionChange("Promotion saved");
}

function collectPromotionFields(form = null, fallback = {}) {
  const value = (name, fallbackValue = "") => {
    if (!form) return fallbackValue;
    return form.elements[name]?.value ?? fallbackValue;
  };
  const checked = (name, fallbackValue = true) => {
    if (!form) return fallbackValue;
    return Boolean(form.elements[name]?.checked);
  };

  return normalizePromotion({
    id: fallback.id,
    title: form ? value("title", fallback.title) : els.promoTitle?.value,
    description: form ? value("description", fallback.description) : els.promoDescription?.value,
    promoText: form ? value("promoText", fallback.promoText) : els.promoText?.value,
    image: form ? value("image", fallback.image) : els.promoImage?.value,
    buttonText: form ? value("buttonText", fallback.buttonText) : els.promoButtonText?.value,
    link: form ? value("link", fallback.link) : els.promoLink?.value,
    startDate: form ? value("startDate", fallback.startDate) : els.promoStartDate?.value,
    endDate: form ? value("endDate", fallback.endDate) : els.promoEndDate?.value,
    active: form ? checked("active", fallback.active !== false) : els.promoActive?.checked !== false
  });
}

function clearPromotionForm() {
  if (!els.promotionForm) return;
  els.promotionForm.reset();
  if (els.promoActive) els.promoActive.checked = true;
  if (els.promoImageUpload) els.promoImageUpload.value = "";
  updateImagePreview(els.promoImagePreview, "");
}

function renderPromotionSettings() {
  if (!els.promotionList) return;
  const promotions = state.promotions
    .slice()
    .sort((a, b) => getPromotionSortValue(a) - getPromotionSortValue(b) || a.title.localeCompare(b.title));
  const activeCount = promotions.filter(isPromotionVisible).length;
  if (els.promoStatus) {
    els.promoStatus.textContent = `${activeCount} active`;
  }
  els.promotionList.innerHTML = promotions.length
    ? promotions.map(renderPromotionAdminCard).join("")
    : `<div class="empty-state compact">No promotions saved yet.</div>`;
}

function renderPromotionAdminCard(promotion) {
  const selected = state.editingPromotionId === promotion.id;
  const statusText = getPromotionAdminStatus(promotion);
  return `
    <article class="promotion-admin-card ${selected ? "is-selected" : ""}" data-promotion-id="${escapeHTML(promotion.id)}">
      <div class="promotion-admin-summary">
        <div>
          <strong>${escapeHTML(promotion.title)}</strong>
          <span class="item-meta">${escapeHTML(statusText)}${promotion.promoText ? ` | ${escapeHTML(promotion.promoText)}` : ""}</span>
        </div>
        <button class="mini-button" type="button" data-action="edit-promotion" data-id="${escapeHTML(promotion.id)}">${selected ? "Editing" : "Edit"}</button>
      </div>
      ${selected ? renderPromotionInlineEditor(promotion) : ""}
    </article>
  `;
}

function renderPromotionInlineEditor(promotion) {
  return `
    <form class="admin-form promotion-edit-form" data-promotion-edit="${escapeHTML(promotion.id)}">
      <label>Title</label>
      <input name="title" type="text" value="${escapeHTML(promotion.title)}">

      <label>Short description</label>
      <textarea name="description" rows="2">${escapeHTML(promotion.description)}</textarea>

      <label>Sale price or promo text</label>
      <input name="promoText" type="text" value="${escapeHTML(promotion.promoText)}">

      <label>Promotion image</label>
      <input name="image" type="text" value="${escapeHTML(promotion.image || "")}" placeholder="Paste image URL or image here" data-promo-inline-image>
      <input type="file" accept="image/*" aria-label="Upload promotion image" data-promo-inline-image-upload>
      ${renderImagePreview(promotion.image).replace("data-inline-image-preview", "data-promo-image-preview")}

      <div class="inline-fields">
        <div class="form-pair">
          <label>Button text</label>
          <input name="buttonText" type="text" value="${escapeHTML(promotion.buttonText)}">
        </div>
        <div class="form-pair">
          <label>Link or action</label>
          <input name="link" type="text" value="${escapeHTML(promotion.link)}">
        </div>
      </div>

      <div class="inline-fields">
        <div class="form-pair">
          <label>Start date</label>
          <input name="startDate" type="date" value="${escapeHTML(promotion.startDate)}">
        </div>
        <div class="form-pair">
          <label>End date</label>
          <input name="endDate" type="date" value="${escapeHTML(promotion.endDate)}">
        </div>
      </div>

      <label class="checkbox-row">
        <input name="active" type="checkbox" ${promotion.active ? "checked" : ""}>
        <span>Active promotion</span>
      </label>

      <div class="admin-inline-actions">
        <button class="primary-button" type="submit">Save Changes</button>
        <button class="ghost-button" type="button" data-action="cancel-promotion-edit">Cancel</button>
        <button class="danger-button remove-product-button" type="button" data-action="delete-promotion" data-id="${escapeHTML(promotion.id)}">Delete Promotion</button>
      </div>
    </form>
  `;
}

function handlePromotionListClick(event) {
  const edit = event.target.closest("[data-action='edit-promotion']");
  if (edit) {
    state.editingPromotionId = edit.dataset.id;
    renderPromotionSettings();
    return;
  }

  if (event.target.closest("[data-action='cancel-promotion-edit']")) {
    state.editingPromotionId = null;
    renderPromotionSettings();
    return;
  }

  const deleteButton = event.target.closest("[data-action='delete-promotion']");
  if (!deleteButton) return;
  removePromotion(deleteButton.dataset.id);
}

async function saveInlinePromotion(event) {
  const form = event.target.closest("[data-promotion-edit]");
  if (!form) return;
  event.preventDefault();
  const promotion = findPromotionById(form.dataset.promotionEdit);
  if (!promotion) return;
  const draft = collectPromotionFields(form, promotion);
  if (!draft.title) {
    setAdminStatus("Promotion needs a title");
    return;
  }
  if (!isValidPromotionDateRange(draft)) {
    setAdminStatus("Check promotion dates");
    return;
  }

  try {
    setAdminStatus("Saving promotion");
    const savedPromotion = preparePromotionForRemote(draft);
    await persistPromotion(savedPromotion);
    upsertPromotion(savedPromotion);
    state.editingPromotionId = null;
    renderAfterPromotionChange("Promotion saved");
  } catch (error) {
    console.error(error);
    setAdminStatus(error.message || "Promotion save failed");
  }
}

function handlePromotionListInput(event) {
  const imageInput = event.target.closest("[data-promo-inline-image]");
  if (!imageInput) return;
  const form = imageInput.closest("[data-promotion-edit]");
  updateImagePreview(form.querySelector("[data-promo-image-preview]"), imageInput.value);
}

function handlePromotionListChange(event) {
  const upload = event.target.closest("[data-promo-inline-image-upload]");
  if (!upload) return;
  const form = upload.closest("[data-promotion-edit]");
  handleImageUpload(upload, form.elements.image, form.querySelector("[data-promo-image-preview]"));
}

function handlePromotionListPaste(event) {
  const imageInput = event.target.closest("[data-promo-inline-image]");
  if (!imageInput) return;
  const form = imageInput.closest("[data-promotion-edit]");
  handleImagePaste(
    event,
    form.elements.image,
    form.querySelector("[data-promo-image-preview]"),
    form.querySelector("[data-promo-inline-image-upload]")
  );
}

async function removePromotion(promotionId) {
  const promotion = findPromotionById(promotionId);
  if (!promotion) return;
  const confirmed = window.confirm("Delete this promotion? This cannot be undone.");
  if (!confirmed) return;

  try {
    setAdminStatus("Deleting promotion");
    await deleteRemotePromotion(promotion.id);
  } catch (error) {
    console.error(error);
    setAdminStatus("Promotion delete failed");
    return;
  }

  state.promotions = state.promotions.filter((item) => item.id !== promotion.id);
  if (state.editingPromotionId === promotion.id) state.editingPromotionId = null;
  persistPromotions();
  renderAfterPromotionChange("Promotion deleted");
}

function renderAfterPromotionChange(statusText) {
  renderPromotions();
  renderPromotionSettings();
  setAdminStatus(statusText);
  window.setTimeout(() => {
    setAdminStatus(state.firebaseReady ? "Firebase synced" : "Ready");
    renderPromotionSettings();
  }, 1600);
}

async function handleImageUpload(fileInput, textInput, previewNode) {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    fileInput.value = "";
    updateImagePreview(previewNode, textInput.value);
    return;
  }
  if (file.size > ADMIN_IMAGE_MAX_SOURCE_BYTES) {
    fileInput.value = "";
    updateImagePreview(
      previewNode,
      textInput.value,
      `Image is too large. Use an image under ${formatFileSize(ADMIN_IMAGE_MAX_SOURCE_BYTES)}.`,
      "warning"
    );
    return;
  }

  await processAdminImageSource({
    source: file,
    textInput,
    previewNode,
    fileInput
  });
}

async function handleImagePaste(event, textInput, previewNode, fileInput = null) {
  if (!event.clipboardData || !textInput || !previewNode) return;

  const imageFile = getClipboardImageFile(event.clipboardData);
  if (imageFile) {
    event.preventDefault();
    if (fileInput) fileInput.value = "";
    await processAdminImageSource({
      source: imageFile,
      textInput,
      previewNode,
      fileInput
    });
    return;
  }

  const imageValue = getClipboardImageValue(event.clipboardData);
  if (!imageValue) return;
  event.preventDefault();
  if (fileInput) fileInput.value = "";
  const imageSource = normalizeProductImagePath(imageValue) || imageValue;
  await processAdminImageSource({
    source: imageSource,
    textInput,
    previewNode,
    fileInput
  });
}

function getClipboardImageFile(clipboardData) {
  const files = [...(clipboardData.files || [])];
  const file = files.find((item) => item.type?.startsWith("image/"));
  if (file) return file;

  return [...(clipboardData.items || [])]
    .filter((item) => item.kind === "file" && item.type?.startsWith("image/"))
    .map((item) => item.getAsFile())
    .find(Boolean) || null;
}

function getClipboardImageValue(clipboardData) {
  const uri = cleanPastedImageValue(clipboardData.getData("text/uri-list"));
  if (uri) return uri;

  const plainText = cleanPastedImageValue(clipboardData.getData("text/plain"));
  if (plainText) return plainText;

  const html = clipboardData.getData("text/html");
  const imageSource = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return imageSource ? decodeHTML(cleanPastedImageValue(imageSource)) : "";
}

function cleanPastedImageValue(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#")) || "";
}

function decodeHTML(value) {
  const parser = document.createElement("textarea");
  parser.innerHTML = value;
  return parser.value;
}

async function processAdminImageSource({ source, textInput, previewNode, fileInput = null }) {
  const currentImage = normalizeProductImagePath(textInput.value);
  const fallbackImage = currentImage;
  setImageProcessingState(previewNode, "Compressing image for Firestore...", "working");
  try {
    const result = await compressImageForFirestore(source);
    textInput.value = result.dataUrl;
    if (fileInput) fileInput.value = "";
    updateImagePreview(previewNode, textInput.value, `Compressed for Firestore (${formatFileSize(result.bytes)}).`, "success");
  } catch (error) {
    console.warn("Product image compression failed:", error);
    textInput.value = fallbackImage;
    updateImagePreview(
      previewNode,
      textInput.value,
      "Image could not be compressed for Firestore. Try a smaller upload or a direct image URL.",
      "warning"
    );
  }
}

async function compressImageForFirestore(source) {
  const image = await loadImageForCanvas(source);
  const { width, height } = getCompressedImageSize(image.width || image.naturalWidth, image.height || image.naturalHeight);
  if (!width || !height) throw new Error("Image could not be read.");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const encoded = encodeCompressedProductImage(canvas);
  if (encoded.bytes > ADMIN_IMAGE_MAX_FIRESTORE_BYTES) {
    throw new Error(`Compressed image is larger than ${formatFileSize(ADMIN_IMAGE_MAX_FIRESTORE_BYTES)}.`);
  }

  return {
    ...encoded,
    width,
    height
  };
}

function getCompressedImageSize(sourceWidth, sourceHeight) {
  const width = Math.max(1, Number(sourceWidth) || 0);
  const height = Math.max(1, Number(sourceHeight) || 0);
  const scale = Math.min(1, ADMIN_IMAGE_MAX_WIDTH / width);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

function encodeCompressedProductImage(canvas) {
  const webp = canvas.toDataURL("image/webp", ADMIN_IMAGE_QUALITY);
  const dataUrl = webp.startsWith("data:image/webp")
    ? webp
    : canvas.toDataURL("image/jpeg", ADMIN_IMAGE_QUALITY);
  return {
    dataUrl,
    bytes: getDataUrlByteLength(dataUrl)
  };
}

function getDataUrlByteLength(dataUrl) {
  const base64 = String(dataUrl || "").split(",")[1] || "";
  return Math.ceil((base64.replace(/=+$/, "").length * 3) / 4);
}

function formatFileSize(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.ceil(value / 1024)} KB`;
}

async function loadImageForCanvas(source) {
  if (source instanceof Blob) {
    return loadBlobImage(source);
  }

  const imageValue = String(source || "").trim();
  if (!imageValue) throw new Error("Image source is empty.");

  if (/^https?:\/\//i.test(imageValue)) {
    try {
      const response = await fetch(imageValue, { mode: "cors" });
      if (!response.ok) throw new Error("Image URL could not be loaded.");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL is not an image.");
      return loadBlobImage(blob);
    } catch {
      return loadImageElement(imageValue);
    }
  }

  return loadImageElement(getImageSource(imageValue) || imageValue);
}

async function loadBlobImage(blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImageElement(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = src;
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function normalizeProductImagePath(value) {
  let image = decodeHTML(String(value || "")).trim().replaceAll("\\", "/");
  if (!image) return "";

  if (DATA_IMAGE_PATTERN.test(image)) return image;

  if (/^https?:\/\//i.test(image)) return image;

  const assetMatch = image.match(/(?:^|\/)(assets\/products\/[^?#]+)/i);
  if (assetMatch) return cleanRelativeProductImagePath(assetMatch[1]);

  if (/^(data:|file:|blob:)/i.test(image) || /^[a-zA-Z]:\//.test(image)) {
    return "";
  }

  image = image.replace(/^\.?\//, "").replace(/^\/+/, "").split(/[?#]/)[0];
  if (!image.includes("/") && IMAGE_FILE_EXTENSION.test(image)) {
    return `${PRODUCT_IMAGE_BASE_PATH}${sanitizeProductImageFileName(image)}`;
  }

  return cleanRelativeProductImagePath(image);
}

function cleanRelativeProductImagePath(value) {
  const clean = String(value || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "")
    .split(/[?#]/)[0];
  const match = clean.match(/^assets\/products\/(.+)$/i);
  if (!match || !IMAGE_FILE_EXTENSION.test(clean)) return "";
  const filePath = match[1].split("/").map(sanitizeProductImageFileName).join("/");
  if (!filePath || filePath.split("/").some((part) => !part || part === "." || part === "..")) return "";
  return `${PRODUCT_IMAGE_BASE_PATH}${filePath}`;
}

function sanitizeProductImageFileName(fileName) {
  return String(fileName || "product-image.png")
    .trim()
    .replace(/[\\/:*?"<>|#%]+/g, "-")
    .replace(/\s+/g, " ") || "product-image.png";
}

function updateImagePreview(previewNode, imageValue, message = "", type = "") {
  if (!previewNode) return;
  const rawImage = String(imageValue || "").trim();
  const image = normalizeProductImagePath(rawImage);
  previewNode.classList.toggle("is-empty", !image);
  previewNode.innerHTML = image
    ? `${renderPreviewImage(image)}${renderImageProcessingNote(message, type)}`
    : rawImage
      ? `Use a relative path like ${PRODUCT_IMAGE_BASE_PATH}product-name.jpg${renderImageProcessingNote(message, type)}`
      : "Image preview";
}

function renderImagePreview(imageValue) {
  const image = normalizeProductImagePath(imageValue);
  return `
    <div class="image-preview ${image ? "" : "is-empty"}" data-inline-image-preview>
      ${image ? renderPreviewImage(image) : "Image preview"}
    </div>
  `;
}

function renderPreviewImage(image) {
  return `<img src="${escapeHTML(getImageSource(image))}" alt="Product image preview" onerror="replaceBrokenPreviewImage(this)">`;
}

function setImageProcessingState(previewNode, message, type = "working") {
  if (!previewNode) return;
  previewNode.classList.remove("is-empty");
  previewNode.innerHTML = renderImageProcessingNote(message, type);
}

function renderImageProcessingNote(message, type = "") {
  return message
    ? `<p class="image-processing-note ${type ? `is-${escapeHTML(type)}` : ""}">${escapeHTML(message)}</p>`
    : "";
}

function getImageSource(imageValue) {
  return normalizeProductImagePath(imageValue);
}

function createMissingImageNode() {
  const node = document.createElement("div");
  node.className = "missing-image";
  node.textContent = "Image not available";
  return node;
}

function replaceBrokenProductImage(imageNode) {
  const shot = imageNode.closest(".product-shot");
  shot?.classList.remove("has-image");
  shot?.classList.add("is-missing");
  imageNode.replaceWith(createMissingImageNode());
}

function replaceBrokenVariantThumb(imageNode) {
  const thumb = imageNode.closest(".variant-thumb");
  if (!thumb) return;
  thumb.classList.add("is-empty");
  thumb.textContent = "No image";
}

function replaceBrokenPreviewImage(imageNode) {
  const preview = imageNode.closest(".image-preview");
  if (!preview) return;
  preview.classList.add("is-empty");
  preview.textContent = "Image not available";
}

function replaceBrokenPromotionImage(imageNode) {
  const frame = imageNode.closest(".promotion-image-wrap");
  if (!frame) return;
  frame.classList.add("is-missing");
  frame.textContent = "Image not available";
}

function replaceBrokenDetailImage(imageNode) {
  const button = imageNode.closest(".product-detail-image-button");
  if (!button) return;
  button.classList.add("is-missing");
  button.innerHTML = `<span class="missing-image">Image not available</span>`;
}

function replaceBrokenImagePreview(imageNode) {
  const frame = imageNode.closest(".image-preview-frame");
  if (!frame) return;
  frame.innerHTML = `<div class="missing-image">Image not available</div>`;
}

async function resetInventory() {
  const ok = window.confirm("Reset inventory, prices, locations, and availability to the defaults?");
  if (!ok) return;
  state.editingProductId = null;
  state.deletedProductIds = [];
  const defaults = getRestoredLocalProductCatalog();
  try {
    setAdminStatus("Resetting");
    await replaceRemoteProducts(defaults);
    state.products = defaults;
    if (!state.firebaseReady) {
      localStorage.removeItem(STORAGE_KEYS.deletedProducts);
      persistProducts();
    }
    renderAfterInventoryChange("Reset");
  } catch (error) {
    console.error(error);
    setAdminStatus("Reset failed");
  }
}

function exportProductBackup() {
  const payload = {
    app: "Haul Mart",
    type: "product-backup",
    exportedAt: new Date().toISOString(),
    productCount: state.products.length,
    products: state.products.map(serializeProduct)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `haul-mart-product-backup-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setAdminStatus("Backup exported");
}

async function importProductBackup() {
  const file = els.importProductsFile?.files?.[0];
  if (!file) return;

  try {
    const backup = JSON.parse(await readFileAsText(file));
    const products = normalizeImportedProductBackup(backup);
    if (!products.length) {
      setAdminStatus("Import failed");
      return;
    }

    setAdminStatus("Importing");
    await replaceRemoteProducts(products);
    state.products = products;
    if (!state.firebaseReady) {
      localStorage.removeItem(STORAGE_KEYS.deletedProducts);
      persistProducts();
    }
    state.editingProductId = null;
    renderAfterInventoryChange("Backup imported");
  } catch (error) {
    console.error(error);
    setAdminStatus("Import failed");
  } finally {
    if (els.importProductsFile) els.importProductsFile.value = "";
  }
}

function renderAfterInventoryChange(statusText) {
  renderProductOptions();
  renderCategoryChips();
  renderNavigation();
  renderGroceryList();
  renderBudget();
  renderAdminList();
  setAdminStatus(statusText);
  window.setTimeout(() => {
    setAdminStatus(state.firebaseReady ? "Firebase synced" : "Ready");
  }, 1600);
}

function setAdminStatus(statusText) {
  if (els.adminStatus) els.adminStatus.textContent = statusText;
}

function renderLocationOptions(select = null, selectedKey = "aisle-1") {
  const options = renderLocationSelectOptions(selectedKey);

  const selects = select ? [select] : [els.newLocation].filter(Boolean);
  selects.forEach((locationSelect) => {
    locationSelect.innerHTML = options;
    locationSelect.value = selectedKey;
  });
}

function renderLocationSelectOptions(selectedKey = "aisle-1") {
  return getLocationZones()
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((location) => `<option value="${escapeHTML(location.key)}" ${location.key === selectedKey ? "selected" : ""}>${escapeHTML(location.label)}</option>`)
    .join("");
}

function getProductLocations() {
  const byLocation = new Map();
  state.products.forEach((product) => {
    const key = getProductLocationKey(product);
    if (!byLocation.has(key)) {
      byLocation.set(key, {
        key,
        label: getLocationLabel(key),
        category: product.category,
        order: getLocationOrder(key)
      });
    }
  });

  return [...byLocation.values()].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

function getCategoryByLocation(locationKey) {
  const section = getLocationZone(locationKey);
  if (section?.categories?.length) return section.categories[0];
  return getProductsForLocation(locationKey)[0]?.category || null;
}

function getLocationProductGroups(locationKey) {
  const customGroups = getLocationZone(locationKey)?.categories;
  if (customGroups?.length) {
    return customGroups;
  }

  if (LOCATION_PRODUCT_GROUPS[locationKey]) {
    return LOCATION_PRODUCT_GROUPS[locationKey];
  }

  return [...new Set(
    getProductsForLocation(locationKey)
      .map((product) => cleanGroupLabel(product.category))
      .filter(Boolean)
  )].slice(0, 6);
}

function getProductsForLocation(locationKey) {
  const section = getLocationZone(locationKey);
  const assignedProducts = new Set(section?.assignedProducts || []);
  return state.products.filter((product) =>
    product.locationKey === locationKey
    || assignedProducts.has(product.id)
    || (!assignedProducts.size && product.aisle && `aisle-${product.aisle}` === locationKey)
  );
}

function cleanGroupLabel(category) {
  return String(category || "")
    .replace(/^Meat\s*-\s*/i, "")
    .replace(/^Frozen\s*/i, "")
    .replace(/^Wall\s*/i, "")
    .trim();
}

function getProductLocationKey(product) {
  const assignedSection = stateReady ? getAssignedProductSection(product?.id) : null;
  if (assignedSection) return assignedSection.key;
  if (product.locationKey) return product.locationKey;
  if (product.aisle) return `aisle-${product.aisle}`;
  return "aisle-1";
}

function getAssignedProductSection(productId) {
  if (!productId) return null;
  return getLocationZones().find((section) => (section.assignedProducts || []).includes(productId)) || null;
}

function getProductLocationLabel(product) {
  return getLocationLabel(getProductLocationKey(product));
}

function getLocationZones() {
  return state.mapSections?.length ? state.mapSections : getDefaultMapSections();
}

function getLocationZone(locationKey) {
  return getLocationZones().find((section) => section.key === locationKey) || LOCATION_BY_KEY.get(locationKey) || null;
}

function getProductVariants(product) {
  return Array.isArray(product?.variants) ? product.variants : [];
}

function findProductVariant(product, variantId) {
  if (!variantId) return null;
  return getProductVariants(product).find((variant) => variant.id === variantId) || null;
}

function getSelectedVariant(product) {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return findProductVariant(product, state.selectedVariants[product.id]) || variants[0];
}

function getProductDisplayDetails(product, variant = null) {
  return {
    variant,
    price: variant ? variant.price : product.price,
    image: variant?.image || product.image || "",
    inStock: variant ? variant.inStock : product.inStock,
    imageAlt: getProductDisplayName(product, variant)
  };
}

function getProductDisplayName(product, variant = null) {
  return variant ? `${product.name} - ${variant.name}` : product.name;
}

function getLocationLabel(locationKey) {
  return getLocationZone(locationKey)?.label || titleCase(locationKey.replaceAll("-", " "));
}

function getLocationShortLabel(locationKey) {
  const zone = getLocationZone(locationKey);
  if (zone?.shortLabel) return zone.shortLabel;
  const [type, number] = String(locationKey).split("-");
  const prefix = {
    meat: "M",
    frozen: "F",
    aisle: "A",
    wall: "W"
  }[type] || "";
  return `${prefix}${number || ""}` || getLocationLabel(locationKey);
}

function renderLocationShortLabel(locationKey, fallbackLabel = "") {
  const shortLabel = getLocationShortLabel(locationKey) || fallbackLabel;
  const match = /^([A-Z])(\d+)$/.exec(shortLabel);
  if (!match) return escapeHTML(shortLabel);
  return `<span class="map-zone-letter">${escapeHTML(match[1])}</span><span class="map-zone-number">${escapeHTML(match[2])}</span>`;
}

function getLocationOrder(locationKey) {
  return getLocationZone(locationKey)?.order || 999;
}

function getZoneType(locationKey) {
  const sectionType = getLocationZone(locationKey)?.type;
  if (sectionType) return sectionType;
  if (locationKey.startsWith("meat")) return "meat";
  if (locationKey.startsWith("frozen")) return "freezer";
  if (locationKey.startsWith("wall")) return "wall";
  return "aisle";
}

function focusMapOnMobile() {
  if (!window.matchMedia("(max-width: 768px)").matches) return;
  window.clearTimeout(state.mapFocusTimer);
  state.mapFocusTimer = window.setTimeout(() => {
    const mapPanel = document.querySelector(".map-panel");
    if (!mapPanel) return;
    const headerOffset = (document.querySelector(".topbar")?.getBoundingClientRect().height || 0) + 10;
    const top = mapPanel.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, 260);
}

function getProductLocationOrder(product) {
  return getLocationOrder(getProductLocationKey(product));
}

function getProductShotSlot(product) {
  const key = getProductLocationKey(product);
  if (key.startsWith("meat")) return 7;
  if (key.startsWith("frozen")) return 6;
  if (key.startsWith("wall")) return 4;
  const aisle = Number(key.replace("aisle-", ""));
  return Number.isFinite(aisle) ? aisle : 1;
}

function createLocationFields(locationKey) {
  const match = /^aisle-(\d+)$/.exec(locationKey);
  return {
    locationKey,
    aisle: match ? Number(match[1]) : null
  };
}

function setProductLocation(product, locationKey) {
  const fields = createLocationFields(locationKey || "aisle-1");
  product.locationKey = fields.locationKey;
  product.aisle = fields.aisle;
}

function findProductById(id) {
  return state.products.find((product) => product.id === id) || null;
}

function findBestProduct(value) {
  return findBestProductEntry(value)?.product || null;
}

function findBestProductEntry(value) {
  const query = normalize(value);
  if (!query) return null;
  const exact = state.products.find((product) => normalize(product.name) === query);
  if (exact) return { product: exact, variant: getSelectedVariant(exact), score: 0 };
  const exactVariant = state.products
    .flatMap((product) => getProductVariants(product).map((variant) => ({ product, variant })))
    .find(({ product, variant }) =>
      normalize(getProductDisplayName(product, variant)) === query || normalize(variant.name) === query
    );
  if (exactVariant) return { ...exactVariant, score: 0 };
  return getProductSuggestions(query)[0] || null;
}

function getProductSuggestions(query) {
  const cleanQuery = normalize(query);
  if (!cleanQuery) return [];
  const productNameMatched = (product) => {
    const name = normalize(product.name);
    return name === cleanQuery || name.startsWith(cleanQuery) || name.includes(cleanQuery);
  };
  const suggestions = [];

  state.products.forEach((product) => {
    const productScore = searchScore(product, cleanQuery);
    if (productScore === null) return;
    const variants = getProductVariants(product);

    if (variants.length) {
      const matchedVariants = variants
        .map((variant) => ({
          product,
          variant,
          score: getVariantSuggestionScore(product, variant, cleanQuery)
        }))
        .filter((entry) => entry.score !== null || productNameMatched(product))
        .map((entry) => ({
          ...entry,
          score: entry.score ?? productScore + 0.25
        }));

      suggestions.push(...matchedVariants);
      return;
    }

    suggestions.push({ product, variant: null, score: productScore });
  });

  return suggestions
    .sort((a, b) =>
      a.score - b.score
      || getProductLocationOrder(a.product) - getProductLocationOrder(b.product)
      || a.product.name.localeCompare(b.product.name)
      || (a.variant?.name || "").localeCompare(b.variant?.name || "")
    )
    .slice(0, 8);
}

function getVariantSuggestionScore(product, variant, query) {
  const variantName = normalize(variant.name);
  const displayName = normalize(getProductDisplayName(product, variant));
  if (displayName === query || variantName === query) return 0;
  if (displayName.startsWith(query) || variantName.startsWith(query)) return 1;
  if (displayName.includes(query) || variantName.includes(query)) return 2;
  return null;
}

function applyQueryVariantSelection(products, query) {
  products.forEach((product) => {
    const variant = getBestVariantForQuery(product, query);
    if (variant) state.selectedVariants[product.id] = variant.id;
  });
}

function getBestVariantForQuery(product, query) {
  const cleanQuery = normalize(query);
  if (!cleanQuery) return null;
  const productName = normalize(product.name);
  if (productName === cleanQuery || productName.startsWith(cleanQuery)) return null;

  return getProductVariants(product)
    .map((variant) => ({
      variant,
      score: getVariantSuggestionScore(product, variant, cleanQuery)
    }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.variant.name.localeCompare(b.variant.name))[0]?.variant || null;
}

function getListProduct(item) {
  return findProductById(item.productId) || findBestProduct(item.label);
}

function searchScore(product, query) {
  const name = normalize(product.name);
  const category = normalize(product.category);
  const location = normalize(getProductLocationLabel(product));
  const variants = normalize(getProductVariants(product).map((variant) => variant.name).join(" "));
  const haystack = `${name} ${variants} ${category} ${location}`;
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  const variantScore = getProductVariantSearchScore(product, query);
  if (variantScore !== null) return variantScore;
  if (location.includes(query)) return 3;
  if (category.includes(query)) return 4;
  if (haystack.includes(query)) return 4;
  return null;
}

function getProductVariantSearchScore(product, query) {
  const scores = getProductVariants(product)
    .map((variant) => getVariantSuggestionScore(product, variant, query))
    .filter((score) => score !== null);
  return scores.length ? Math.min(...scores) : null;
}

function loadGroceryList() {
  return normalizeGroceryListItems(readJSON(STORAGE_KEYS.list, []));
}

function normalizeGroceryListItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizeGroceryListItem)
    .filter(Boolean);
}

function normalizeGroceryListItem(item) {
  const label = String(item?.label || "").trim();
  if (!label) return null;
  return {
    id: String(item.id || createId("list")),
    label,
    productId: item.productId ? String(item.productId) : null,
    variantId: item.variantId ? String(item.variantId) : null,
    done: Boolean(item.done)
  };
}

function loadMapSections() {
  const saved = readJSON(STORAGE_KEYS.mapSections, []);
  if (!Array.isArray(saved) || !saved.length) return getDefaultMapSections();
  return normalizeLoadedMapSections(saved);
}

function normalizeLoadedMapSections(sections) {
  if (!Array.isArray(sections) || !sections.length) return getDefaultMapSections();
  const normalized = sections
    .map((section, index) => normalizeMapSection(section, index))
    .filter(Boolean);
  if (isFullMapLayout(normalized)) return sortMapSections(normalized);
  return mergeMapSections(getDefaultMapSections(), normalized);
}

function isFullMapLayout(sections) {
  if (!Array.isArray(sections)) return false;
  const keys = new Set(sections.map((section) => section.key));
  return sections.length >= LOCATION_ZONES.length || ["checkout", "entrance", "restroom"].some((type) =>
    sections.some((section) => section.type === type)
  ) || ["aisle-1", "aisle-10", "meat-1", "wall-1"].every((key) => keys.has(key));
}

function getDefaultMapSections() {
  const shelves = LOCATION_ZONES.map((zone, index) => normalizeMapSection({
    ...zone,
    id: zone.key,
    key: zone.key,
    name: zone.label,
    type: inferMapSectionType(zone.key),
    shortLabel: getDefaultShortLabel(zone.key, zone.label),
    categories: LOCATION_PRODUCT_GROUPS[zone.key] || [],
    assignedProducts: [],
    rotation: 0,
    color: "",
    order: zone.order ?? index
  }, index));

  const landmarks = MAP_LANDMARKS.map((landmark, index) => {
    const section = convertLandmarkToMapSection(landmark, index);
    return normalizeMapSection(section, LOCATION_ZONES.length + index);
  });

  return [...shelves, ...landmarks].filter(Boolean);
}

function convertLandmarkToMapSection(landmark, index) {
  const label = landmark.label;
  const lowerLabel = normalize(label);
  const type = landmark.type === "cashier"
    ? "checkout"
    : lowerLabel.includes("restroom")
      ? "restroom"
      : lowerLabel.includes("entrance") || lowerLabel.includes("exit")
        ? "entrance"
        : "custom";
  const keyBase = type === "checkout"
    ? `checkout-${index + 1}`
    : `${type}-${slugify(label)}-${index + 1}`;
  return {
    id: keyBase,
    key: keyBase,
    name: type === "checkout" ? `Checkout ${index + 1}` : titleCase(label),
    type,
    label,
    shortLabel: label,
    categories: [],
    assignedProducts: [],
    order: 200 + index,
    left: landmark.left,
    top: landmark.top,
    width: landmark.width,
    height: landmark.height,
    rotation: 0,
    color: MAP_SECTION_COLORS[type] || ""
  };
}

function inferMapSectionType(key) {
  if (key.startsWith("meat")) return "meat";
  if (key.startsWith("frozen")) return "freezer";
  if (key.startsWith("wall")) return "wall";
  return "aisle";
}

function getDefaultShortLabel(key, label) {
  const [type, number] = String(key).split("-");
  const prefix = {
    meat: "M",
    frozen: "F",
    aisle: "A",
    wall: "W"
  }[type];
  return prefix && number ? `${prefix}${number}` : label;
}

function mergeMapSections(baseSections, overrideSections) {
  const base = baseSections.map((section, index) => normalizeMapSection(section, index)).filter(Boolean);
  const overrides = Array.isArray(overrideSections)
    ? overrideSections.map((section, index) => normalizeMapSection(section, index)).filter(Boolean)
    : [];
  const overrideMap = new Map(overrides.map((section) => [section.key, section]));
  const baseKeys = new Set(base.map((section) => section.key));
  const merged = base.map((section) => overrideMap.has(section.key)
    ? { ...section, ...overrideMap.get(section.key) }
    : section);
  overrides.forEach((section) => {
    if (!baseKeys.has(section.key)) merged.push(section);
  });
  return sortMapSections(merged);
}

function createMapSection(section) {
  const type = normalizeSectionType(section.type);
  const name = section.name.trim();
  const key = uniqueMapSectionKey(`${type}-${slugify(name)}`);
  const customIndex = state.mapSections.length;
  return normalizeMapSection({
    ...section,
    key,
    type,
    name,
    shortLabel: section.label.trim(),
    order: 100 + customIndex,
    ...getDefaultMapSectionPosition(type, customIndex)
  }, customIndex);
}

function normalizeMapSection(section, index = 0) {
  const name = String(section?.name || section?.label || "").trim();
  if (!name) return null;
  const type = normalizeSectionType(section.type);
  const position = getDefaultMapSectionPosition(type, index);
  const label = String(section.label || name).trim();
  const key = String(section.key || section.id || `${type}-${slugify(name)}`).trim();
  const left = Number.isFinite(Number(section.x)) ? Number(section.x) : Number(section.left);
  const top = Number.isFinite(Number(section.y)) ? Number(section.y) : Number(section.top);
  return {
    id: key,
    key,
    name,
    type,
    label,
    shortLabel: String(section.shortLabel || label).trim(),
    categories: Array.isArray(section.categories)
      ? section.categories.map((category) => String(category).trim()).filter(Boolean)
      : parseCategoryList(section.categories || ""),
    assignedProducts: Array.isArray(section.assignedProducts || section.products)
      ? [...new Set((section.assignedProducts || section.products).map((productId) => String(productId).trim()).filter(Boolean))]
      : [],
    order: Number.isFinite(Number(section.order)) ? Number(section.order) : 100 + index,
    left: clamp(Number.isFinite(left) ? left : position.left, 0, 99),
    top: clamp(Number.isFinite(top) ? top : position.top, 0, 99),
    width: clamp(Number.isFinite(Number(section.width)) ? Number(section.width) : position.width, 1, 100),
    height: clamp(Number.isFinite(Number(section.height)) ? Number(section.height) : position.height, 1, 100),
    rotation: clamp(Number.isFinite(Number(section.rotation)) ? Number(section.rotation) : 0, -180, 180),
    color: normalizeHexColor(section.color) || MAP_SECTION_COLORS[type] || ""
  };
}

function normalizeSectionType(type) {
  const clean = String(type || "").toLowerCase().trim();
  if (clean === "frozen") return "freezer";
  if (clean === "cashier") return "checkout";
  return MAP_SECTION_TYPES.includes(clean) ? clean : "aisle";
}

function getDefaultMapSectionPosition(type, index) {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const left = 18 + column * 15;
  const top = 82 + row * 5.4;
  const sizeByType = {
    aisle: { width: 5.0, height: 9.0 },
    wall: { width: 5.0, height: 9.0 },
    freezer: { width: 11.5, height: 4.3 },
    meat: { width: 11.5, height: 4.3 },
    produce: { width: 9.5, height: 6.0 },
    dairy: { width: 9.5, height: 5.0 },
    checkout: { width: 7.0, height: 5.5 },
    entrance: { width: 15.0, height: 4.0 },
    restroom: { width: 10.0, height: 9.0 },
    custom: { width: 8.0, height: 6.0 }
  };
  const size = sizeByType[type] || sizeByType.aisle;
  return {
    left: clamp(left, 4, 88),
    top: clamp(top, 4, 92),
    ...size
  };
}

function parseCategoryList(value) {
  return [...new Set(String(value || "")
    .split(/[\n,]+/)
    .map((category) => category.trim())
    .filter(Boolean))];
}

function loadPromotions() {
  const saved = readJSON(STORAGE_KEYS.promotions, []);
  if (!Array.isArray(saved)) return [];
  return saved
    .map(normalizePromotion)
    .filter(Boolean);
}

function normalizePromotion(promotion) {
  if (!promotion) return null;
  const title = String(promotion?.title || "").trim();
  const id = String(promotion?.id || slugify(title || "promotion")).trim();
  return {
    id,
    title,
    description: String(promotion?.description || "").trim(),
    promoText: String(promotion?.promoText || promotion?.saleText || "").trim(),
    image: normalizeProductImagePath(promotion?.image),
    buttonText: String(promotion?.buttonText || "").trim(),
    link: normalizePromotionLink(promotion?.link || promotion?.action || ""),
    startDate: normalizeDateInput(promotion?.startDate),
    endDate: normalizeDateInput(promotion?.endDate),
    active: promotion?.active !== false
  };
}

function serializePromotion(promotion) {
  const normalized = normalizePromotion(promotion);
  return {
    id: normalized.id,
    title: normalized.title,
    description: normalized.description,
    promoText: normalized.promoText,
    image: normalized.image || "",
    buttonText: normalized.buttonText,
    link: normalized.link,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    active: normalized.active !== false
  };
}

function normalizeDateInput(value) {
  const clean = String(value || "").trim();
  const match = clean.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function normalizePromotionLink(value) {
  const link = String(value || "").trim();
  if (!link || /^(javascript|data|file|blob):/i.test(link)) return "";
  return link;
}

function isPromotionVisible(promotion) {
  if (!promotion?.active) return false;
  const today = getTodayDateString();
  if (promotion.startDate && promotion.startDate > today) return false;
  if (promotion.endDate && promotion.endDate < today) return false;
  return true;
}

function isValidPromotionDateRange(promotion) {
  return !promotion.startDate || !promotion.endDate || promotion.endDate >= promotion.startDate;
}

function getTodayDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getPromotionSortValue(promotion) {
  const date = promotion.startDate || promotion.endDate || "9999-12-31";
  return Number(date.replaceAll("-", ""));
}

function getPromotionAdminStatus(promotion) {
  if (!promotion.active) return "Inactive";
  if (!isPromotionVisible(promotion)) {
    const today = getTodayDateString();
    if (promotion.startDate && promotion.startDate > today) return `Starts ${promotion.startDate}`;
    if (promotion.endDate && promotion.endDate < today) return `Expired ${promotion.endDate}`;
  }
  const range = [promotion.startDate, promotion.endDate].filter(Boolean).join(" to ");
  return range ? `Active | ${range}` : "Active";
}

function findPromotionById(id) {
  return state.promotions.find((promotion) => promotion.id === id) || null;
}

function uniquePromotionId(base) {
  const cleanBase = base || "promotion";
  let id = cleanBase;
  let counter = 2;
  while (findPromotionById(id)) {
    id = `${cleanBase}-${counter}`;
    counter += 1;
  }
  return id;
}

function upsertPromotion(promotion) {
  const normalized = normalizePromotion(promotion);
  if (!normalized) return;
  const index = state.promotions.findIndex((item) => item.id === normalized.id);
  if (index >= 0) {
    state.promotions[index] = normalized;
  } else {
    state.promotions.push(normalized);
  }
  state.promotions.sort((a, b) => getPromotionSortValue(a) - getPromotionSortValue(b) || a.title.localeCompare(b.title));
  persistPromotions();
}

function persistPromotions() {
  if (state.firebaseReady) return;
  saveJSON(STORAGE_KEYS.promotions, state.promotions.map(serializePromotion));
}

async function persistPromotion(promotion) {
  if (state.firebaseReady && state.firebase?.savePromotion) {
    await state.firebase.savePromotion(serializePromotion(promotion));
  }
}

async function deleteRemotePromotion(promotionId) {
  if (state.firebaseReady && state.firebase?.deletePromotion) {
    await state.firebase.deletePromotion(promotionId);
  }
}

function preparePromotionForRemote(promotion) {
  const normalized = normalizePromotion(structuredCloneSafe(promotion));
  assertPromotionImageSize(normalized);
  return normalized;
}

function assertPromotionImageSize(promotion) {
  if (!isFirestoreProductImage(promotion?.image)) return;
  const bytes = getDataUrlByteLength(promotion.image);
  if (bytes > ADMIN_IMAGE_MAX_FIRESTORE_BYTES) {
    throw new Error("Promotion image is too large for Firestore.");
  }
}

function uniqueMapSectionKey(base) {
  const used = new Set(getLocationZones().map((location) => location.key));
  let key = base;
  let counter = 2;
  while (used.has(key)) {
    key = `${base}-${counter}`;
    counter += 1;
  }
  return key;
}

function sortMapSections(sections) {
  return sections.slice().sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function persistMapSections() {
  if (state.firebaseReady) return;
  saveJSON(STORAGE_KEYS.mapSections, state.mapSections.map(serializeMapSection));
}

async function persistMapSection(section) {
  const normalized = normalizeMapSection(section);
  if (state.firebaseReady && state.firebase?.saveMapSection) {
    await state.firebase.saveMapSection(serializeMapSection(normalized));
    return;
  }
  upsertMapSection(normalized);
  persistMapSections();
}

async function deleteRemoteMapSection(sectionKey) {
  if (state.firebaseReady && state.firebase?.deleteMapSection) {
    await state.firebase.deleteMapSection(sectionKey);
  }
}

async function replaceRemoteMapSections(sections) {
  const normalizedSections = sortMapSections(sections.map((section, index) => normalizeMapSection(section, index)).filter(Boolean));
  if (state.firebaseReady && state.firebase?.replaceMapSections) {
    await state.firebase.replaceMapSections(normalizedSections.map(serializeMapSection));
    return;
  }
  state.mapSections = normalizedSections;
  persistMapSections();
}

function upsertMapSection(section) {
  const normalized = normalizeMapSection(section);
  if (!normalized) return;
  const index = state.mapSections.findIndex((entry) => entry.key === normalized.key);
  if (index >= 0) {
    state.mapSections[index] = normalized;
  } else {
    state.mapSections.push(normalized);
  }
  state.mapSections = sortMapSections(state.mapSections);
}

function loadProducts() {
  const saved = readJSON(STORAGE_KEYS.products, null);
  const deletedIds = new Set(readJSON(STORAGE_KEYS.deletedProducts, []));
  const defaults = getRestoredLocalProductCatalog()
    .map(normalizeProduct)
    .filter((product) => !deletedIds.has(product.id));
  if (!Array.isArray(saved)) return defaults;

  const savedProducts = migrateSavedWallLocations(saved).filter((product) => !deletedIds.has(product.id));
  let shouldRepairSavedProducts = savedProducts.some(hasEmbeddedProductImage);
  const merged = mergeProductCatalog(defaults, savedProducts);
  savedProducts.forEach((savedProduct) => {
    const normalizedSaved = normalizeProduct(savedProduct);
    const defaultProduct = defaults.find((product) => product.id === normalizedSaved.id);
    const image = defaultProduct ? mergeProductImage(defaultProduct, normalizedSaved) : normalizedSaved.image;
    if (normalizedSaved.image !== normalizeProductImagePath(savedProduct.image)) shouldRepairSavedProducts = true;
    if (image !== normalizedSaved.image) shouldRepairSavedProducts = true;
  });
  if (shouldRepairSavedProducts) {
    saveJSON(STORAGE_KEYS.products, merged);
  }
  return merged;
}

function getRestoredLocalProductCatalog() {
  return DEFAULT_PRODUCTS.map(normalizeProduct);
}

function mergeProductCatalog(baseProducts, overrideProducts) {
  const base = baseProducts.map(normalizeProduct);
  const overrides = Array.isArray(overrideProducts) ? overrideProducts : [];
  const overrideMap = new Map(overrides.map((product) => [product.id, product]));
  const baseIds = new Set(base.map((product) => product.id));
  const merged = base.map((product) => {
    const override = overrideMap.get(product.id);
    if (!override) return product;
    const normalizedOverride = normalizeProduct(override);
    const hasOverrideVariants = Object.prototype.hasOwnProperty.call(override, "variants");
    return {
      ...product,
      ...normalizedOverride,
      image: mergeProductImage(product, normalizedOverride),
      variants: hasOverrideVariants ? normalizedOverride.variants : product.variants
    };
  });

  overrides.forEach((product) => {
    if (!baseIds.has(product.id)) merged.push(normalizeProduct(product));
  });
  return merged;
}

async function restoreMissingRemoteCatalog(remoteProducts = []) {
  if (!state.firebaseReady || !state.firebase?.saveProduct || state.firebaseCatalogSeedInProgress) return;

  const restoredCatalog = getRestoredLocalProductCatalog();
  const remoteIds = new Set(remoteProducts.map((product) => product.id));
  const missingProducts = restoredCatalog.filter((product) => !remoteIds.has(product.id));
  if (!missingProducts.length && remoteProducts.length) return;

  state.firebaseCatalogSeedInProgress = true;
  try {
    if (!remoteProducts.length && state.firebase?.replaceProducts) {
      setAdminStatus("Seeding restored catalog");
      await replaceRemoteProducts(restoredCatalog);
      setAdminStatus(`Restored ${restoredCatalog.length} products`);
      return;
    }

    setAdminStatus(`Restoring ${missingProducts.length} products`);
    for (const product of missingProducts) {
      await state.firebase.saveProduct(serializeProduct(product));
    }
    setAdminStatus(`Restored ${missingProducts.length} products`);
  } catch (error) {
    console.error("Firebase catalog restore failed:", error);
    setAdminStatus("Catalog restore failed");
  } finally {
    state.firebaseCatalogSeedInProgress = false;
  }
}

function normalizeImportedProductBackup(backup) {
  const rawProducts = Array.isArray(backup) ? backup : backup?.products;
  if (!Array.isArray(rawProducts)) return [];
  const usedIds = new Set();
  return rawProducts
    .map((product) => {
      const baseId = slugify(product?.id || product?.name || "product");
      return normalizeProduct({
        ...product,
        id: uniqueImportedProductId(baseId, usedIds)
      });
    })
    .filter((product) => product.name);
}

function uniqueImportedProductId(base, usedIds) {
  let id = base || "product";
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(id);
  return id;
}

function migrateSavedWallLocations(products) {
  if (localStorage.getItem(STORAGE_KEYS.wallRenameMigration) === "true") return products;
  const migrated = products.map((product) => {
    const locationKey = LEGACY_WALL_LOCATION_RENAMES[product.locationKey] || product.locationKey;
    return locationKey === product.locationKey ? product : { ...product, locationKey };
  });
  saveJSON(STORAGE_KEYS.products, migrated);
  localStorage.setItem(STORAGE_KEYS.wallRenameMigration, "true");
  return migrated;
}

function normalizeProduct(product) {
  const locationFields = createLocationFields(getProductLocationKey(product));
  const normalized = {
    ...product,
    ...locationFields,
    price: Math.max(0, Number(product.price) || 0),
    image: getProductImagePath(product),
    inStock: product.inStock !== false
  };
  return {
    ...normalized,
    variants: normalizeVariants(product.variants, normalized)
  };
}

function normalizeVariants(variants, product) {
  if (!Array.isArray(variants)) return [];
  const usedIds = new Set();
  return variants
    .map((variant) => {
      const name = String(variant?.name || "").trim();
      if (!name) return null;
      const id = uniqueVariantId(variant.id || slugify(name), usedIds);
      const numericPrice = Number(variant.price);
      const price = Number.isFinite(numericPrice) ? Math.max(0, numericPrice) : product.price;
      return {
        id,
        name,
        price: Number.isFinite(price) ? price : product.price,
        image: getVariantImagePath(variant, product),
        inStock: variant.inStock !== false
      };
    })
    .filter(Boolean);
}

function hasEmbeddedProductImage(product) {
  const values = [product?.image];
  (product?.variants || []).forEach((variant) => values.push(variant?.image));
  return values.some((value) => /^data:image\//i.test(String(value || "").trim()));
}

function getProductImagePath(product) {
  const productImage = normalizeProductImagePath(product?.image);
  const mappedImage = normalizeProductImagePath(window.HAULMART_PRODUCT_IMAGES?.[product?.id]);
  return chooseDeployableProductImage(productImage, mappedImage);
}

function getVariantImagePath(variant, product) {
  const variantImage = normalizeProductImagePath(variant?.image);
  const productImages = window.HAULMART_PRODUCT_VARIANT_IMAGES?.[product?.id] || {};
  const mappedImage = normalizeProductImagePath(productImages[variant?.id] || productImages[slugify(variant?.name)]);
  return chooseDeployableProductImage(variantImage, mappedImage);
}

function mergeProductImage(defaultProduct, savedProduct) {
  const defaultImage = getProductImagePath(defaultProduct);
  const savedImage = getProductImagePath(savedProduct);
  if (!savedImage) return defaultImage;
  if (isFirestoreProductImage(savedImage)) return savedImage;
  if (!defaultImage) return savedImage;
  if (savedImage === defaultImage || hasKnownProductImagePath(savedImage)) return savedImage;
  return defaultImage;
}

function chooseDeployableProductImage(productImage, mappedImage) {
  if (isPortableAdminImage(productImage)) return productImage;
  if (productImage && (!mappedImage || productImage === mappedImage || hasKnownProductImagePath(productImage))) {
    return productImage;
  }
  return mappedImage || productImage;
}

function isPortableAdminImage(imagePath) {
  const image = String(imagePath || "").trim();
  return isFirestoreProductImage(image) || /^https?:\/\//i.test(image);
}

function isFirestoreProductImage(imagePath) {
  return DATA_IMAGE_PATTERN.test(String(imagePath || "").trim());
}

function hasKnownProductImagePath(imagePath) {
  const image = normalizeProductImagePath(imagePath);
  if (!image) return false;
  if (!knownProductImagePaths) {
    knownProductImagePaths = new Set();
    Object.values(window.HAULMART_PRODUCT_IMAGES || {}).forEach((path) => {
      const cleanPath = normalizeProductImagePath(path);
      if (cleanPath) knownProductImagePaths.add(cleanPath);
    });
    Object.values(window.HAULMART_PRODUCT_VARIANT_IMAGES || {}).forEach((variantImages) => {
      Object.values(variantImages || {}).forEach((path) => {
        const cleanPath = normalizeProductImagePath(path);
        if (cleanPath) knownProductImagePaths.add(cleanPath);
      });
    });
  }
  return knownProductImagePaths.has(image);
}

function persistProducts() {
  if (state.firebaseReady) return;
  saveJSON(STORAGE_KEYS.products, state.products);
}

async function persistProduct(product) {
  if (state.firebaseReady && state.firebase?.saveProduct) {
    await state.firebase.saveProduct(serializeProduct(product));
    return;
  }
  persistProducts();
}

async function deleteRemoteProduct(productId) {
  if (state.firebaseReady && state.firebase?.deleteProduct) {
    await state.firebase.deleteProduct(productId);
  }
}

async function replaceRemoteProducts(products) {
  if (state.firebaseReady && state.firebase?.replaceProducts) {
    await state.firebase.replaceProducts(products.map(serializeProduct));
  }
}

async function prepareProductForRemote(product) {
  const normalized = normalizeProduct(structuredCloneSafe(product));
  assertFirestoreImageSizes(normalized);
  return normalized;
}

function assertFirestoreImageSizes(product) {
  const images = [
    { label: product.name || "Product image", image: product.image },
    ...getProductVariants(product).map((variant) => ({
      label: `${product.name || "Product"} ${variant.name || "variant"}`,
      image: variant.image
    }))
  ];
  const embeddedImages = images
    .filter(({ image }) => isFirestoreProductImage(image))
    .map((entry) => ({
      ...entry,
      bytes: getDataUrlByteLength(entry.image)
    }));
  const oversized = embeddedImages.find(({ bytes }) => bytes > ADMIN_IMAGE_MAX_FIRESTORE_BYTES);

  if (oversized) {
    throw new Error(`${oversized.label} image is too large for Firestore.`);
  }

  const totalBytes = embeddedImages.reduce((sum, entry) => sum + entry.bytes, 0);
  if (totalBytes > ADMIN_IMAGE_MAX_FIRESTORE_BYTES) {
    throw new Error("Product images are too large for one Firestore record.");
  }
}

function serializeProduct(product) {
  const normalized = normalizeProduct(product);
  return {
    id: normalized.id,
    name: normalized.name,
    price: normalized.price,
    category: normalized.category,
    aisle: normalized.aisle,
    locationKey: normalized.locationKey,
    image: normalized.image || "",
    inStock: normalized.inStock !== false,
    variants: getProductVariants(normalized).map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      image: variant.image || "",
      inStock: variant.inStock !== false
    }))
  };
}

function serializeMapSection(section) {
  const normalized = normalizeMapSection(section);
  return {
    id: normalized.key,
    key: normalized.key,
    name: normalized.name,
    type: normalized.type,
    label: normalized.label,
    shortLabel: normalized.shortLabel,
    categories: normalized.categories,
    assignedProducts: normalized.assignedProducts,
    order: normalized.order,
    x: normalized.left,
    y: normalized.top,
    left: normalized.left,
    top: normalized.top,
    width: normalized.width,
    height: normalized.height,
    rotation: normalized.rotation,
    color: normalized.color
  };
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key, fallback = 0) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getClientId() {
  const existing = localStorage.getItem(STORAGE_KEYS.clientId);
  if (existing) return existing;
  const clientId = createId("customer");
  localStorage.setItem(STORAGE_KEYS.clientId, clientId);
  return clientId;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return normalize(value).replace(/\s+/g, "-") || createId("product");
}

function titleCase(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function uniqueProductId(base) {
  let id = base;
  let counter = 2;
  while (findProductById(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function uniqueVariantId(base, usedIds) {
  const cleanBase = slugify(base || "variant");
  let id = cleanBase;
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${cleanBase}-${counter}`;
    counter += 1;
  }
  usedIds.add(id);
  return id;
}

function productInitials(name) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "HM";
  if (words.length === 1) return words[0].slice(0, 2);
  return `${words[0][0]}${words[1][0]}`.slice(0, 2);
}

function createId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMapNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number(number.toFixed(1)).toString();
}

function normalizeHexColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "";
}

function getContrastTextColor(color) {
  const hex = normalizeHexColor(color);
  if (!hex) return "var(--ink)";
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#101114" : "#ffffff";
}

function escapeCSSSelector(value) {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
