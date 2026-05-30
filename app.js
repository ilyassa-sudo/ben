const dayMs = 86400000;
const today = new Date();
const iso = (date) => date.toISOString().slice(0, 10);
const shift = (days) => iso(new Date(today.getTime() + days * dayMs));
const money = (value) => `${Math.round(value).toLocaleString("fr-MA")} MAD`;
const storageKey = "benabella-crm-team-v1";
const syncConfigKey = "benabella-crm-sync-v1";
const legacyStorageKeys = ["benabella-crm", "benabella-crm-empty-v1"];
const defaultCommissionPercent = 5;
const defaultSocialSync = {
  endpoint: "",
  enabled: false,
  lastSync: "Never",
  status: "Not connected",
  intervalMinutes: 60
};
const defaultAiAgent = {
  endpoint: "",
  enabled: false,
  mode: "COO Review",
  status: "Local CRM brain",
  messages: []
};
const aiAgentModes = ["COO Review", "Sales Manager", "Lead Manager", "Owner Growth", "Marketing", "Negotiation", "Agadir Market", "Closing Plan"];
const benabellaAgentDoctrine = `
You are the COO, Sales Manager, Lead Manager, and Growth Advisor of Benabella Realty in Agadir, Morocco.
Your job is to increase revenue, increase serious buyers, increase quality owner inventory, increase visits, increase offers, close more transactions, and stop wasted time.
Be direct, practical, and revenue-focused.
Always answer the exact question first.
Then give concrete next actions, scripts, risks, and CRM updates.
Score buyers and owners by seriousness.
Think about Agadir areas including Hay Mohammadi, Al Houda, Salam, Dakhla, Tilila, Charaf, Founty, Sonaba, Taddart, Ait Melloul, Bensergao, and Anza.
Use MAD and Benabella Realty's default 5% commission.
Do not give vague motivation. Give decisions and tasks.
`;
const cloneData = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const firebaseFallbackConfig = {
  apiKey: "AIzaSyA_rptOoLSkHxF0ET6u2TzaFdEnnUgMWJY",
  authDomain: "benabella-realty-crm.firebaseapp.com",
  projectId: "benabella-realty-crm",
  storageBucket: "benabella-realty-crm.firebasestorage.app",
  messagingSenderId: "1083366626031",
  appId: "1:1083366626031:web:772dca8b7e6fb67011811a",
  measurementId: "G-1NJPCM61M9"
};

const emptyData = {
  selectedLeadId: null,
  selectedPropertyId: null,
  leads: [],
  properties: [],
  owners: [],
  visits: [],
  deals: [],
  socialPosts: [],
  socialAccounts: [],
  socialSync: cloneData(defaultSocialSync),
  aiAgent: cloneData(defaultAiAgent)
};

const sourceQuality = {
  Referrals: 20,
  WhatsApp: 18,
  "Facebook Ads": 15,
  Instagram: 13,
  TikTok: 12,
  Avito: 10,
  "Facebook Marketplace": 9
};

const defaultData = {
  selectedLeadId: 1,
  selectedPropertyId: 1,
  leads: [
    {
      id: 1,
      name: "Samira El Fassi",
      phone: "+212 600 111 222",
      source: "Referrals",
      agent: "Ayoub",
      status: "Visit Booked",
      budget: 1250000,
      realisticBudget: true,
      buySoon: true,
      lastReply: shift(0),
      nextCall: shift(0),
      followUp: shift(-1),
      bookedVisit: true,
      madeOffer: false,
      propertyId: 1,
      createdAt: shift(-8),
      requirement: {
        propertyType: "Apartment",
        purpose: "Buy",
        area: "Founty or Sonaba",
        budgetMin: 1000000,
        budgetMax: 1250000,
        rooms: "3 rooms",
        surface: "95-120 m2",
        floor: "Middle floor or higher",
        timeline: "This month",
        financing: "Bank approved",
        mustHave: "Elevator, parking, balcony",
        avoid: "Ground floor",
        notes: "Prefers a modern building close to cafes and beach access."
      }
    },
    {
      id: 2,
      name: "Omar Ait Said",
      phone: "+212 601 333 444",
      source: "Avito",
      agent: "Youssef",
      status: "Negotiation",
      budget: 780000,
      realisticBudget: true,
      buySoon: true,
      lastReply: shift(-1),
      nextCall: shift(0),
      followUp: shift(0),
      bookedVisit: true,
      madeOffer: true,
      propertyId: 2,
      createdAt: shift(-14),
      requirement: {
        propertyType: "Apartment",
        purpose: "Buy",
        area: "Hay Mohammadi",
        budgetMin: 680000,
        budgetMax: 780000,
        rooms: "2 rooms",
        surface: "70-90 m2",
        floor: "Any floor with elevator",
        timeline: "2 weeks",
        financing: "Cash buyer",
        mustHave: "Sunny, near tram/bus",
        avoid: "Major renovation",
        notes: "Ready to make an offer if price is clean."
      }
    },
    {
      id: 3,
      name: "Nadia Rami",
      phone: "+212 602 555 666",
      source: "Instagram",
      agent: "Ayoub",
      status: "Interested",
      budget: 520000,
      realisticBudget: false,
      buySoon: false,
      lastReply: shift(-6),
      nextCall: shift(1),
      followUp: shift(-2),
      bookedVisit: false,
      madeOffer: false,
      propertyId: 3,
      createdAt: shift(-4),
      requirement: {
        propertyType: "Apartment",
        purpose: "Buy",
        area: "Salam or Dakhla",
        budgetMin: 430000,
        budgetMax: 520000,
        rooms: "2 rooms",
        surface: "60-80 m2",
        floor: "Low floor",
        timeline: "3 months",
        financing: "Needs bank check",
        mustHave: "Low floor, clean title",
        avoid: "Noisy streets",
        notes: "Needs education on realistic prices in target areas."
      }
    },
    {
      id: 4,
      name: "Rachid Bennani",
      phone: "+212 603 777 888",
      source: "Facebook Marketplace",
      agent: "Youssef",
      status: "Lost",
      budget: 900000,
      realisticBudget: true,
      buySoon: false,
      lastReply: shift(-17),
      nextCall: shift(-5),
      followUp: shift(-5),
      bookedVisit: true,
      madeOffer: false,
      propertyId: 4,
      createdAt: shift(-28),
      lostReason: "location",
      requirement: {
        propertyType: "Apartment",
        purpose: "Buy",
        area: "Tilila",
        budgetMin: 800000,
        budgetMax: 900000,
        rooms: "3 rooms",
        surface: "90-115 m2",
        floor: "Quiet upper floor",
        timeline: "Flexible",
        financing: "No financing",
        mustHave: "Quiet street",
        avoid: "Busy commercial roads",
        notes: "Rejected last match because the street felt too active."
      }
    }
  ],
  properties: [
    {
      id: 1,
      title: "Modern Apartment in Founty",
      type: "Apartment",
      area: "Founty",
      price: 1180000,
      agent: "Ayoub",
      status: "Available",
      ownerId: 1,
      commission: { type: "percentage", value: defaultCommissionPercent },
      lastPosted: shift(-7),
      nextRepost: shift(0),
      platforms: ["Avito", "Facebook", "Instagram", "TikTok"],
      repostStatus: "Due today",
      docs: ["Mandate signed.pdf", "Floor plan.jpg"],
      publicPhotos: 8,
      features: "3 rooms, elevator, balcony, parking"
    },
    {
      id: 2,
      title: "Sunny Apartment Hay Mohammadi",
      type: "Apartment",
      area: "Hay Mohammadi",
      price: 760000,
      agent: "Youssef",
      status: "Reserved",
      ownerId: 2,
      commission: { type: "fixed", value: 20000 },
      lastPosted: shift(-4),
      nextRepost: shift(0),
      platforms: ["Avito", "Facebook"],
      repostStatus: "Due today",
      docs: ["Owner ID.pdf"],
      publicPhotos: 5,
      features: "2 rooms, sunny living room, close to services"
    },
    {
      id: 3,
      title: "Land Plot in Ait Melloul",
      type: "Land",
      area: "Ait Melloul",
      price: 430000,
      agent: "Ayoub",
      status: "Available",
      ownerId: 3,
      commission: { type: "percentage", value: 3 },
      lastPosted: shift(-2),
      nextRepost: shift(2),
      platforms: ["Facebook", "Instagram"],
      repostStatus: "Scheduled",
      docs: [],
      publicPhotos: 3,
      features: "Clear access, residential zone"
    },
    {
      id: 4,
      title: "Commercial Shop in Dakhla",
      type: "Commercial",
      area: "Dakhla",
      price: 980000,
      agent: "Youssef",
      status: "Available",
      ownerId: 4,
      commission: { type: "percentage", value: 2 },
      lastPosted: shift(-11),
      nextRepost: shift(-1),
      platforms: ["Avito", "Facebook", "Instagram"],
      repostStatus: "Overdue",
      docs: ["Title deed.pdf", "Mandate draft.docx"],
      publicPhotos: 6,
      features: "Street frontage, high foot traffic"
    }
  ],
  owners: [
    { id: 1, name: "M. Amrani", phone: "+212 610 222 333", propertyIds: [1], lastContact: shift(-2), askingPrice: 1180000, lowestPrice: 1120000, agreement: "Exclusive signed", notes: "Open to serious cash offer." },
    { id: 2, name: "Mme. Bennis", phone: "+212 611 444 555", propertyIds: [2], lastContact: shift(0), askingPrice: 760000, lowestPrice: 735000, agreement: "Non-exclusive", notes: "Wants weekly feedback." },
    { id: 3, name: "Hassan T.", phone: "+212 612 666 777", propertyIds: [3], lastContact: shift(-8), askingPrice: 430000, lowestPrice: 410000, agreement: "Needs mandate", notes: "Follow up for paperwork." },
    { id: 4, name: "Sofia Holding", phone: "+212 613 888 999", propertyIds: [4], lastContact: shift(-4), askingPrice: 980000, lowestPrice: 930000, agreement: "Mandate draft", notes: "Needs owner ID copy." }
  ],
  visits: [
    { id: 1, leadId: 1, propertyId: 1, agent: "Ayoub", date: shift(0), time: "11:00", feedback: "", notes: "" },
    { id: 2, leadId: 2, propertyId: 2, agent: "Youssef", date: shift(0), time: "16:30", feedback: "made offer", notes: "Offer at 735,000 MAD." },
    { id: 3, leadId: 3, propertyId: 3, agent: "Ayoub", date: shift(-1), time: "10:00", feedback: "price problem", notes: "Budget not realistic." }
  ],
  deals: [
    { id: 1, leadId: 2, propertyId: 2, agent: "Youssef", platform: "Avito", stage: "Negotiation", expectedCommission: 20000, closedDate: null },
    { id: 2, leadId: 1, propertyId: 1, agent: "Ayoub", platform: "Referrals", stage: "Hot Lead", expectedCommission: 29500, closedDate: null },
    { id: 3, leadId: 5, propertyId: 4, agent: "Ayoub", platform: "WhatsApp", stage: "Closed", expectedCommission: 19600, closedDate: shift(-12) }
  ],
  socialPosts: [
    {
      id: 1,
      platform: "Instagram",
      propertyId: 1,
      agent: "Ayoub",
      type: "Reel",
      date: shift(0),
      status: "Scheduled",
      goal: "Generate WhatsApp messages",
      caption: "Founty apartment with elevator, balcony, and parking. Book a private visit with Benabella Realty.",
      metrics: { views: 0, likes: 0, comments: 0, messages: 0, leads: 0 }
    },
    {
      id: 2,
      platform: "TikTok",
      propertyId: 2,
      agent: "Youssef",
      type: "Listing",
      date: shift(-1),
      status: "Published",
      goal: "Push reserved buyer interest",
      caption: "Sunny apartment in Hay Mohammadi, close to daily services. Message Benabella Realty for details.",
      metrics: { views: 3200, likes: 146, comments: 12, messages: 9, leads: 3 }
    },
    {
      id: 3,
      platform: "Facebook",
      propertyId: 4,
      agent: "Youssef",
      type: "Listing",
      date: shift(0),
      status: "Needs Caption",
      goal: "Find commercial buyer",
      caption: "Commercial shop in Dakhla with street frontage and high foot traffic. Contact Benabella Realty.",
      metrics: { views: 0, likes: 0, comments: 0, messages: 0, leads: 0 }
    },
    {
      id: 4,
      platform: "Instagram",
      propertyId: 3,
      agent: "Ayoub",
      type: "Story",
      date: shift(2),
      status: "Scheduled",
      goal: "Land investor reach",
      caption: "Land opportunity in Ait Melloul with clear access. Ask Benabella Realty for location and paperwork.",
      metrics: { views: 0, likes: 0, comments: 0, messages: 0, leads: 0 }
    }
  ],
  socialAccounts: [
    { id: 1, platform: "Instagram", name: "@benabellarealty", status: "Manual tracking", lastSync: "Not connected", followers: 0, previousFollowers: 0 },
    { id: 2, platform: "TikTok", name: "@benabellarealty", status: "Manual tracking", lastSync: "Not connected", followers: 0, previousFollowers: 0 },
    { id: 3, platform: "Facebook", name: "Benabella Realty", status: "Manual tracking", lastSync: "Not connected", followers: 0, previousFollowers: 0 }
  ]
};

let cloudSync = loadSyncConfig();
let syncTimer = null;
let suppressCloudSave = true;
let firebaseDb = null;
let firebaseAuth = null;
let firebaseUser = null;
let firebaseDocRef = null;
let firebaseUnsubscribe = null;
let firebaseSaveTimer = null;
let socialAutoSyncTimer = null;
let socialAutoSyncSignature = "";
let suppressFirebaseSave = true;
let state = loadState();
normalizeState();
saveState();
suppressCloudSave = false;
suppressFirebaseSave = false;

function loadState() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
    for (const key of legacyStorageKeys) {
      const legacy = localStorage.getItem(key);
      if (legacy) return JSON.parse(legacy);
    }
    return cloneData(emptyData);
  } catch {
    return cloneData(emptyData);
  }
}

function backupStateBeforeReset() {
  const backupKey = `${storageKey}-backup-${new Date().toISOString()}`;
  try {
    localStorage.setItem(backupKey, JSON.stringify(state));
  } catch {
    // Reset can continue even if backup storage is full.
  }
}

function loadSyncConfig() {
  try {
    const stored = localStorage.getItem(syncConfigKey);
    return stored ? JSON.parse(stored) : { enabled: false, workspace: "benabella-realty", secret: "" };
  } catch {
    return { enabled: false, workspace: "benabella-realty", secret: "" };
  }
}

function saveSyncConfig() {
  try {
    localStorage.setItem(syncConfigKey, JSON.stringify(cloudSync));
  } catch {
    // Sync can still be configured again if local storage is blocked.
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The CRM still works if a browser blocks local file storage.
  }
  scheduleCloudSave();
  scheduleFirebaseSave();
}

function resetAllData() {
  backupStateBeforeReset();
  state = cloneData(emptyData);
  try {
    localStorage.removeItem(storageKey);
    legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // The in-memory reset still applies if storage is blocked.
  }
  normalizeState();
  saveState();
}

function exportDataBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `benabella-crm-backup-${iso(today)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizeImportedData(data) {
  const currentState = state;
  state = { ...cloneData(emptyData), ...cloneData(data) };
  normalizeState();
  const imported = cloneData(state);
  state = currentState;
  return imported;
}

function hasCrmData(data) {
  return Boolean(
    data.leads?.length ||
    data.properties?.length ||
    data.owners?.length ||
    data.visits?.length ||
    data.deals?.length ||
    data.socialPosts?.length ||
    data.socialAccounts?.length
  );
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function addImportedItem(collection, item, duplicate) {
  if (duplicate) return duplicate.id;
  const copy = cloneData(item);
  const usedIds = new Set(collection.map((entry) => Number(entry.id)));
  if (!copy.id || usedIds.has(Number(copy.id))) copy.id = nextId(collection);
  collection.push(copy);
  return copy.id;
}

function mergeImportedData(current, incoming) {
  const merged = cloneData(current);
  const ownerMap = new Map();
  const propertyMap = new Map();
  const leadMap = new Map();

  incoming.owners.forEach((owner) => {
    const ownerPhone = cleanPhone(owner.phone);
    const duplicate = merged.owners.find((item) =>
      ownerPhone ? cleanPhone(item.phone) === ownerPhone : item.name?.toLowerCase() === owner.name?.toLowerCase()
    );
    ownerMap.set(owner.id, addImportedItem(merged.owners, owner, duplicate));
  });

  incoming.properties.forEach((property) => {
    const key = `${property.title}|${property.area}|${property.price}`.toLowerCase();
    const duplicate = merged.properties.find((item) => `${item.title}|${item.area}|${item.price}`.toLowerCase() === key);
    const copy = cloneData(property);
    copy.ownerId = ownerMap.get(property.ownerId) || property.ownerId || merged.owners[0]?.id || null;
    propertyMap.set(property.id, addImportedItem(merged.properties, copy, duplicate));
  });

  incoming.leads.forEach((lead) => {
    const leadPhone = cleanPhone(lead.phone);
    const fallback = `${lead.name}|${lead.budget}|${lead.requirement?.area || ""}`.toLowerCase();
    const duplicate = merged.leads.find((item) =>
      leadPhone ? cleanPhone(item.phone) === leadPhone : `${item.name}|${item.budget}|${item.requirement?.area || ""}`.toLowerCase() === fallback
    );
    const copy = cloneData(lead);
    copy.propertyId = propertyMap.get(lead.propertyId) || lead.propertyId || null;
    leadMap.set(lead.id, addImportedItem(merged.leads, copy, duplicate));
  });

  incoming.visits.forEach((visit) => {
    const copy = cloneData(visit);
    copy.leadId = leadMap.get(visit.leadId) || visit.leadId;
    copy.propertyId = propertyMap.get(visit.propertyId) || visit.propertyId;
    const duplicate = merged.visits.find((item) =>
      item.leadId === copy.leadId && item.propertyId === copy.propertyId && item.date === copy.date && item.time === copy.time
    );
    addImportedItem(merged.visits, copy, duplicate);
  });

  incoming.deals.forEach((deal) => {
    const copy = cloneData(deal);
    copy.leadId = leadMap.get(deal.leadId) || deal.leadId;
    copy.propertyId = propertyMap.get(deal.propertyId) || deal.propertyId;
    const duplicate = merged.deals.find((item) =>
      item.leadId === copy.leadId && item.propertyId === copy.propertyId && item.stage === copy.stage
    );
    addImportedItem(merged.deals, copy, duplicate);
  });

  incoming.socialPosts.forEach((post) => {
    const copy = cloneData(post);
    copy.propertyId = propertyMap.get(post.propertyId) || post.propertyId;
    const duplicate = merged.socialPosts.find((item) =>
      item.platform === copy.platform && item.propertyId === copy.propertyId && item.date === copy.date && item.type === copy.type
    );
    addImportedItem(merged.socialPosts, copy, duplicate);
  });

  incoming.socialAccounts.forEach((account) => {
    const duplicate = merged.socialAccounts.find((item) =>
      item.platform === account.platform && item.name?.toLowerCase() === account.name?.toLowerCase()
    );
    addImportedItem(merged.socialAccounts, account, duplicate);
  });

  merged.selectedLeadId = merged.selectedLeadId || leadMap.get(incoming.selectedLeadId) || merged.leads[0]?.id || null;
  merged.selectedPropertyId = merged.selectedPropertyId || propertyMap.get(incoming.selectedPropertyId) || merged.properties[0]?.id || null;
  return merged;
}

function importDataBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = normalizeImportedData(JSON.parse(reader.result));
      state = hasCrmData(state) ? mergeImportedData(state, imported) : imported;
      normalizeState();
      saveState();
      showToast("Backup imported safely");
      render();
    } catch {
      showToast("Backup file not valid");
    }
  };
  reader.readAsText(file);
}

function encodeTransferData() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

function decodeTransferData(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
}

function copyTransferCode() {
  const code = encodeTransferData();
  const box = document.querySelector("#transfer-code");
  box.value = code;
  navigator.clipboard?.writeText(code);
}

function importTransferCode() {
  const code = document.querySelector("#transfer-code").value.trim();
  if (!code) {
    showToast("Paste a transfer code first");
    return;
  }
  try {
    state = decodeTransferData(code);
    normalizeState();
    saveState();
    showToast("Transfer imported");
    render();
  } catch {
    showToast("Transfer code is not valid");
  }
}

function normalizeState() {
  state = state && typeof state === "object" ? state : {};
  state.selectedLeadId = state.selectedLeadId || emptyData.selectedLeadId;
  state.selectedPropertyId = state.selectedPropertyId || emptyData.selectedPropertyId;
  state.leads = Array.isArray(state.leads) ? state.leads : cloneData(emptyData.leads);
  state.properties = Array.isArray(state.properties) ? state.properties : cloneData(emptyData.properties);
  state.owners = Array.isArray(state.owners) ? state.owners : cloneData(emptyData.owners);
  state.visits = Array.isArray(state.visits) ? state.visits : cloneData(emptyData.visits);
  state.deals = Array.isArray(state.deals) ? state.deals : cloneData(emptyData.deals);
  if (!Array.isArray(state.socialPosts)) state.socialPosts = cloneData(emptyData.socialPosts);
  if (!Array.isArray(state.socialAccounts)) state.socialAccounts = cloneData(emptyData.socialAccounts);
  state.socialSync = { ...cloneData(defaultSocialSync), ...(state.socialSync || {}) };
  state.socialSync.enabled = Boolean(state.socialSync.enabled);
  state.socialSync.endpoint = state.socialSync.endpoint || "";
  state.socialSync.intervalMinutes = Math.max(15, Number(state.socialSync.intervalMinutes) || defaultSocialSync.intervalMinutes);
  state.aiAgent = { ...cloneData(defaultAiAgent), ...(state.aiAgent || {}) };
  state.aiAgent.messages = Array.isArray(state.aiAgent.messages) ? state.aiAgent.messages.slice(-20) : [];
  state.aiAgent.endpoint = state.aiAgent.endpoint || "";
  state.aiAgent.enabled = Boolean(state.aiAgent.enabled);
  state.aiAgent.status = state.aiAgent.status || defaultAiAgent.status;
  state.aiAgent.mode = aiAgentModes.includes(state.aiAgent.mode) ? state.aiAgent.mode : "COO Review";

  state.leads.forEach((lead) => {
    const requirement = lead.requirement || {};
    lead.name = lead.name || "New Lead";
    lead.phone = lead.phone || "";
    lead.source = lead.source || "WhatsApp";
    lead.agent = lead.agent || "Ayoub";
    lead.status = lead.status || "New Lead";
    lead.lastReply = lead.lastReply || shift(0);
    lead.nextCall = lead.nextCall || shift(0);
    lead.followUp = lead.followUp || shift(1);
    lead.createdAt = lead.createdAt || shift(0);
    lead.requirement = {
      propertyType: requirement.propertyType || "Apartment",
      purpose: requirement.purpose || "Buy",
      area: requirement.area || "Not set",
      budgetMin: requirement.budgetMin || "",
      budgetMax: requirement.budgetMax || lead.budget || "",
      rooms: requirement.rooms || "Not set",
      surface: requirement.surface || "Not set",
      floor: requirement.floor || "Any floor",
      timeline: requirement.timeline || "Not set",
      financing: requirement.financing || "Not set",
      mustHave: requirement.mustHave || "Not set",
      avoid: requirement.avoid || "Not set",
      notes: requirement.notes || ""
    };
  });

  state.properties.forEach((property) => {
    property.title = property.title || "Property";
    property.type = property.type || "Apartment";
    property.area = property.area || "Agadir";
    property.price = Number(property.price) || 0;
    property.agent = property.agent || "Ayoub";
    property.status = property.status || "Available";
    property.ownerId = property.ownerId || state.owners[0]?.id || 1;
    property.commission = property.commission || { type: "percentage", value: defaultCommissionPercent };
    if (property.commission.type === "percentage" && Number(property.commission.value) === 2.5) {
      property.commission.value = defaultCommissionPercent;
    }
    property.lastPosted = property.lastPosted || shift(-7);
    property.nextRepost = property.nextRepost || shift(0);
    property.platforms = Array.isArray(property.platforms) ? property.platforms : ["Facebook", "Instagram"];
    property.repostStatus = property.repostStatus || "Due today";
    property.docs = Array.isArray(property.docs) ? property.docs : [];
    property.features = property.features || "";
  });

  state.owners.forEach((owner) => {
    owner.propertyIds = Array.isArray(owner.propertyIds) ? owner.propertyIds : [];
    owner.lastContact = owner.lastContact || shift(0);
    owner.askingPrice = Number(owner.askingPrice) || 0;
    owner.lowestPrice = Number(owner.lowestPrice) || 0;
    owner.agreement = owner.agreement || "Not set";
  });

  state.visits.forEach((visit) => {
    visit.date = visit.date || shift(0);
    visit.time = visit.time || "10:00";
    visit.agent = visit.agent || "Ayoub";
    visit.feedback = visit.feedback || "";
    visit.notes = visit.notes || "";
  });

  state.deals.forEach((deal) => {
    deal.agent = deal.agent || "Ayoub";
    deal.platform = deal.platform || "WhatsApp";
    deal.stage = deal.stage || "Hot Lead";
    deal.expectedCommission = Number(deal.expectedCommission) || 0;
  });

  state.socialPosts.forEach((post) => {
    post.platform = post.platform || "Instagram";
    post.propertyId = post.propertyId || state.properties[0]?.id || 1;
    post.agent = post.agent || "Ayoub";
    post.type = post.type || "Listing";
    post.date = post.date || shift(0);
    post.status = post.status || "Scheduled";
    post.externalId = post.externalId || "";
    post.url = post.url || "";
    post.caption = post.caption || socialCaption(propertyById(post.propertyId) || state.properties[0], post.platform, post.type);
    post.metrics = {
      views: Number(post.metrics?.views) || 0,
      likes: Number(post.metrics?.likes) || 0,
      comments: Number(post.metrics?.comments) || 0,
      shares: Number(post.metrics?.shares) || 0,
      saves: Number(post.metrics?.saves) || 0,
      messages: Number(post.metrics?.messages) || 0,
      leads: Number(post.metrics?.leads) || 0
    };
  });

  state.socialAccounts.forEach((account) => {
    account.platform = account.platform || "Instagram";
    account.name = account.name || "@account";
    account.status = account.status || "Manual tracking";
    account.lastSync = account.lastSync || "Not connected";
    account.followers = Number(account.followers) || 0;
    account.previousFollowers = Number(account.previousFollowers) || 0;
  });
}

function daysSince(date) {
  return Math.max(0, Math.floor((new Date(iso(today)) - new Date(date)) / dayMs));
}

function scoreLead(lead) {
  let score = 0;
  if (lead.realisticBudget) score += 18;
  if (lead.buySoon) score += 18;
  const replyDays = daysSince(lead.lastReply);
  if (replyDays <= 1) score += 18;
  else if (replyDays <= 4) score += 10;
  else if (replyDays <= 8) score += 4;
  if (lead.bookedVisit) score += 17;
  if (lead.madeOffer) score += 17;
  score += sourceQuality[lead.source] || 8;
  return Math.min(100, score);
}

function heat(score) {
  if (score >= 75) return { label: "Hot", className: "heat-hot" };
  if (score >= 45) return { label: "Warm", className: "heat-warm" };
  return { label: "Cold", className: "heat-cold" };
}

function filtered(items) {
  const agent = document.querySelector("#agent-filter")?.value || "All";
  const list = Array.isArray(items) ? items : [];
  return agent === "All" ? list : list.filter((item) => item.agent === agent);
}

function leadById(id) {
  return state.leads.find((lead) => lead.id === Number(id));
}

function propertyById(id) {
  return state.properties.find((property) => property.id === Number(id));
}

function ownerById(id) {
  return state.owners.find((owner) => owner.id === Number(id));
}

function render() {
  document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(today);
  renderToday();
  renderSync();
  renderAssistant();
  renderLeads();
  renderProperties();
  renderSocial();
  renderOwners();
  renderVisits();
  renderCommission();
  renderAnalytics();
  configureSocialAutoSync();
}

function renderToday() {
  const todayIso = iso(today);
  const leads = filtered(state.leads);
  const visits = filtered(state.visits);
  const properties = filtered(state.properties);
  const brief = dailyBrief(leads, visits, properties);
  document.querySelector("#today-ai-brief").innerHTML = `
    <div>
      <span class="ai-label">AI Morning Brief</span>
      <strong>${brief.headline}</strong>
      <p>${brief.detail}</p>
    </div>
    <div class="brief-actions">
      ${brief.actions.map((action) => `<span>${action}</span>`).join("")}
    </div>
  `;
  const columns = [
    {
      title: "Calls Today",
      items: leads.filter((lead) => lead.nextCall === todayIso && lead.status !== "Lost").map((lead) => ({
        title: lead.name,
        meta: `${lead.phone} · ${lead.source}`
      }))
    },
    {
      title: "Visits Today",
      items: visits.filter((visit) => visit.date === todayIso).map((visit) => ({
        title: leadById(visit.leadId)?.name || "Lead",
        meta: `${visit.time} · ${propertyById(visit.propertyId)?.title || "Property"}`
      }))
    },
    {
      title: "Social Today",
      items: filtered(state.socialPosts).filter((post) => post.date === todayIso && post.status !== "Published").map((post) => ({
        title: `${post.platform} ${post.type}`,
        meta: `${propertyById(post.propertyId)?.title || "Property"} · ${post.status}`
      }))
    },
    {
      title: "Overdue Follow-ups",
      items: leads.filter((lead) => lead.followUp < todayIso && lead.status !== "Lost").map((lead) => ({
        title: lead.name,
        meta: `${Math.abs(daysSince(lead.followUp))} days late · ${lead.status}`
      }))
    },
    {
      title: "Hot Leads",
      items: leads.filter((lead) => scoreLead(lead) >= 75 && lead.status !== "Lost").map((lead) => ({
        title: lead.name,
        meta: `${scoreLead(lead)}/100 · ${lead.requirement.area}`
      }))
    },
    {
      title: "Needs Reposting",
      items: properties.filter((property) => property.nextRepost <= todayIso && property.status === "Available").map((property) => ({
        title: property.title,
        meta: property.platforms.join(", ")
      }))
    }
  ];

  document.querySelector("#today-grid").innerHTML = columns.map((column) => `
    <article class="focus-column">
      <div class="focus-title"><h3>${column.title}</h3><span class="count">${column.items.length}</span></div>
      <div class="task-list">
        ${column.items.length ? column.items.map((item) => `
          <div class="task-item"><strong>${item.title}</strong><span class="card-meta">${item.meta}</span></div>
        `).join("") : `<div class="task-item"><strong>Empty</strong><span class="card-meta">Add your real data.</span></div>`}
      </div>
    </article>
  `).join("");
}

function renderSync() {
  const workspaceInput = document.querySelector("#sync-workspace");
  const secretInput = document.querySelector("#sync-secret");
  if (!workspaceInput || !secretInput) return;
  if (document.activeElement !== workspaceInput) workspaceInput.value = cloudSync.workspace || "benabella-realty";
  if (document.activeElement !== secretInput && cloudSync.secret) secretInput.value = cloudSync.secret;
  document.querySelector("#sync-status").textContent = cloudSync.enabled ? "Cloud sync connected" : "Local only";
  document.querySelector("#sync-detail").textContent = cloudSync.enabled
    ? `Workspace: ${cloudSync.workspace}. Changes save locally and sync to the shared database.`
    : "This device is saving only in this browser. Connect cloud sync to share data across phone and computer.";

  const firebaseStatus = document.querySelector("#firebase-status");
  const firebaseDetail = document.querySelector("#firebase-detail");
  if (!firebaseConfigAvailable()) {
    firebaseStatus.textContent = "Firebase not configured";
    firebaseDetail.textContent = "Add your Firebase config once, then login here on phone and computer for automatic shared data.";
  } else if (firebaseUser) {
    firebaseStatus.textContent = "Automatic sync is on";
    firebaseDetail.textContent = `Logged in as ${firebaseUser.email}. Every change saves to the shared CRM automatically.`;
  } else {
    firebaseStatus.textContent = "Log in once to sync";
    firebaseDetail.textContent = "Use the Firebase email/password you created. The browser will remember it.";
  }
}

function renderAssistant() {
  const context = mentorContext();
  document.querySelector("#ai-command-center").innerHTML = commandCenterHtml(context);
  document.querySelector("#ai-agent-mode").value = state.aiAgent.mode || "COO Review";
  renderAiAgentSettings();
  document.querySelector("#assistant-answer").innerHTML = agentChatHtml();
  document.querySelector("#ai-risk-board").innerHTML = riskBoardHtml(context);
  document.querySelector("#ai-lost-board").innerHTML = lostBoardHtml();

  document.querySelector("#ai-match-board").innerHTML = bestLeadPropertyPairs().map((pair) => `
    <article class="match-card">
      <div class="score-ring" style="--score:${pair.score}"><span>${pair.score}</span></div>
      <div>
        <strong>${pair.lead.name}</strong>
        <p class="card-meta">${pair.lead.requirement.area} · ${budgetText(pair.lead.requirement)}</p>
        <p>${pair.property.title}</p>
        <p class="match-reason">${pair.reasons.slice(0, 2).join(" · ")}</p>
      </div>
    </article>
  `).join("");
}

function renderAiAgentSettings() {
  const endpointInput = document.querySelector("#ai-agent-endpoint");
  const enabledInput = document.querySelector("#ai-agent-enabled");
  const status = document.querySelector("#ai-agent-status");
  if (!endpointInput || !enabledInput || !status) return;
  if (document.activeElement !== endpointInput) endpointInput.value = state.aiAgent.endpoint || "";
  enabledInput.checked = Boolean(state.aiAgent.enabled);
  status.textContent = state.aiAgent.enabled && state.aiAgent.endpoint
    ? state.aiAgent.status || "Real AI ready"
    : "Local CRM brain";
}

function renderLeads() {
  const leads = filtered(state.leads);
  if (!leadById(state.selectedLeadId) && leads[0]) state.selectedLeadId = leads[0].id;
  document.querySelector("#lead-list").innerHTML = leads.map((lead) => {
    const score = scoreLead(lead);
    const heatInfo = heat(score);
    return `
      <button class="lead-row ${lead.id === state.selectedLeadId ? "active" : ""}" data-lead-id="${lead.id}" type="button">
        <strong>${lead.name}</strong>
        <span class="card-meta">${lead.status} · ${lead.requirement.area} · ${lead.requirement.rooms} · ${budgetText(lead.requirement)}</span>
        <span class="card-meta">${lead.source} · ${lead.agent}</span>
        <span class="heat-badge ${heatInfo.className}">${heatInfo.label} ${score}</span>
      </button>
    `;
  }).join("");
  renderLeadDetail();
}

function renderLeadDetail() {
  const lead = leadById(state.selectedLeadId) || filtered(state.leads)[0];
  if (!lead) {
    document.querySelector("#lead-detail").innerHTML = "<p>No leads yet.</p>";
    return;
  }
  const score = scoreLead(lead);
  const heatInfo = heat(score);
  const property = propertyById(lead.propertyId);
  const requirement = lead.requirement;
  document.querySelector("#lead-detail").innerHTML = `
    <div class="topbar">
      <div>
        <h2>${lead.name}</h2>
        <p class="card-meta">${lead.phone} · ${lead.agent} · ${lead.source}</p>
      </div>
      <div class="detail-actions">
        <span class="heat-badge ${heatInfo.className}">${heatInfo.label} ${score}/100</span>
        <button class="danger-action" data-delete-lead="${lead.id}" type="button">Delete</button>
      </div>
    </div>
    <div class="stats-strip">
      <div class="mini-card"><span class="mini-label">Status</span><strong>${lead.status}</strong></div>
      <div class="mini-card"><span class="mini-label">Budget</span><strong>${budgetText(requirement)}</strong></div>
      <div class="mini-card"><span class="mini-label">Area</span><strong>${requirement.area}</strong></div>
      <div class="mini-card"><span class="mini-label">Last Reply</span><strong>${lead.lastReply}</strong></div>
    </div>
    <div class="detail-section ai-insight">
      <div class="score-ring large" style="--score:${score}"><span>${score}</span></div>
      <div>
        <span class="ai-label">AI Lead Coach</span>
        <h3>${nextActionText(lead)}</h3>
        <p>${leadInsightText(lead)}</p>
      </div>
    </div>
    <div class="detail-section">
      <h3>AI Property Matches</h3>
      <div class="match-list">
        ${matchPropertiesForLead(lead).slice(0, 3).map((match) => `
          <article class="match-card">
            <div class="score-ring" style="--score:${match.score}"><span>${match.score}</span></div>
            <div>
              <strong>${match.property.title}</strong>
              <p class="card-meta">${match.property.area} · ${money(match.property.price)} · ${match.property.status}</p>
              <p class="match-reason">${match.reasons.join(" · ")}</p>
            </div>
            <button class="tiny-action" data-set-match="${match.property.id}" data-match-lead="${lead.id}" type="button">Use Match</button>
          </article>
        `).join("")}
      </div>
    </div>
    <div class="detail-section">
      <h3>Buyer Requirement Card</h3>
      <div class="requirement-grid">
        <div class="mini-card"><span class="mini-label">Property Type</span><strong>${requirement.propertyType}</strong></div>
        <div class="mini-card"><span class="mini-label">Purpose</span><strong>${requirement.purpose}</strong></div>
        <div class="mini-card"><span class="mini-label">Area Wanted</span><strong>${requirement.area}</strong></div>
        <div class="mini-card"><span class="mini-label">Budget Range</span><strong>${budgetText(requirement)}</strong></div>
        <div class="mini-card"><span class="mini-label">Rooms</span><strong>${requirement.rooms}</strong></div>
        <div class="mini-card"><span class="mini-label">Surface</span><strong>${requirement.surface}</strong></div>
        <div class="mini-card"><span class="mini-label">Floor</span><strong>${requirement.floor}</strong></div>
        <div class="mini-card"><span class="mini-label">Timeline</span><strong>${requirement.timeline}</strong></div>
        <div class="mini-card"><span class="mini-label">Financing</span><strong>${requirement.financing}</strong></div>
        <div class="mini-card"><span class="mini-label">Must-have</span><strong>${requirement.mustHave}</strong></div>
        <div class="mini-card"><span class="mini-label">Avoid</span><strong>${requirement.avoid}</strong></div>
        <div class="mini-card"><span class="mini-label">Match</span><strong>${property ? property.title : "Needs match"}</strong></div>
      </div>
      <form class="requirement-form" data-requirement-lead="${lead.id}">
        <label>
          Property Type
          <select name="propertyType">
            ${["Apartment", "Villa", "Land", "Commercial", "Office"].map((value) => `<option ${requirement.propertyType === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label>
          Purpose
          <select name="purpose">
            ${["Buy", "Rent", "Invest", "Sell own property first"].map((value) => `<option ${requirement.purpose === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label>
          Area Wanted
          <input name="area" value="${requirement.area}" placeholder="Hay Mohammadi, Founty..." />
        </label>
        <label>
          Budget Min
          <input name="budgetMin" type="number" min="0" step="10000" value="${requirement.budgetMin}" placeholder="700000" />
        </label>
        <label>
          Budget Max
          <input name="budgetMax" type="number" min="0" step="10000" value="${requirement.budgetMax}" placeholder="1000000" />
        </label>
        <label>
          Rooms
          <select name="rooms">
            ${["Not set", "Studio", "1 room", "2 rooms", "3 rooms", "4+ rooms"].map((value) => `<option ${requirement.rooms === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label>
          Surface
          <input name="surface" value="${requirement.surface}" placeholder="80-110 m2" />
        </label>
        <label>
          Floor
          <input name="floor" value="${requirement.floor}" placeholder="Low floor, elevator..." />
        </label>
        <label>
          Timeline
          <input name="timeline" value="${requirement.timeline}" placeholder="This month, 3 months..." />
        </label>
        <label>
          Financing
          <input name="financing" value="${requirement.financing}" placeholder="Cash, bank approved..." />
        </label>
        <label>
          Must-have
          <input name="mustHave" value="${requirement.mustHave}" placeholder="Parking, balcony..." />
        </label>
        <label>
          Avoid
          <input name="avoid" value="${requirement.avoid}" placeholder="Ground floor, renovation..." />
        </label>
        <label class="wide-field">
          Notes
          <textarea name="notes" placeholder="Any extra buyer details">${requirement.notes}</textarea>
        </label>
        <button class="primary-action" type="submit">Save Requirements</button>
      </form>
    </div>
    <div class="detail-section">
      <h3>WhatsApp Templates</h3>
      ${templateBlock("lead", lead.id)}
    </div>
    <div class="detail-section">
      <h3>Lost Reason</h3>
      <form class="lost-form" data-lost-lead="${lead.id}">
        <select required aria-label="Lost reason">
          <option value="">Choose reason before marking lost</option>
          ${["price too high", "location", "property condition", "bought elsewhere", "not serious", "no financing", "stopped replying"].map((reason) => `<option ${lead.lostReason === reason ? "selected" : ""}>${reason}</option>`).join("")}
        </select>
        <button class="ghost-action" type="submit">Mark Lead Lost</button>
      </form>
    </div>
  `;
}

function renderProperties() {
  const properties = filtered(state.properties);
  if (!propertyById(state.selectedPropertyId) && properties[0]) state.selectedPropertyId = properties[0].id;
  document.querySelector("#property-list").innerHTML = properties.map((property) => `
    <button class="property-row ${property.id === state.selectedPropertyId ? "active" : ""}" data-property-id="${property.id}" type="button">
      <strong>${property.title}</strong>
      <span class="card-meta">${property.type} · ${property.area} · ${money(property.price)}</span>
      <span class="status-pill">${property.repostStatus}</span>
    </button>
  `).join("");
  renderPropertyDetail();
}

function renderPropertyDetail() {
  const property = propertyById(state.selectedPropertyId) || filtered(state.properties)[0];
  if (!property) {
    document.querySelector("#property-detail").innerHTML = "<p>No properties yet.</p>";
    return;
  }
  const owner = ownerById(property.ownerId);
  document.querySelector("#property-detail").innerHTML = `
    <div class="topbar">
      <div>
        <h2>${property.title}</h2>
        <p class="card-meta">${property.area} · ${property.status} · ${property.agent}</p>
      </div>
      <div class="detail-actions">
        <span class="status-pill">${money(property.price)}</span>
        <button class="danger-action" data-delete-property="${property.id}" type="button">Delete</button>
      </div>
    </div>
    <div class="stats-strip">
      <div class="mini-card"><span class="mini-label">Last Posted</span><strong>${property.lastPosted}</strong></div>
      <div class="mini-card"><span class="mini-label">Next Repost</span><strong>${property.nextRepost}</strong></div>
      <div class="mini-card"><span class="mini-label">Platforms</span><strong>${property.platforms.join(", ")}</strong></div>
      <div class="mini-card"><span class="mini-label">Commission</span><strong>${commissionText(property)}</strong></div>
    </div>
    <div class="detail-section">
      <h3>AI Buyer Matches</h3>
      <div class="match-list compact">
        ${matchLeadsForProperty(property).slice(0, 3).map((match) => `
          <article class="match-card">
            <div class="score-ring" style="--score:${match.score}"><span>${match.score}</span></div>
            <div>
              <strong>${match.lead.name}</strong>
              <p class="card-meta">${match.lead.requirement.area} · ${budgetText(match.lead.requirement)}</p>
              <p class="match-reason">${match.reasons.slice(0, 2).join(" · ")}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
    <div class="detail-section">
      <h3>Owner</h3>
      <div class="mini-card"><strong>${owner?.name || "Unknown owner"}</strong><p class="card-meta">${owner?.phone || ""} · ${owner?.agreement || ""}</p></div>
    </div>
    <div class="detail-section">
      <h3>Private Documents</h3>
      <div class="doc-grid">
        ${["title deed", "owner ID", "floor plan", "mandate/listing agreement", "other documents"].map((label) => `
          <label class="doc-box">
            ${label}
            <input type="file" data-doc-property="${property.id}" data-doc-label="${label}" />
          </label>
        `).join("")}
      </div>
      <p class="card-meta">Private files: ${property.docs.length ? property.docs.join(", ") : "None uploaded"}. Public photos: ${property.publicPhotos}</p>
    </div>
    <div class="detail-section">
      <h3>Marketing Generator</h3>
      <div class="language-toggle">
        <button class="tiny-action" data-lang="French" data-marketing="${property.id}" type="button">French</button>
        <button class="tiny-action" data-lang="Arabic" data-marketing="${property.id}" type="button">Arabic</button>
        <button class="tiny-action" data-lang="English" data-marketing="${property.id}" type="button">English</button>
      </div>
      <div class="marketing-box" id="marketing-box">${marketingText(property, "French")}</div>
    </div>
    <div class="detail-section">
      <h3>WhatsApp Templates</h3>
      ${templateBlock("property", property.id)}
    </div>
  `;
}

function renderOwners() {
  document.querySelector("#owner-grid").innerHTML = state.owners.map((owner) => `
    <article class="owner-card">
      <div class="card-title-row">
        <h3>${owner.name}</h3>
        <button class="danger-action small" data-delete-owner="${owner.id}" type="button">Delete</button>
      </div>
      <p class="card-meta">${owner.phone} · Last contact ${owner.lastContact}</p>
      <div class="price-line"><span>Properties</span><strong>${owner.propertyIds.map((id) => propertyById(id)?.title).filter(Boolean).join(", ")}</strong></div>
      <div class="price-line"><span>Asking price</span><strong>${money(owner.askingPrice)}</strong></div>
      <div class="price-line"><span>Lowest accepted</span><strong>${money(owner.lowestPrice)}</strong></div>
      <div class="price-line"><span>Agreement</span><strong>${owner.agreement}</strong></div>
      <p class="card-meta">${owner.notes}</p>
    </article>
  `).join("");
}

function renderVisits() {
  document.querySelector("#new-visit-lead").innerHTML = state.leads.map((lead) => `<option value="${lead.id}">${lead.name}</option>`).join("");
  document.querySelector("#new-visit-property").innerHTML = state.properties.map((property) => `<option value="${property.id}">${property.title}</option>`).join("");
  if (!document.querySelector("#new-visit-date").value) document.querySelector("#new-visit-date").value = iso(today);
  if (!document.querySelector("#new-visit-time").value) document.querySelector("#new-visit-time").value = "10:00";
  document.querySelector("#visit-grid").innerHTML = filtered(state.visits).map((visit) => `
    <article class="visit-card">
      <div class="card-title-row">
        <h3>${leadById(visit.leadId)?.name || "Lead"}</h3>
        <button class="danger-action small" data-delete-visit="${visit.id}" type="button">Delete</button>
      </div>
      <p class="card-meta">${visit.date} at ${visit.time} · ${propertyById(visit.propertyId)?.title || "Property"}</p>
      <form data-visit-form="${visit.id}">
        <select required>
          <option value="">Choose feedback</option>
          ${["interested", "not interested", "wants second visit", "made offer", "price problem", "condition problem", "location problem"].map((feedback) => `<option ${visit.feedback === feedback ? "selected" : ""}>${feedback}</option>`).join("")}
        </select>
        <textarea placeholder="Visit notes">${visit.notes || ""}</textarea>
        <button class="primary-action" type="submit">Save Feedback</button>
      </form>
    </article>
  `).join("");
}

function renderSocial() {
  const posts = filtered(state.socialPosts).sort((a, b) => new Date(a.date) - new Date(b.date));
  const todayIso = iso(today);
  const scheduledToday = posts.filter((post) => post.date === todayIso && post.status !== "Published").length;
  const publishedWeek = posts.filter((post) => post.status === "Published" && daysSince(post.date) <= 7).length;
  const totalPosts = posts.length;
  const totalFollowers = state.socialAccounts.reduce((total, account) => total + account.followers, 0);
  const followerGrowth = state.socialAccounts.reduce((total, account) => total + (account.followers - account.previousFollowers), 0);
  const totalLikes = posts.reduce((total, post) => total + post.metrics.likes, 0);
  const totalMessages = posts.reduce((total, post) => total + post.metrics.messages, 0);
  const totalLeads = posts.reduce((total, post) => total + post.metrics.leads, 0);
  const platformStats = socialPlatformStats(posts);
  const bestPlatformName = bestSocialPlatform(platformStats);

  document.querySelector("#social-property").innerHTML = state.properties.map((property) => `
    <option value="${property.id}">${property.title}</option>
  `).join("");
  if (!document.querySelector("#social-date").value) document.querySelector("#social-date").value = todayIso;
  renderSocialSync();
  renderSocialAccounts();

  document.querySelector("#social-metrics").innerHTML = [
    ["Total followers", totalFollowers.toLocaleString("fr-MA")],
    ["Growth this week", signedNumber(followerGrowth)],
    ["Total posts", totalPosts],
    ["Published this week", publishedWeek],
    ["Posts today", scheduledToday],
    ["Total likes", totalLikes.toLocaleString("fr-MA")],
    ["Shares", posts.reduce((total, post) => total + post.metrics.shares, 0).toLocaleString("fr-MA")],
    ["Saves", posts.reduce((total, post) => total + post.metrics.saves, 0).toLocaleString("fr-MA")],
    ["Messages", totalMessages],
    ["Leads", totalLeads],
    ["Best platform", bestPlatformName || "None"]
  ].map(([label, value]) => metric(label, value)).join("");

  renderSocialBars("#social-platform-bars", platformStats);
  renderDonut("#social-post-type-donut", groupCount(posts, "type"));

  document.querySelector("#social-grid").innerHTML = posts.map((post) => {
    const property = propertyById(post.propertyId);
    return `
      <article class="social-card">
        <div class="social-card-head">
          <div>
            <span class="platform-pill ${post.platform.toLowerCase()}">${post.platform}</span>
            <h3>${property?.title || "Property post"}</h3>
            <p class="card-meta">${post.type} · ${post.date} · ${post.agent}</p>
          </div>
          <span class="status-pill">${post.status}</span>
        </div>
        <div class="social-caption">${post.caption}</div>
        <div class="social-stats">
          <span><strong>${post.metrics.views}</strong> views</span>
          <span><strong>${post.metrics.likes}</strong> likes</span>
          <span><strong>${post.metrics.comments}</strong> comments</span>
          <span><strong>${post.metrics.shares}</strong> shares</span>
          <span><strong>${post.metrics.saves}</strong> saves</span>
          <span><strong>${post.metrics.messages}</strong> messages</span>
          <span><strong>${post.metrics.leads}</strong> leads</span>
        </div>
        <form class="social-metrics-form" data-social-metrics="${post.id}">
          <label>Views<input name="views" type="number" min="0" value="${post.metrics.views}" /></label>
          <label>Likes<input name="likes" type="number" min="0" value="${post.metrics.likes}" /></label>
          <label>Comments<input name="comments" type="number" min="0" value="${post.metrics.comments}" /></label>
          <label>Shares<input name="shares" type="number" min="0" value="${post.metrics.shares}" /></label>
          <label>Saves<input name="saves" type="number" min="0" value="${post.metrics.saves}" /></label>
          <label>Messages<input name="messages" type="number" min="0" value="${post.metrics.messages}" /></label>
          <label>Leads<input name="leads" type="number" min="0" value="${post.metrics.leads}" /></label>
          <button class="ghost-action" type="submit">Save</button>
        </form>
        <div class="template-controls social-actions">
          <button class="tiny-action" data-copy-social="${post.id}" type="button">Copy Caption</button>
          <button class="tiny-action" data-social-posted="${post.id}" type="button">Mark Posted</button>
          <button class="danger-action small" data-delete-social="${post.id}" type="button">Delete</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderSocialSync() {
  const endpointInput = document.querySelector("#social-sync-endpoint");
  const enabledInput = document.querySelector("#social-sync-enabled");
  const intervalInput = document.querySelector("#social-sync-interval");
  const status = document.querySelector("#social-sync-status");
  if (!endpointInput || !enabledInput || !intervalInput || !status) return;

  endpointInput.value = state.socialSync.endpoint || "";
  enabledInput.checked = Boolean(state.socialSync.enabled);
  intervalInput.value = state.socialSync.intervalMinutes || 60;
  status.textContent = state.socialSync.enabled && state.socialSync.endpoint
    ? `${state.socialSync.status || "Automatic tracking ready"} · Last sync ${state.socialSync.lastSync || "Never"}`
    : "Not connected";
}

function renderSocialAccounts() {
  document.querySelector("#social-account-grid").innerHTML = state.socialAccounts.length ? state.socialAccounts.map((account) => {
    const stats = socialStatsForPlatform(account.platform);
    const growth = account.followers - account.previousFollowers;
    return `
    <article class="account-card social-account-card">
      <div>
        <span class="platform-pill ${account.platform.toLowerCase()}">${account.platform}</span>
        <strong>${account.name}</strong>
        <p class="card-meta">${account.status} · ${account.lastSync}</p>
      </div>
      <div class="social-stats account-stats">
        <span><strong>${account.followers.toLocaleString("fr-MA")}</strong> followers</span>
        <span><strong>${signedNumber(growth)}</strong> growth</span>
        <span><strong>${stats.posts}</strong> posts</span>
        <span><strong>${stats.likes.toLocaleString("fr-MA")}</strong> likes</span>
        <span><strong>${stats.shares.toLocaleString("fr-MA")}</strong> shares</span>
        <span><strong>${stats.saves.toLocaleString("fr-MA")}</strong> saves</span>
        <span><strong>${stats.messages}</strong> messages</span>
        <span><strong>${stats.leads}</strong> leads</span>
      </div>
      <form class="social-account-metrics-form" data-social-account-metrics="${account.id}">
        <label>Followers Now<input name="followers" type="number" min="0" value="${account.followers}" /></label>
        <label>Last Week<input name="previousFollowers" type="number" min="0" value="${account.previousFollowers}" /></label>
        <button class="ghost-action" type="submit">Save Numbers</button>
      </form>
      <button class="danger-action small" data-delete-social-account="${account.id}" type="button">Delete</button>
    </article>
  `;
  }).join("") : `<p class="card-meta">No accounts saved yet.</p>`;
}

function renderCommission() {
  const activeNegotiations = state.deals.filter((deal) => deal.stage === "Negotiation");
  const hotLeadDeals = state.deals.filter((deal) => deal.stage === "Hot Lead");
  const closedMonth = state.deals.filter((deal) => deal.stage === "Closed" && sameMonth(deal.closedDate));
  const metrics = [
    ["Active negotiations", sum(activeNegotiations, "expectedCommission")],
    ["Possible from hot leads", sum(hotLeadDeals, "expectedCommission")],
    ["Closed this month", sum(closedMonth, "expectedCommission")],
    ["Average deal value", state.deals.length ? sum(state.deals, "expectedCommission") / state.deals.length : 0]
  ];
  document.querySelector("#commission-metrics").innerHTML = metrics.map(([label, value]) => metric(label, money(value))).join("");
  renderPipelineShape();
  renderBars("#commission-agents", groupSum(state.deals, "agent", "expectedCommission"));
  renderBars("#commission-platforms", groupSum(state.deals, "platform", "expectedCommission"));
}

function renderAnalytics() {
  const leadsWeek = state.leads.filter((lead) => daysSince(lead.createdAt) <= 7).length;
  const visitsWeek = state.visits.filter((visit) => daysSince(visit.date) <= 7).length;
  const offersMonth = state.leads.filter((lead) => lead.madeOffer && sameMonth(lead.lastReply)).length;
  const closedDeals = state.deals.filter((deal) => deal.stage === "Closed" && sameMonth(deal.closedDate)).length;
  const bestSource = topValue(state.leads, "source");
  const bestArea = topValue(state.properties, "area");
  const topLost = topValue(state.leads.filter((lead) => lead.lostReason), "lostReason");
  const metrics = [
    ["Leads this week", leadsWeek],
    ["Visits this week", visitsWeek],
    ["Offers this month", offersMonth],
    ["Closed deals this month", closedDeals],
    ["Best lead source", bestSource || "None"],
    ["Best property area", bestArea || "None"],
    ["Top lost reason", topLost || "None"],
    ["Lead to visit avg", "5 days"],
    ["Visit to offer avg", "2 days"]
  ];
  document.querySelector("#analytics-metrics").innerHTML = metrics.map(([label, value]) => metric(label, value)).join("");
  renderDonut("#source-donut", groupCount(state.leads, "source"));
  renderDonut("#area-donut", groupCount(state.properties, "area"));
  renderBars("#lost-reasons", groupCount(state.leads.filter((lead) => lead.lostReason), "lostReason"));
}

function templateBlock(kind, id) {
  return `
    <div class="template-controls">
      ${["first reply", "follow-up after visit", "new matching property", "price negotiation", "owner follow-up"].map((name) => `
        <button class="tiny-action" data-template-kind="${kind}" data-template-id="${id}" data-template="${name}" type="button">${name}</button>
      `).join("")}
    </div>
    <div class="template-box" id="${kind}-template-box">${templateText(kind, id, "first reply")}</div>
    <div class="template-controls">
      <button class="ghost-action" data-copy-template="${kind}" type="button">Copy</button>
      <a class="whatsapp-action" data-open-whatsapp="${kind}" href="${whatsappHref(templateText(kind, id, "first reply"))}" target="_blank" rel="noreferrer">Open WhatsApp</a>
    </div>
  `;
}

function templateText(kind, id, template) {
  const lead = kind === "lead" ? leadById(id) : state.leads.find((item) => item.propertyId === Number(id)) || state.leads[0];
  const property = kind === "property" ? propertyById(id) : propertyById(lead?.propertyId);
  const owner = property ? ownerById(property.ownerId) : null;
  const name = lead?.name || "there";
  const propertyTitle = property?.title || "a matching property";
  const texts = {
    "first reply": `Bonjour ${name}, this is Benabella Realty in Agadir. I received your request and can help you find the right property. What is your ideal area and budget?`,
    "follow-up after visit": `Bonjour ${name}, thank you for visiting ${propertyTitle}. What did you think about the price, location, and condition?`,
    "new matching property": `Bonjour ${name}, I found a property that matches your request: ${propertyTitle}, ${property?.area || "Agadir"}, ${property ? money(property.price) : ""}. Would you like details?`,
    "price negotiation": `Bonjour ${name}, the owner may consider a serious offer on ${propertyTitle}. What is your best offer so I can negotiate clearly?`,
    "owner follow-up": `Bonjour ${owner?.name || "Owner"}, this is Benabella Realty. We are following up about ${propertyTitle}. Is the price still ${property ? money(property.price) : "the same"} and is the listing still available?`
  };
  return texts[template];
}

function whatsappHref(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function marketingText(property, language) {
  const shared = `${property.title} · ${property.area} · ${money(property.price)} · ${property.features}`;
  if (language === "Arabic") return `فرصة عقارية في أكادير: ${shared}\nتواصلوا مع Benabella Realty للحصول على التفاصيل وترتيب زيارة.`;
  if (language === "English") return `${shared}\nA clean Benabella Realty listing for buyers looking in Agadir and nearby areas. Contact us to book a visit.`;
  return `${shared}\nAnnonce Benabella Realty: bien situe, dossier clair, visite disponible sur rendez-vous.`;
}

function commissionText(property) {
  const commission = property.commission || { type: "percentage", value: defaultCommissionPercent };
  if (commission.type === "fixed") return money(commission.value);
  return `${commission.value || 0}%`;
}

function budgetText(requirement) {
  const min = Number(requirement.budgetMin);
  const max = Number(requirement.budgetMax);
  if (min && max) return `${money(min)} - ${money(max)}`;
  if (max) return `Up to ${money(max)}`;
  if (min) return `From ${money(min)}`;
  return "Not set";
}

function dailyBrief(leads, visits, properties) {
  const todayIso = iso(today);
  const activeLeads = leads.filter((lead) => lead.status !== "Lost");
  const topLead = activeLeads.sort((a, b) => scoreLead(b) - scoreLead(a))[0];
  const dueReposts = properties.filter((property) => property.nextRepost <= todayIso && property.status === "Available");
  const socialToday = filtered(state.socialPosts).filter((post) => post.date === todayIso && post.status !== "Published");
  const overdue = activeLeads.filter((lead) => lead.followUp < todayIso);
  const todayVisits = visits.filter((visit) => visit.date === todayIso);
  const headline = topLead
    ? `${topLead.name} is today's best opportunity`
    : "Add a lead to start the day";
  const detail = topLead
    ? `${heat(scoreLead(topLead)).label} lead, ${scoreLead(topLead)}/100. ${nextActionText(topLead)}`
    : "The assistant will prioritize calls, visits, reposts, and matching when leads are added.";
  const actions = [
    `${todayVisits.length} visits today`,
    `${overdue.length} overdue follow-ups`,
    `${socialToday.length} social posts`,
    `${dueReposts.length} reposts due`
  ];
  return { headline, detail, actions };
}

function aiRecommendations(leads, visits, properties) {
  const todayIso = iso(today);
  const activeLeads = leads.filter((lead) => lead.status !== "Lost");
  const topLead = [...activeLeads].sort((a, b) => scoreLead(b) - scoreLead(a))[0];
  const dueRepost = properties.find((property) => property.nextRepost <= todayIso && property.status === "Available");
  const socialPost = filtered(state.socialPosts).find((post) => post.date === todayIso && post.status !== "Published");
  const visit = visits.find((item) => item.date === todayIso);
  const staleOwner = state.owners.find((owner) => daysSince(owner.lastContact) >= 7);
  return [
    topLead && {
      label: "Call first",
      title: topLead.name,
      detail: `${scoreLead(topLead)}/100 heat score. ${topLead.requirement.area}, ${budgetText(topLead.requirement)}.`
    },
    visit && {
      label: "Visit prep",
      title: leadById(visit.leadId)?.name || "Lead visit",
      detail: `Prepare objections for ${propertyById(visit.propertyId)?.title || "the property"} at ${visit.time}.`
    },
    dueRepost && {
      label: "Repost",
      title: dueRepost.title,
      detail: `Due on ${dueRepost.platforms.join(", ")}. Refresh headline and first photo.`
    },
    socialPost && {
      label: "Social",
      title: `${socialPost.platform} ${socialPost.type}`,
      detail: `${propertyById(socialPost.propertyId)?.title || "Property"} is scheduled today. Copy caption and publish.`
    },
    staleOwner && {
      label: "Inventory",
      title: staleOwner.name,
      detail: `Last contact ${staleOwner.lastContact}. Confirm price and mandate status.`
    }
  ].filter(Boolean).slice(0, 4);
}

function nextActionText(lead) {
  if (lead.madeOffer) return "Push negotiation today";
  if (lead.bookedVisit) return "Confirm visit and prepare objections";
  if (lead.followUp < iso(today)) return "Follow up now";
  if (daysSince(lead.lastReply) > 4) return "Send a short reactivation message";
  if (scoreLead(lead) >= 75) return "Send best matching property";
  return "Qualify budget, area, and timeline";
}

function leadInsightText(lead) {
  const reasons = heatReasons(lead);
  return `${reasons.join(" ")} Need: ${lead.requirement.propertyType}, ${lead.requirement.area}, ${lead.requirement.rooms}, ${budgetText(lead.requirement)}.`;
}

function heatReasons(lead) {
  const reasons = [];
  if (lead.realisticBudget) reasons.push("Budget looks usable.");
  if (lead.buySoon) reasons.push("Timeline is soon.");
  if (daysSince(lead.lastReply) <= 1) reasons.push("Replied recently.");
  if (lead.bookedVisit) reasons.push("Visit booked.");
  if (lead.madeOffer) reasons.push("Offer made.");
  if (!reasons.length) reasons.push("Needs qualification before it becomes warm.");
  return reasons;
}

function bestLeadPropertyPairs() {
  return filtered(state.leads)
    .filter((lead) => lead.status !== "Lost")
    .map((lead) => {
      const match = matchPropertiesForLead(lead)[0];
      return match && { lead, property: match.property, score: match.score, reasons: match.reasons };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function matchLeadsForProperty(property) {
  return filtered(state.leads)
    .filter((lead) => lead.status !== "Lost")
    .map((lead) => {
      const match = scorePropertyMatch(lead, property);
      return { lead, score: match.score, reasons: match.reasons };
    })
    .sort((a, b) => b.score - a.score);
}

function matchPropertiesForLead(lead) {
  return state.properties
    .filter((property) => property.status !== "Sold" && property.status !== "Off Market")
    .map((property) => {
      const match = scorePropertyMatch(lead, property);
      return { property, score: match.score, reasons: match.reasons };
    })
    .sort((a, b) => b.score - a.score);
}

function scorePropertyMatch(lead, property) {
  let score = 0;
  const reasons = [];
  const requirement = lead.requirement;
  const wantedArea = clean(requirement.area);
  const propertyArea = clean(property.area);
  const budgetMin = Number(requirement.budgetMin);
  const budgetMax = Number(requirement.budgetMax);

  if (property.status === "Available") {
    score += 8;
    reasons.push("available");
  } else if (property.status === "Reserved") {
    score += 3;
    reasons.push("reserved but relevant");
  }

  if (requirement.propertyType === property.type) {
    score += 16;
    reasons.push("right type");
  }

  if (wantedArea === "not set") {
    score += 8;
    reasons.push("area open");
  } else if (wantedArea.includes(propertyArea) || propertyArea.includes(wantedArea)) {
    score += 28;
    reasons.push("area match");
  }

  if (!budgetMin && !budgetMax) {
    score += 8;
    reasons.push("budget open");
  } else if ((!budgetMin || property.price >= budgetMin * 0.9) && (!budgetMax || property.price <= budgetMax)) {
    score += 28;
    reasons.push("inside budget");
  } else if (budgetMax && property.price <= budgetMax * 1.1) {
    score += 16;
    reasons.push("near budget");
  } else if (budgetMax && property.price > budgetMax) {
    reasons.push("over budget");
  }

  const wantedRooms = firstNumber(requirement.rooms);
  const propertyRooms = firstNumber(property.features);
  if (!wantedRooms) {
    score += 5;
  } else if (wantedRooms && propertyRooms && wantedRooms === propertyRooms) {
    score += 12;
    reasons.push("rooms match");
  }

  const featureText = clean(`${property.title} ${property.features}`);
  const mustHaveMatches = clean(requirement.mustHave)
    .split(/[, ]+/)
    .filter((word) => word.length > 3 && featureText.includes(word))
    .slice(0, 3);
  if (mustHaveMatches.length) {
    score += mustHaveMatches.length * 4;
    reasons.push(`has ${mustHaveMatches.join(", ")}`);
  }

  score += Math.round(scoreLead(lead) * 0.08);
  return { score: Math.min(100, score), reasons: reasons.slice(0, 4) };
}

function mentorContext() {
  const todayIso = iso(today);
  const leads = filtered(state.leads).filter((lead) => lead.status !== "Lost");
  const properties = filtered(state.properties);
  const visits = filtered(state.visits);
  const hotLeads = [...leads].sort((a, b) => scoreLead(b) - scoreLead(a)).slice(0, 3);
  const overdue = leads.filter((lead) => lead.followUp < todayIso);
  const visitsToday = visits.filter((visit) => visit.date === todayIso);
  const offers = leads.filter((lead) => lead.madeOffer || lead.status === "Offer Made" || lead.status === "Negotiation");
  const dueReposts = properties.filter((property) => property.status === "Available" && property.nextRepost <= todayIso);
  const bestPair = bestLeadPropertyPairs()[0];
  const staleOwner = state.owners.find((owner) => daysSince(owner.lastContact) >= 7);
  const socialStats = socialPlatformStats(filtered(state.socialPosts));
  const bestPlatform = bestSocialPlatform(socialStats) || "No clear winner yet";
  const activeCommission = sum(state.deals.filter((deal) => deal.stage === "Negotiation"), "expectedCommission");
  const hotCommission = sum(state.deals.filter((deal) => deal.stage === "Hot Lead"), "expectedCommission");
  const closedMonth = state.deals.filter((deal) => deal.stage === "Closed" && sameMonth(deal.closedDate));
  const activeOwners = state.owners.filter((owner) => owner.agreement !== "Lost" && owner.agreement !== "Stopped");
  const negotiations = state.deals.filter((deal) => deal.stage === "Negotiation").length + leads.filter((lead) => lead.status === "Negotiation").length;

  return { todayIso, leads, properties, visitsToday, hotLeads, overdue, offers, dueReposts, bestPair, staleOwner, bestPlatform, activeCommission, hotCommission, closedMonth, activeOwners, negotiations };
}

function buyerSeriousnessScore(lead) {
  let score = 1;
  if (Number(lead.budget) || Number(lead.requirement?.budgetMax)) score += 1;
  if (lead.realisticBudget) score += 1;
  if (lead.requirement?.financing && lead.requirement.financing !== "Not set") score += 1;
  if (lead.buySoon || /week|month|soon|urgent|now/i.test(lead.requirement?.timeline || "")) score += 1;
  if (lead.bookedVisit) score += 1;
  if (daysSince(lead.lastReply) <= 3) score += 1;
  if (lead.status === "Visit Booked" || lead.status === "Interested") score += 1;
  if (lead.madeOffer || lead.status === "Offer Made" || lead.status === "Negotiation") score += 2;
  return Math.min(10, score);
}

function seriousnessLabel(score, type = "buyer") {
  if (score <= 3) return type === "owner" ? "Difficult owner" : "Low quality lead";
  if (score <= 6) return type === "owner" ? "Average owner" : "Medium quality lead";
  if (score <= 8) return type === "owner" ? "Serious seller" : "Serious buyer";
  return type === "owner" ? "Priority listing" : "High-priority buyer";
}

function ownerSeriousnessScore(owner) {
  const properties = state.properties.filter((property) => property.ownerId === owner.id || owner.propertyIds?.includes(property.id));
  let score = 1;
  if (owner.askingPrice && owner.lowestPrice && owner.lowestPrice <= owner.askingPrice) score += 2;
  if (/exclusive|signed/i.test(owner.agreement || "")) score += 2;
  else if (/mandate|draft|non-exclusive/i.test(owner.agreement || "")) score += 1;
  if (daysSince(owner.lastContact) <= 3) score += 1;
  if (properties.some((property) => property.status === "Available")) score += 1;
  if (owner.notes && owner.notes.length > 8) score += 1;
  if (properties.some((property) => property.docs?.length)) score += 1;
  if (properties.some((property) => property.publicPhotos >= 5)) score += 1;
  return Math.min(10, score);
}

function propertyEvaluation(property) {
  let score = 0;
  const reasons = [];
  const demandLeads = state.leads.filter((lead) => clean(lead.requirement?.area).includes(clean(property.area)) || clean(property.area).includes(clean(lead.requirement?.area))).length;
  if (property.status === "Available") score += 12;
  if (demandLeads) {
    score += Math.min(20, demandLeads * 5);
    reasons.push(`${demandLeads} buyer matches`);
  }
  if (property.price > 0) score += 12;
  if (property.publicPhotos >= 6) {
    score += 12;
    reasons.push("good photo count");
  } else {
    reasons.push("needs better photos");
  }
  if (/elevator|parking|balcony|sunny|modern|beach|commercial/i.test(property.features || "")) score += 14;
  if (property.nextRepost <= iso(today)) reasons.push("needs reposting");
  if (property.docs?.length) score += 10;
  if (property.platforms?.length >= 3) score += 10;
  score += Math.min(20, Math.max(0, 20 - daysSince(property.lastPosted)));
  return {
    score: Math.min(100, score),
    demand: score >= 75 ? "High demand potential" : score >= 50 ? "Medium demand" : "Needs improvement",
    reasons
  };
}

function agencyMetrics(context = mentorContext()) {
  return {
    activeBuyers: context.leads.length,
    activeSellers: context.activeOwners.length,
    listings: context.properties.length,
    visitsToday: context.visitsToday.length,
    followUpsDue: context.overdue.length,
    negotiations: context.negotiations,
    offers: context.offers.length,
    closedDeals: context.closedMonth.length
  };
}

function commandCenterHtml(context) {
  const metrics = agencyMetrics(context);
  const biggestOpportunity = context.bestPair
    ? `${context.bestPair.lead.name} + ${context.bestPair.property.title} (${context.bestPair.score}/100 match)`
    : context.hotLeads[0]?.name || "Add qualified buyers";
  const biggestProblem = context.overdue.length
    ? `${context.overdue.length} overdue follow-ups`
    : context.dueReposts.length
      ? `${context.dueReposts.length} stale listings need reposting`
      : "No major bottleneck detected";
  const highestPriority = actionList(context, "daily business review")[0];

  return `
    <span class="ai-label">Benabella AI Agent</span>
    <h3>Daily Business Review</h3>
    <div class="agent-command-grid">
      ${Object.entries(metrics).map(([key, value]) => `
        <article class="agent-kpi">
          <span>${humanizeKey(key)}</span>
          <strong>${value}</strong>
        </article>
      `).join("")}
    </div>
    <div class="mentor-section">
      <strong>Biggest opportunity</strong>
      <p>${biggestOpportunity}</p>
    </div>
    <div class="mentor-section">
      <strong>Biggest problem</strong>
      <p>${biggestProblem}</p>
    </div>
    <div class="mentor-section">
      <strong>Highest priority action</strong>
      <p>${highestPriority}</p>
    </div>
  `;
}

function riskBoardHtml(context) {
  const buyerRows = [...context.leads]
    .sort((a, b) => buyerSeriousnessScore(b) - buyerSeriousnessScore(a))
    .slice(0, 4)
    .map((lead) => `<article class="agent-kpi"><span>${seriousnessLabel(buyerSeriousnessScore(lead))}</span><strong>${lead.name}</strong><p>${buyerSeriousnessScore(lead)}/10 · ${lead.requirement.area} · ${budgetText(lead.requirement)}</p></article>`)
    .join("");
  const propertyRows = [...context.properties]
    .sort((a, b) => propertyEvaluation(b).score - propertyEvaluation(a).score)
    .slice(0, 4)
    .map((property) => {
      const evaluation = propertyEvaluation(property);
      return `<article class="agent-kpi"><span>${evaluation.demand}</span><strong>${property.title}</strong><p>${evaluation.score}/100 · ${property.area} · ${evaluation.reasons.join(", ") || "clean listing"}</p></article>`;
    })
    .join("");

  return `
    <div class="quality-grid">${buyerRows || `<p class="card-meta">No buyers yet.</p>`}</div>
    <h4>Property evaluation</h4>
    <div class="quality-grid">${propertyRows || `<p class="card-meta">No listings yet.</p>`}</div>
  `;
}

function lostBoardHtml() {
  const lostLeads = state.leads.filter((lead) => lead.status === "Lost" || lead.lostReason);
  const reasons = groupCount(lostLeads, "lostReason");
  const entries = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return `<p class="card-meta">No lost reasons yet. When a deal is lost, record the reason so the agency learns.</p>`;
  return `
    <div class="agent-list">
      ${entries.map(([reason, count]) => `
        <article class="agent-kpi">
          <span>${count} lost</span>
          <strong>${reason || "No reason"}</strong>
          <p>${lostReasonAdvice(reason)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function lostReasonAdvice(reason) {
  const text = clean(reason);
  if (text.includes("price")) return "Improve owner price discipline and show comparable alternatives before visits.";
  if (text.includes("location")) return "Qualify exact area boundaries before sending listings.";
  if (text.includes("condition")) return "Send honest photos/videos before booking the visit.";
  if (text.includes("financing")) return "Confirm financing before spending time on premium listings.";
  if (text.includes("reply")) return "Move non-responsive buyers to low priority after two follow-ups.";
  return "Ask the buyer what blocked the decision and update the requirement card.";
}

function humanizeKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function actionList(context, question) {
  const text = clean(question);
  const lead = context.hotLeads[0];
  const actions = [];

  if (text.includes("close") || text.includes("deal") || text.includes("commission")) {
    if (context.offers[0]) actions.push(`Call ${context.offers[0].name} and ask for a clear yes/no buying position today.`);
    if (context.bestPair) actions.push(`Send ${context.bestPair.property.title} to ${context.bestPair.lead.name} with one direct visit question.`);
    actions.push("Move every serious buyer to one next step: visit, offer, or lost reason.");
    actions.push("Do not spend the morning chatting with cold leads until hot leads are handled.");
    return actions;
  }

  if (text.includes("social") || text.includes("post") || text.includes("tiktok") || text.includes("instagram") || text.includes("facebook")) {
    if (context.dueReposts[0]) actions.push(`Post ${context.dueReposts[0].title} first on Avito, Facebook, Instagram, and TikTok.`);
    actions.push("Use one property video, one price/location story, and one WhatsApp call-to-action.");
    actions.push(`Watch ${context.bestPlatform} first because it is currently the best signal in the CRM.`);
    actions.push("After posting, enter views, likes, shares, saves, messages, and leads before the end of the day.");
    return actions;
  }

  if (text.includes("owner") || text.includes("inventory") || text.includes("mandate")) {
    if (context.staleOwner) actions.push(`Call ${context.staleOwner.name}: confirm asking price, lowest accepted price, and mandate status.`);
    actions.push("Ask each owner for one missing document or one better photo set.");
    actions.push("Push owners to give you a realistic price before you spend money or time reposting.");
    return actions;
  }

  if (lead) actions.push(`Call ${lead.name} first. Score: ${scoreLead(lead)}/100. Goal: ${nextActionText(lead).toLowerCase()}.`);
  if (context.bestPair) actions.push(`Send ${context.bestPair.property.title} to ${context.bestPair.lead.name}; match score ${context.bestPair.score}/100.`);
  if (context.visitsToday[0]) actions.push(`Prepare the visit with ${leadById(context.visitsToday[0].leadId)?.name || "the buyer"}: price, condition, location objections.`);
  if (context.overdue[0]) actions.push(`Clear overdue follow-up with ${context.overdue[0].name}; do not let it age another day.`);
  if (context.dueReposts[0]) actions.push(`Repost ${context.dueReposts[0].title}; stale listings lose attention fast.`);
  return actions.length ? actions : ["Add leads with budget, area, rooms, surface, and timeline so the mentor can prioritize properly."];
}

function mentorScript(context, question) {
  const text = clean(question);
  const lead = context.hotLeads[0];
  const pair = context.bestPair;
  const property = pair?.property || (lead ? matchPropertiesForLead(lead)[0]?.property : null);

  if (!lead) return "Start by adding one real buyer lead with phone, budget, area, rooms, surface, and timeline.";

  if (text.includes("owner") || text.includes("inventory") || text.includes("mandate")) {
    return `Bonjour, this is Benabella Realty. I am checking the listing today: is the property still available, what is the real lowest accepted price, and do we have permission to repost it this week?`;
  }

  if (text.includes("negotiate") || text.includes("price")) {
    return `Bonjour ${lead.name}, before I negotiate with the owner, I need your serious best offer and your timing. If the owner accepts, are you ready to move forward?`;
  }

  if (property) {
    return `Bonjour ${lead.name}, I found a property that matches your request: ${property.title} in ${property.area}, price ${money(property.price)}. It fits your area/budget better than most options. Do you want photos or a visit time today?`;
  }

  return `Bonjour ${lead.name}, to help you properly I need three things: exact budget, preferred area, and when you want to buy. Then I will send only matching properties.`;
}

function mentorDiagnosis(context) {
  if (!context.leads.length) return "You need buyer data first. The CRM cannot coach without real leads.";
  if (context.offers.length) return "Your money is closest in offers and negotiations. Protect your morning for closing, not browsing.";
  if (context.hotLeads.length) return "Your best leverage is fast response: call the hottest lead, send one matching property, and ask for a visit.";
  if (context.overdue.length) return "Your pipeline is leaking through late follow-ups. Clean those before creating new work.";
  return "The business needs more qualification: budget, area, rooms, surface, financing, and timeline.";
}

function mentorAnswerHtml(question) {
  const context = mentorContext();
  const actions = actionList(context, question).slice(0, 5);
  const hotLead = context.hotLeads[0];
  const focus = hotLead ? `${hotLead.name} (${scoreLead(hotLead)}/100)` : "Add or qualify leads";
  const commissionLine = context.activeCommission || context.hotCommission
    ? `Negotiations: ${money(context.activeCommission)}. Hot lead potential: ${money(context.hotCommission)}.`
    : "No commission forecast yet. Add active deals when offers or negotiations start.";

  return `
    <div class="assistant-answer-card mentor-answer">
      <div class="mentor-section">
        <span class="ai-label">Professional Mentor</span>
        <strong>Focus now: ${focus}</strong>
        <p>${mentorDiagnosis(context)}</p>
      </div>
      <div class="mentor-section">
        <strong>Do this next</strong>
        <ol>${actions.map((action) => `<li>${action}</li>`).join("")}</ol>
      </div>
      <div class="mentor-section">
        <strong>Message to use</strong>
        <p class="mentor-script">${mentorScript(context, question)}</p>
      </div>
      <div class="mentor-section">
        <strong>Manager note</strong>
        <p>${commissionLine} Visits today: ${context.visitsToday.length}. Overdue follow-ups: ${context.overdue.length}. Reposts due: ${context.dueReposts.length}.</p>
      </div>
    </div>
  `;
}

function agentChatHtml() {
  if (!state.aiAgent.messages.length) {
    return agentResponseHtml("Give me the daily business review and the highest priority action.", state.aiAgent.mode || "COO Review");
  }
  const pairs = [];
  for (let index = 0; index < state.aiAgent.messages.length; index += 2) {
    const first = state.aiAgent.messages[index];
    const second = state.aiAgent.messages[index + 1];
    if (!first) continue;
    const user = first.role === "user" ? first : second;
    const assistant = first.role === "assistant" ? first : second;
    pairs.push({ user, assistant });
  }

  return pairs.reverse().map(({ user, assistant }) => `
    <article class="agent-thread">
      ${user ? `<div class="agent-question-line"><strong>You asked:</strong> ${escapeHtml(user.content)}</div>` : ""}
      ${assistant ? assistant.html : `<p class="card-meta">Thinking...</p>`}
    </article>
  `).join("");
}

function agentResponseHtml(question, mode = "COO Review") {
  const context = mentorContext();
  const text = clean(`${mode} ${question}`);
  const marketProperty = parsePropertyQuestion(question);
  if (marketProperty) return marketPropertyAnswerHtml(marketProperty, question, mode);
  const actions = actionList(context, question).slice(0, 5);
  const metrics = agencyMetrics(context);
  const bestBuyer = context.hotLeads[0];
  const bestOwner = [...state.owners].sort((a, b) => ownerSeriousnessScore(b) - ownerSeriousnessScore(a))[0];
  const bestProperty = [...context.properties].sort((a, b) => propertyEvaluation(b).score - propertyEvaluation(a).score)[0];
  const leadQualityWarning = context.leads.filter((lead) => buyerSeriousnessScore(lead) <= 3).length;

  let strategicAdvice = "Protect the day around revenue actions: serious buyers, visit bookings, offers, owner price correction, and reposting stale listings.";
  if (text.includes("marketing") || text.includes("growth") || text.includes("avito") || text.includes("facebook") || text.includes("tiktok") || text.includes("instagram")) {
    strategicAdvice = `Growth plan: repost ${context.dueReposts[0]?.title || "your best available listing"} with fresh first photo, push one TikTok walkthrough, one Instagram reel, one Facebook Marketplace repost, and one WhatsApp broadcast to warm buyers. Track messages and leads by platform before tonight.`;
  } else if (text.includes("owner") || text.includes("listing")) {
    strategicAdvice = bestOwner
      ? `Owner strategy: prioritize ${bestOwner.name} (${ownerSeriousnessScore(bestOwner)}/10). Push for realistic price, documents, visit access, and exclusive/clear mandate. Weak owners should not consume prime selling time.`
      : "Owner strategy: call owners in Founty, Hay Mohammadi, Salam, Dakhla, Tilila, Charaf, Sonaba, and Anza and ask for realistic-price listings with documents.";
  } else if (text.includes("lost") || text.includes("lose")) {
    strategicAdvice = "Every lost deal must become a lesson: record price, location, condition, financing, not serious, bought elsewhere, or stopped replying. Then fix the qualification question that would have revealed it earlier.";
  } else if (text.includes("market") || text.includes("agadir")) {
    strategicAdvice = "Agadir market play: focus content and prospecting around real buyer demand from your CRM. Segment by area: affordable buyers for Hay Mohammadi/Salam/Dakhla, lifestyle buyers for Founty/Sonaba, inventory growth around Tilila/Charaf/Anza/Ait Melloul.";
  } else if (text.includes("close") || text.includes("negotiation")) {
    strategicAdvice = "Closing plan: stop vague conversations. Every hot buyer needs one concrete next step today: visit time, document request, written offer, or lost reason.";
  }

  return `
    <div class="mentor-answer">
      <div class="mentor-section">
        <span class="ai-label">${mode}</span>
        <strong>Executive decision</strong>
        <p>${strategicAdvice}</p>
      </div>
      <div class="mentor-section">
        <strong>Agency numbers</strong>
        <p>${metrics.activeBuyers} active buyers · ${metrics.activeSellers} active sellers · ${metrics.listings} listings · ${metrics.visitsToday} visits today · ${metrics.followUpsDue} follow-ups due · ${metrics.negotiations} negotiations · ${metrics.offers} offers · ${metrics.closedDeals} closed this month.</p>
      </div>
      <div class="mentor-section">
        <strong>Next best actions</strong>
        <ol>${actions.map((action) => `<li>${action}</li>`).join("")}</ol>
      </div>
      <div class="mentor-section">
        <strong>Quality control</strong>
        <ul>
          <li>Best buyer: ${bestBuyer ? `${bestBuyer.name}, ${buyerSeriousnessScore(bestBuyer)}/10, ${seriousnessLabel(buyerSeriousnessScore(bestBuyer))}` : "No buyer data yet"}</li>
          <li>Best owner: ${bestOwner ? `${bestOwner.name}, ${ownerSeriousnessScore(bestOwner)}/10, ${seriousnessLabel(ownerSeriousnessScore(bestOwner), "owner")}` : "No owner data yet"}</li>
          <li>Best listing: ${bestProperty ? `${bestProperty.title}, ${propertyEvaluation(bestProperty).score}/100, ${propertyEvaluation(bestProperty).demand}` : "No property data yet"}</li>
          <li>Time-waster risk: ${leadQualityWarning} low-quality buyers should be deprioritized.</li>
        </ul>
      </div>
      <div class="mentor-section">
        <strong>Message to send</strong>
        <p class="mentor-script">${mentorScript(context, question)}</p>
      </div>
    </div>
  `;
}

function parsePropertyQuestion(question) {
  const raw = String(question || "");
  const text = clean(raw);
  const priceMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(k|000|mad|dh|dirham|dirhams)/i);
  const surfaceMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|meter|metre|meters|metres|sqm|square)/i);
  const floorMatch = raw.match(/(\d+)(?:st|nd|rd|th)?\s*floor/i);
  const hasPropertyTerms = /apartment|appartment|appartement|apart|apt|flat|studio|villa|property|listing/i.test(raw);
  const hasMarketQuestion = /good|price|worth|market|sell|buy|deal|expensive|cheap|furnished|designed/i.test(raw);
  if (!hasPropertyTerms || !hasMarketQuestion) return null;

  const priceNumber = priceMatch ? Number(priceMatch[1].replace(",", ".")) : 0;
  const price = priceNumber && priceMatch?.[2]?.toLowerCase() === "k" ? priceNumber * 1000 : priceNumber;
  const surface = surfaceMatch ? Number(surfaceMatch[1].replace(",", ".")) : 0;
  const areaAliases = [
    ["Al Marwa, Hay Mohammadi", ["al marwa", "marwa"]],
    ["Hay Mohammadi", ["hay mohammadi", "hay mohmadi", "mohammadi", "mohmadi"]],
    ["Founty", ["founty"]],
    ["Sonaba", ["sonaba"]],
    ["Salam", ["salam"]],
    ["Dakhla", ["dakhla"]],
    ["Tilila", ["tilila"]],
    ["Charaf", ["charaf"]],
    ["Taddart", ["taddart"]],
    ["Ait Melloul", ["ait melloul"]],
    ["Bensergao", ["bensergao"]],
    ["Anza", ["anza"]]
  ];
  const area = areaAliases.find(([, aliases]) => aliases.some((alias) => text.includes(alias)))?.[0] || "Agadir";

  if (!price && !surface) return null;
  return {
    area,
    price,
    surface,
    floor: floorMatch ? Number(floorMatch[1]) : null,
    furnished: /furnished|meuble|meublé|furniture/i.test(raw),
    designed: /designed|design|renovated|modern|good/i.test(raw)
  };
}

function marketPropertyAnswerHtml(property, question, mode) {
  const pricePerM2 = property.price && property.surface ? Math.round(property.price / property.surface) : 0;
  const areaText = clean(property.area);
  const isHayMohammadiArea = areaText.includes("hay mohammadi") || areaText.includes("mohmadi") || areaText.includes("al marwa");
  let verdict = "Potentially good, but verify the building, title, elevator, parking, and comparable sales before accepting the owner price.";
  let listingScore = 55;
  const actions = [];

  if (pricePerM2) {
    if (isHayMohammadiArea && pricePerM2 <= 10500) {
      verdict = "Good inventory candidate if the title is clean and the building is respected.";
      listingScore += 20;
    } else if (isHayMohammadiArea && pricePerM2 <= 12500) {
      verdict = "Yes, it can be a good listing, but it is price-sensitive. At this price it needs elevator/clean building proof, strong photos/video, and negotiation room.";
      listingScore += 10;
    } else if (isHayMohammadiArea) {
      verdict = "Probably expensive for fast resale unless the building, finishing, furniture, elevator, and location are excellent.";
      listingScore -= 5;
    }
  }

  if (property.furnished) listingScore += 8;
  if (property.designed) listingScore += 7;
  if (property.floor && property.floor >= 3) actions.push("Confirm elevator. Third floor without elevator will reduce buyer demand.");
  if (property.price) actions.push(`Do not accept only the owner's ${money(property.price)} number. Ask for the real lowest accepted price and try to create room around ${money(property.price * 0.94)}-${money(property.price * 0.97)} if possible.`);
  actions.push("Before accepting it as priority inventory, check title deed, syndic, building age, elevator, parking, sunlight, and exact street.");
  actions.push("Make one vertical video walkthrough and one carousel showing furniture/design, kitchen, salon, bedrooms, and building entrance.");
  actions.push("Target buyers looking for Hay Mohammadi / Al Marwa, 2-bedroom furnished apartment, ready-to-move.");
  actions.push("Add it to the CRM with area, surface, floor, furnished status, documents, owner lowest price, and next repost date.");

  return `
    <div class="mentor-answer">
      <div class="mentor-section">
        <span class="ai-label">${mode}</span>
        <strong>Direct property verdict</strong>
        <p>${verdict}</p>
      </div>
      <div class="mentor-section">
        <strong>Numbers</strong>
        <p>Area: ${property.area}. Price: ${property.price ? money(property.price) : "not clear"}. Surface: ${property.surface || "not clear"} m2. ${pricePerM2 ? `Price per m2: ${money(pricePerM2)}.` : ""} Floor: ${property.floor || "not clear"}. Furnished/design value: ${property.furnished || property.designed ? "yes" : "not confirmed"}.</p>
      </div>
      <div class="mentor-section">
        <strong>Inventory score</strong>
        <p>${Math.max(1, Math.min(100, listingScore))}/100. This is ${listingScore >= 75 ? "worth pushing hard" : listingScore >= 60 ? "worth testing with good content" : "not priority unless owner negotiates"}.</p>
      </div>
      <div class="mentor-section">
        <strong>COO decision</strong>
        <p>Take the listing if the owner is cooperative and documents are clean. Do not spend heavy marketing energy until elevator/building quality and lowest accepted price are confirmed.</p>
      </div>
      <div class="mentor-section">
        <strong>Next actions</strong>
        <ol>${actions.map((action) => `<li>${action}</li>`).join("")}</ol>
      </div>
      <div class="mentor-section">
        <strong>Owner script</strong>
        <p class="mentor-script">The apartment is attractive, but to sell fast we need the right market price. If we bring serious buyers quickly, what is your real lowest accepted price? Also send title deed, syndic details, and confirm elevator/parking so we can market it professionally.</p>
      </div>
    </div>
  `;
}

function aiAgentPayload() {
  const context = mentorContext();
  return {
    agency: "Benabella Realty",
    location: "Agadir, Morocco",
    currency: "MAD",
    commissionPercent: defaultCommissionPercent,
    metrics: agencyMetrics(context),
    lostReasons: groupCount(state.leads.filter((lead) => lead.lostReason || lead.status === "Lost"), "lostReason"),
    topMatches: bestLeadPropertyPairs().slice(0, 5).map((pair) => ({
      lead: pair.lead.name,
      property: pair.property.title,
      score: pair.score,
      reasons: pair.reasons
    })),
    leads: context.leads.slice(0, 40).map((lead) => ({
      name: lead.name,
      source: lead.source,
      status: lead.status,
      agent: lead.agent,
      heatScore: scoreLead(lead),
      seriousnessScore: buyerSeriousnessScore(lead),
      area: lead.requirement?.area,
      budget: budgetText(lead.requirement || {}),
      rooms: lead.requirement?.rooms,
      surface: lead.requirement?.surface,
      timeline: lead.requirement?.timeline,
      financing: lead.requirement?.financing,
      lastReply: lead.lastReply,
      followUp: lead.followUp
    })),
    owners: state.owners.slice(0, 40).map((owner) => ({
      name: owner.name,
      seriousnessScore: ownerSeriousnessScore(owner),
      agreement: owner.agreement,
      lastContact: owner.lastContact,
      askingPrice: owner.askingPrice,
      lowestPrice: owner.lowestPrice,
      notes: owner.notes
    })),
    properties: context.properties.slice(0, 40).map((property) => {
      const evaluation = propertyEvaluation(property);
      return {
        title: property.title,
        type: property.type,
        area: property.area,
        price: property.price,
        status: property.status,
        features: property.features,
        platforms: property.platforms,
        nextRepost: property.nextRepost,
        evaluationScore: evaluation.score,
        demand: evaluation.demand
      };
    }),
    social: {
      accounts: state.socialAccounts,
      posts: state.socialPosts.slice(0, 30)
    }
  };
}

function remoteAgentAnswerHtml(answer, mode) {
  return `
    <div class="mentor-answer remote-ai-answer">
      <div class="mentor-section">
        <span class="ai-label">Real AI · ${mode}</span>
        <strong>Benabella AI Agent</strong>
        <div>${agentTextToHtml(answer)}</div>
      </div>
    </div>
  `;
}

function agentTextToHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

async function callAiConnector(question, mode) {
  const endpoint = state.aiAgent.endpoint.trim();
  if (!endpoint) throw new Error("Missing AI connector URL");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      question,
      mode,
      doctrine: benabellaAgentDoctrine,
      context: aiAgentPayload()
    })
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "AI connector failed");
  const answer = data.answer || data.output || data.text;
  if (!answer) throw new Error("AI connector returned no answer");
  return answer;
}

async function askAgent(question, mode) {
  state.aiAgent.mode = mode;
  state.aiAgent.messages.push({ role: "user", mode, content: question });
  state.aiAgent.messages.push({ role: "assistant", mode, html: `<div class="mentor-answer"><div class="mentor-section"><strong>Thinking...</strong><p>Building a manager-level answer from the CRM.</p></div></div>` });
  state.aiAgent.messages = state.aiAgent.messages.slice(-20);
  saveState();
  renderAssistant();

  let answer = "";
  try {
    if (state.aiAgent.enabled && state.aiAgent.endpoint) {
      answer = remoteAgentAnswerHtml(await callAiConnector(question, mode), mode);
      state.aiAgent.status = "Real AI connected";
    } else {
      answer = agentResponseHtml(question, mode);
      state.aiAgent.status = "Local CRM brain";
    }
  } catch (error) {
    answer = `
      <div class="mentor-answer">
        <div class="mentor-section">
          <span class="ai-label">Local fallback</span>
          <strong>Real AI connector failed</strong>
          <p>${escapeHtml(error.message)}. I answered with the built-in Benabella CRM brain instead.</p>
        </div>
        ${agentResponseHtml(question, mode)}
      </div>
    `;
    state.aiAgent.status = "Real AI failed";
    showToast(`AI connector failed: ${error.message}`);
  }

  const lastAssistant = [...state.aiAgent.messages].reverse().find((message) => message.role === "assistant");
  if (lastAssistant) lastAssistant.html = answer;
  state.aiAgent.messages = state.aiAgent.messages.slice(-20);
  saveState();
  renderAssistant();
  requestAnimationFrame(() => {
    const answerPanel = document.querySelector("#assistant-answer");
    if (answerPanel) answerPanel.scrollTop = 0;
  });
}

function askLocalAgent(question, mode) {
  const answer = agentResponseHtml(question, mode);
  state.aiAgent.messages.push({ role: "user", mode, content: question });
  state.aiAgent.messages.push({ role: "assistant", mode, html: answer });
  state.aiAgent.messages = state.aiAgent.messages.slice(-20);
  state.aiAgent.mode = mode;
  state.aiAgent.status = "Local CRM brain";
  saveState();
  renderAssistant();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function answerQuestion(question) {
  const text = clean(question);
  const leads = filtered(state.leads).filter((lead) => lead.status !== "Lost");
  const properties = filtered(state.properties);
  const visits = filtered(state.visits);
  const brief = dailyBrief(leads, visits, properties);

  if (text.includes("call") || text.includes("first")) {
    const lead = [...leads].sort((a, b) => scoreLead(b) - scoreLead(a))[0];
    return lead ? `Call ${lead.name} first. ${nextActionText(lead)} Their need is ${lead.requirement.area}, ${lead.requirement.rooms}, ${budgetText(lead.requirement)}.` : brief.detail;
  }

  if (text.includes("match") || text.includes("property")) {
    const pair = bestLeadPropertyPairs()[0];
    return pair ? `Best match: send ${pair.property.title} to ${pair.lead.name}. Match score ${pair.score}/100 because ${pair.reasons.join(", ")}.` : "No strong match yet. Add buyer budget, area, rooms, and surface to improve matching.";
  }

  if (text.includes("repost") || text.includes("avito")) {
    const due = properties.filter((property) => property.nextRepost <= iso(today) && property.status === "Available");
    return due.length ? `Repost today: ${due.map((property) => `${property.title} on ${property.platforms.join("/")}`).join("; ")}.` : "No properties need reposting today.";
  }

  if (text.includes("instagram") || text.includes("tiktok") || text.includes("facebook") || text.includes("social") || text.includes("post")) {
    const posts = filtered(state.socialPosts);
    const todayPosts = posts.filter((post) => post.date === iso(today) && post.status !== "Published");
    const stats = socialPlatformStats(posts);
    return todayPosts.length
      ? `Post today: ${todayPosts.map((post) => `${post.platform} ${post.type} for ${propertyById(post.propertyId)?.title || "a property"}`).join("; ")}. Best current platform is ${bestSocialPlatform(stats)}.`
      : `No social posts are due today. Best current platform is ${bestSocialPlatform(stats)} based on messages and leads.`;
  }

  if (text.includes("commission") || text.includes("money")) {
    const active = sum(state.deals.filter((deal) => deal.stage === "Negotiation"), "expectedCommission");
    const hot = sum(state.deals.filter((deal) => deal.stage === "Hot Lead"), "expectedCommission");
    return `Focus on negotiations first: ${money(active)} expected. Hot leads could add ${money(hot)} if you move them to visits and offers.`;
  }

  return `${brief.headline}. ${brief.detail}`;
}

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

function firstNumber(value) {
  return Number(String(value || "").match(/\d+/)?.[0]) || 0;
}

function sameMonth(date) {
  if (!date) return false;
  const parsed = new Date(date);
  return parsed.getFullYear() === today.getFullYear() && parsed.getMonth() === today.getMonth();
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function groupSum(items, groupKey, sumKey) {
  return items.reduce((groups, item) => {
    groups[item[groupKey]] = (groups[item[groupKey]] || 0) + (Number(item[sumKey]) || 0);
    return groups;
  }, {});
}

function groupCount(items, key) {
  return items.reduce((groups, item) => {
    groups[item[key]] = (groups[item[key]] || 0) + 1;
    return groups;
  }, {});
}

function topValue(items, key) {
  const groups = groupCount(items, key);
  return Object.entries(groups).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function metric(label, value) {
  return `<article class="metric-card"><span class="mini-label">${label}</span><strong>${value}</strong></article>`;
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function renderBars(selector, groups) {
  const entries = Object.entries(groups);
  const max = Math.max(...entries.map((entry) => entry[1]), 1);
  document.querySelector(selector).innerHTML = entries.length ? entries.map(([label, value]) => `
    <div class="bar-row"><span>${label}</span><div class="bar"><span style="width:${(value / max) * 100}%"></span></div><strong>${typeof value === "number" && value > 100 ? money(value) : value}</strong></div>
  `).join("") : `<p class="card-meta">No data yet.</p>`;
}

function renderDonut(selector, groups) {
  const entries = Object.entries(groups);
  const total = entries.reduce((value, entry) => value + entry[1], 0);
  let start = 0;
  const colors = ["#b68a2c", "#24745b", "#315f8f", "#b44335", "#6f6a61", "#d6b85b", "#5b846f"];
  const stops = entries.map(([label, value], index) => {
    const end = start + (value / Math.max(total, 1)) * 100;
    const stop = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return stop;
  }).join(", ");
  document.querySelector(selector).innerHTML = entries.length ? `
    <div class="donut-wrap">
      <div class="donut" style="background: conic-gradient(${stops})"><span>${total}</span></div>
      <div class="donut-legend">
        ${entries.map(([label, value], index) => `
          <div><i style="background:${colors[index % colors.length]}"></i><span>${label}</span><strong>${value}</strong></div>
        `).join("")}
      </div>
    </div>
  ` : `<p class="card-meta">No data yet.</p>`;
}

function socialPlatformStats(posts) {
  return ["Instagram", "TikTok", "Facebook"].map((platform) => {
    const platformPosts = posts.filter((post) => post.platform === platform);
    const account = state.socialAccounts.find((item) => item.platform === platform);
    return {
      platform,
      followers: Number(account?.followers) || 0,
      growth: (Number(account?.followers) || 0) - (Number(account?.previousFollowers) || 0),
      posts: platformPosts.length,
      views: platformPosts.reduce((total, post) => total + post.metrics.views, 0),
      likes: platformPosts.reduce((total, post) => total + post.metrics.likes, 0),
      comments: platformPosts.reduce((total, post) => total + post.metrics.comments, 0),
      shares: platformPosts.reduce((total, post) => total + post.metrics.shares, 0),
      saves: platformPosts.reduce((total, post) => total + post.metrics.saves, 0),
      messages: platformPosts.reduce((total, post) => total + post.metrics.messages, 0),
      leads: platformPosts.reduce((total, post) => total + post.metrics.leads, 0)
    };
  });
}

function bestSocialPlatform(stats) {
  const best = [...stats].sort((a, b) => b.leads - a.leads || b.messages - a.messages || b.saves - a.saves || b.shares - a.shares || b.likes - a.likes || b.views - a.views || b.followers - a.followers)[0];
  return best && (best.leads || best.messages || best.saves || best.shares || best.likes || best.views || best.followers || best.posts) ? best.platform : "";
}

function socialStatsForPlatform(platform) {
  return state.socialPosts
    .filter((post) => post.platform === platform)
    .reduce((stats, post) => {
      stats.posts += 1;
      stats.views += post.metrics.views;
      stats.likes += post.metrics.likes;
      stats.comments += post.metrics.comments;
      stats.shares += post.metrics.shares;
      stats.saves += post.metrics.saves;
      stats.messages += post.metrics.messages;
      stats.leads += post.metrics.leads;
      return stats;
    }, { posts: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, messages: 0, leads: 0 });
}

function signedNumber(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${number.toLocaleString("fr-MA")}`;
}

function renderSocialBars(selector, stats) {
  const max = Math.max(...stats.map((item) => item.views + item.likes + item.followers), 1);
  document.querySelector(selector).innerHTML = stats.map((item) => `
    <div class="social-bar-row">
      <span class="platform-pill ${item.platform.toLowerCase()}">${item.platform}</span>
      <div class="bar"><span style="width:${((item.views + item.likes + item.followers) / max) * 100}%"></span></div>
      <strong>${item.followers.toLocaleString("fr-MA")} followers</strong>
      <small>${item.posts} posts · ${item.views.toLocaleString("fr-MA")} views · ${item.likes.toLocaleString("fr-MA")} likes · ${item.shares.toLocaleString("fr-MA")} shares · ${item.saves.toLocaleString("fr-MA")} saves · ${item.messages} messages · ${item.leads} leads</small>
    </div>
  `).join("");
}

function isSocialProfileUrl(value) {
  return /(?:tiktok\.com|instagram\.com|facebook\.com|fb\.com)/i.test(value || "");
}

function metricValue(...values) {
  return values.map((value) => Number(value)).find((value) => Number.isFinite(value) && value > 0) || 0;
}

function normalizeSocialMetrics(metrics = {}) {
  return {
    views: metricValue(metrics.views, metrics.view_count, metrics.play_count, metrics.reach, metrics.impressions),
    likes: metricValue(metrics.likes, metrics.like_count),
    comments: metricValue(metrics.comments, metrics.comment_count),
    shares: metricValue(metrics.shares, metrics.share_count),
    saves: metricValue(metrics.saves, metrics.saved, metrics.save_count),
    messages: metricValue(metrics.messages, metrics.dm_count, metrics.replies),
    leads: metricValue(metrics.leads, metrics.lead_count)
  };
}

function findSocialAccount(account) {
  return state.socialAccounts.find((item) =>
    item.platform === account.platform && clean(item.name) === clean(account.name)
  ) || state.socialAccounts.find((item) => item.platform === account.platform);
}

function applySocialPayload(payload) {
  const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
  const posts = Array.isArray(payload.posts) ? payload.posts : [];

  accounts.forEach((account) => {
    const platform = account.platform || "Instagram";
    const existing = findSocialAccount({ ...account, platform });
    const currentFollowers = Number(existing?.followers) || 0;
    const next = existing || {
      id: nextId(state.socialAccounts),
      platform,
      name: account.name || (platform === "Facebook" ? "Benabella Realty" : "@benabellarealty")
    };
    next.name = account.name || next.name;
    next.status = "Automatic";
    next.lastSync = iso(today);
    next.previousFollowers = Number(account.previousFollowers ?? account.previous_followers ?? next.previousFollowers ?? currentFollowers) || 0;
    next.followers = Number(account.followers ?? account.follower_count ?? next.followers) || 0;
    if (!existing) state.socialAccounts.push(next);
  });

  posts.forEach((post) => {
    const platform = post.platform || "Instagram";
    const externalId = post.externalId || post.external_id || post.id || "";
    const property = propertyById(post.propertyId) || state.properties.find((item) => clean(item.title) === clean(post.propertyTitle));
    const existing = externalId
      ? state.socialPosts.find((item) => item.platform === platform && item.externalId === externalId)
      : state.socialPosts.find((item) => item.platform === platform && item.date === post.date && item.type === post.type && item.caption === post.caption);
    const next = existing || {
      id: nextId(state.socialPosts),
      platform,
      propertyId: property?.id || state.properties[0]?.id || null,
      agent: post.agent || "Ayoub",
      type: post.type || "Post",
      date: post.date || iso(today),
      status: "Published",
      caption: post.caption || ""
    };
    next.platform = platform;
    next.externalId = externalId || next.externalId || "";
    next.url = post.url || post.permalink || next.url || "";
    next.propertyId = property?.id || next.propertyId || state.properties[0]?.id || null;
    next.agent = post.agent || next.agent || "Ayoub";
    next.type = post.type || next.type || "Post";
    next.date = post.date || next.date || iso(today);
    next.status = post.status || "Published";
    next.caption = post.caption || next.caption || socialCaption(property || state.properties[0], platform, next.type);
    next.metrics = normalizeSocialMetrics({ ...(next.metrics || {}), ...(post.metrics || post) });
    if (!existing) state.socialPosts.push(next);
  });
}

function configureSocialAutoSync() {
  const signature = `${state.socialSync.enabled}|${state.socialSync.endpoint}|${state.socialSync.intervalMinutes}`;
  if (signature === socialAutoSyncSignature) return;
  socialAutoSyncSignature = signature;
  clearInterval(socialAutoSyncTimer);
  socialAutoSyncTimer = null;
  if (!state.socialSync.enabled || !state.socialSync.endpoint) return;
  syncSocialFromConnector(false);
  socialAutoSyncTimer = setInterval(() => {
    syncSocialFromConnector(false);
  }, state.socialSync.intervalMinutes * 60000);
}

async function syncSocialFromConnector(showMessage = true) {
  if (!state.socialSync.endpoint) {
    if (showMessage) showToast("Add connector URL first");
    return;
  }
  if (isSocialProfileUrl(state.socialSync.endpoint)) {
    state.socialSync.status = "Profile link is not a connector";
    renderSocialSync();
    if (showMessage) showToast("Paste a connector URL, not a social profile link");
    return;
  }
  try {
    state.socialSync.status = "Syncing";
    renderSocialSync();
    const response = await fetch(state.socialSync.endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("connector failed");
    applySocialPayload(await response.json());
    state.socialSync.status = "Automatic tracking on";
    state.socialSync.lastSync = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
    normalizeState();
    saveState();
    render();
    if (showMessage) showToast("Social numbers updated");
  } catch {
    state.socialSync.status = "Sync failed";
    saveState();
    renderSocialSync();
    if (showMessage) showToast("Social connector failed");
  }
}

function socialCaption(property, platform, type) {
  const safeProperty = property || { title: "Benabella Realty property", area: "Agadir", price: 0, features: "contact us for details" };
  const hook = platform === "TikTok"
    ? "Quick property tour in Agadir"
    : platform === "Instagram"
      ? "New Benabella Realty listing"
      : "Available property in Agadir";
  return `${hook}: ${safeProperty.title}, ${safeProperty.area}, ${money(safeProperty.price)}. ${safeProperty.features}. Message Benabella Realty on WhatsApp to book a visit.`;
}

function renderPipelineShape() {
  const groups = {
    "Hot Leads": state.deals.filter((deal) => deal.stage === "Hot Lead").length,
    Negotiation: state.deals.filter((deal) => deal.stage === "Negotiation").length,
    Closed: state.deals.filter((deal) => deal.stage === "Closed" && sameMonth(deal.closedDate)).length
  };
  const max = Math.max(...Object.values(groups), 1);
  document.querySelector("#pipeline-shape").innerHTML = `
    <div class="pipeline-shape">
      ${Object.entries(groups).map(([label, value]) => `
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
          <i style="height:${Math.max(18, (value / max) * 86)}px"></i>
        </div>
      `).join("")}
    </div>
  `;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function scheduleCloudSave() {
  if (suppressCloudSave || !cloudSync.enabled || !cloudSync.workspace || !cloudSync.secret) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushCloudState(false);
  }, 700);
}

function firebaseConfigAvailable() {
  const config = getFirebaseConfig();
  return Boolean(config?.apiKey && config?.projectId && config?.authDomain);
}

function firebaseWorkspace() {
  return window.BENABELLA_FIREBASE_WORKSPACE || "benabella-realty";
}

function getFirebaseConfig() {
  const config = window.BENABELLA_FIREBASE_CONFIG || {};
  return config.apiKey ? config : firebaseFallbackConfig;
}

function dataHasContent(data) {
  return Boolean(
    data.leads?.length ||
    data.properties?.length ||
    data.owners?.length ||
    data.visits?.length ||
    data.deals?.length ||
    data.socialPosts?.length ||
    data.socialAccounts?.length
  );
}

function initializeFirebaseCloud() {
  if (!firebaseConfigAvailable() || typeof firebase === "undefined") {
    renderSync();
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(getFirebaseConfig());
    firebaseDb = firebase.firestore();
    firebaseAuth = firebase.auth();
    firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebaseAuth.onAuthStateChanged((user) => {
      firebaseUser = user;
      if (firebaseUnsubscribe) {
        firebaseUnsubscribe();
        firebaseUnsubscribe = null;
      }
      if (user) startFirebaseListener();
      renderSync();
    });
  } catch {
    showToast("Firebase could not start");
  }
}

function startFirebaseListener() {
  firebaseDocRef = firebaseDb.collection("crmWorkspaces").doc(firebaseWorkspace());
  firebaseUnsubscribe = firebaseDocRef.onSnapshot((snapshot) => {
    if (snapshot.exists && snapshot.data()?.data) {
      suppressFirebaseSave = true;
      state = snapshot.data().data;
      normalizeState();
      saveState();
      suppressFirebaseSave = false;
      render();
      return;
    }
    if (dataHasContent(state)) writeFirebaseState(false);
  }, () => {
    showToast("Firebase cloud read blocked");
  });
}

function scheduleFirebaseSave() {
  if (suppressFirebaseSave || !firebaseUser || !firebaseDocRef) return;
  clearTimeout(firebaseSaveTimer);
  firebaseSaveTimer = setTimeout(() => {
    writeFirebaseState(false);
  }, 800);
}

async function writeFirebaseState(showMessage = true) {
  if (!firebaseUser || !firebaseDocRef) {
    if (showMessage) showToast("Log in to Firebase cloud first");
    return;
  }
  try {
    await firebaseDocRef.set({
      data: state,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: firebaseUser.email || firebaseUser.uid
    }, { merge: true });
    if (showMessage) showToast("Saved to Firebase cloud");
  } catch {
    if (showMessage) showToast("Firebase save blocked");
  }
}

function firebaseLoginError(error) {
  const code = error?.code || "";
  if (code.includes("auth/unauthorized-domain")) return "Firebase: add this GitHub domain";
  if (code.includes("auth/invalid-credential")) return "Firebase: wrong email or password";
  if (code.includes("auth/user-not-found")) return "Firebase: user not found";
  if (code.includes("auth/wrong-password")) return "Firebase: wrong password";
  if (code.includes("auth/operation-not-allowed")) return "Firebase: enable Email/Password";
  if (code.includes("auth/network-request-failed")) return "Firebase: network blocked";
  return `Firebase login failed${code ? `: ${code}` : ""}`;
}

function cloudHeaders() {
  return {
    "Content-Type": "application/json",
    "x-crm-sync-secret": cloudSync.secret
  };
}

async function pullCloudState(showMessage = true) {
  if (!cloudSync.workspace || !cloudSync.secret) {
    showToast("Add workspace and sync code first");
    return;
  }
  try {
    const response = await fetch(`/.netlify/functions/crm-state?workspace=${encodeURIComponent(cloudSync.workspace)}`, {
      headers: cloudHeaders()
    });
    if (response.status === 404) {
      if (showMessage) showToast("No cloud data yet");
      return;
    }
    if (!response.ok) throw new Error("sync failed");
    const payload = await response.json();
    if (!payload.data) {
      if (showMessage) showToast("No cloud data yet");
      return;
    }
    suppressCloudSave = true;
    state = payload.data;
    normalizeState();
    saveState();
    suppressCloudSave = false;
    if (showMessage) showToast("Cloud data loaded");
    render();
  } catch {
    suppressCloudSave = false;
    if (showMessage) showToast("Cloud sync is not configured yet");
  }
}

async function pushCloudState(showMessage = true) {
  if (!cloudSync.workspace || !cloudSync.secret) {
    showToast("Add workspace and sync code first");
    return;
  }
  try {
    const response = await fetch(`/.netlify/functions/crm-state?workspace=${encodeURIComponent(cloudSync.workspace)}`, {
      method: "PUT",
      headers: cloudHeaders(),
      body: JSON.stringify({ data: state })
    });
    if (!response.ok) throw new Error("sync failed");
    if (showMessage) showToast("Cloud data updated");
  } catch {
    if (showMessage) showToast("Cloud sync is not configured yet");
  }
}

document.addEventListener("click", async (event) => {
  const nav = event.target.closest(".nav-button");
  if (nav) {
    const page = document.querySelector(`#${nav.dataset.page}-page`);
    if (!page) return;
    document.querySelectorAll(".nav-button").forEach((button) => button.classList.remove("active"));
    nav.classList.add("active");
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    page.classList.add("active");
    document.querySelector("#page-title").textContent = nav.textContent;
  }

  const leadRow = event.target.closest("[data-lead-id]");
  if (leadRow) {
    state.selectedLeadId = Number(leadRow.dataset.leadId);
    saveState();
    renderLeads();
  }

  const propertyRow = event.target.closest("[data-property-id]");
  if (propertyRow) {
    state.selectedPropertyId = Number(propertyRow.dataset.propertyId);
    saveState();
    renderProperties();
  }

  const setMatch = event.target.closest("[data-set-match]");
  if (setMatch) {
    const lead = leadById(Number(setMatch.dataset.matchLead));
    if (lead) {
      lead.propertyId = Number(setMatch.dataset.setMatch);
      saveState();
      showToast("Match saved to lead");
      render();
    }
  }

  const templateButton = event.target.closest("[data-template]");
  if (templateButton) {
    const text = templateText(templateButton.dataset.templateKind, Number(templateButton.dataset.templateId), templateButton.dataset.template);
    const panel = templateButton.closest(".detail-section");
    panel.querySelector(".template-box").textContent = text;
    panel.querySelector("[data-open-whatsapp]").href = whatsappHref(text);
  }

  const copyButton = event.target.closest("[data-copy-template]");
  if (copyButton) {
    const text = copyButton.closest(".detail-section").querySelector(".template-box").textContent;
    navigator.clipboard?.writeText(text);
    showToast("Template copied");
  }

  const marketing = event.target.closest("[data-marketing]");
  if (marketing) {
    document.querySelector("#marketing-box").textContent = marketingText(propertyById(Number(marketing.dataset.marketing)), marketing.dataset.lang);
  }

  const copySocial = event.target.closest("[data-copy-social]");
  if (copySocial) {
    const post = state.socialPosts.find((item) => item.id === Number(copySocial.dataset.copySocial));
    navigator.clipboard?.writeText(post.caption);
    showToast("Social caption copied");
  }

  const socialPosted = event.target.closest("[data-social-posted]");
  if (socialPosted) {
    const post = state.socialPosts.find((item) => item.id === Number(socialPosted.dataset.socialPosted));
    post.status = "Published";
    post.date = iso(today);
    saveState();
    showToast("Post marked published");
    render();
  }

  const deleteLead = event.target.closest("[data-delete-lead]");
  if (deleteLead) {
    const id = Number(deleteLead.dataset.deleteLead);
    state.leads = state.leads.filter((lead) => lead.id !== id);
    state.visits = state.visits.filter((visit) => visit.leadId !== id);
    state.deals = state.deals.filter((deal) => deal.leadId !== id);
    state.selectedLeadId = state.leads[0]?.id || null;
    saveState();
    showToast("Lead deleted");
    render();
  }

  const deleteProperty = event.target.closest("[data-delete-property]");
  if (deleteProperty) {
    const id = Number(deleteProperty.dataset.deleteProperty);
    state.properties = state.properties.filter((property) => property.id !== id);
    state.visits = state.visits.filter((visit) => visit.propertyId !== id);
    state.deals = state.deals.filter((deal) => deal.propertyId !== id);
    state.socialPosts = state.socialPosts.filter((post) => post.propertyId !== id);
    state.owners.forEach((owner) => {
      owner.propertyIds = owner.propertyIds.filter((propertyId) => propertyId !== id);
    });
    state.selectedPropertyId = state.properties[0]?.id || null;
    saveState();
    showToast("Property deleted");
    render();
  }

  const deleteOwner = event.target.closest("[data-delete-owner]");
  if (deleteOwner) {
    const id = Number(deleteOwner.dataset.deleteOwner);
    state.owners = state.owners.filter((owner) => owner.id !== id);
    saveState();
    showToast("Owner deleted");
    render();
  }

  const deleteVisit = event.target.closest("[data-delete-visit]");
  if (deleteVisit) {
    state.visits = state.visits.filter((visit) => visit.id !== Number(deleteVisit.dataset.deleteVisit));
    saveState();
    showToast("Visit deleted");
    render();
  }

  const deleteSocial = event.target.closest("[data-delete-social]");
  if (deleteSocial) {
    state.socialPosts = state.socialPosts.filter((post) => post.id !== Number(deleteSocial.dataset.deleteSocial));
    saveState();
    showToast("Social post deleted");
    render();
  }

  const deleteSocialAccount = event.target.closest("[data-delete-social-account]");
  if (deleteSocialAccount) {
    state.socialAccounts = state.socialAccounts.filter((account) => account.id !== Number(deleteSocialAccount.dataset.deleteSocialAccount));
    saveState();
    showToast("Social account removed");
    render();
  }

  const connectAccount = event.target.closest("[data-connect-account]");
  if (connectAccount) {
    const platform = connectAccount.dataset.connectAccount;
    const existing = state.socialAccounts.find((account) => account.platform === platform);
    if (existing) {
      existing.status = "Secure connection needed";
      existing.lastSync = "Waiting for OAuth backend";
    } else {
      state.socialAccounts.push({
        id: nextId(state.socialAccounts),
        platform,
        name: platform === "Facebook" ? "Benabella Realty" : "@benabellarealty",
        status: "Secure connection needed",
        lastSync: "Waiting for OAuth backend",
        followers: 0,
        previousFollowers: 0
      });
    }
    saveState();
    showToast(`${platform} connection prepared`);
    render();
  }

  const socialSyncNow = event.target.closest("[data-social-sync-now]");
  if (socialSyncNow) {
    await syncSocialFromConnector(true);
  }

  const mentorPrompt = event.target.closest("[data-mentor-prompt]");
  if (mentorPrompt) {
    const question = mentorPrompt.dataset.mentorPrompt;
    const mode = document.querySelector("#ai-agent-mode")?.value || "COO Review";
    document.querySelector("#ai-question").value = question;
    await askAgent(question, mode);
  }

  const clearAgentChat = event.target.closest("[data-clear-agent-chat]");
  if (clearAgentChat) {
    state.aiAgent.messages = [];
    saveState();
    renderAssistant();
    showToast("Agent chat cleared");
  }

  const resetAll = event.target.closest("[data-reset-all]");
  if (resetAll) {
    if (window.confirm("This deletes all CRM data on this device. A local backup will be saved first. Continue?")) {
      resetAllData();
      showToast("All CRM data deleted");
      render();
    }
  }

  const exportData = event.target.closest("[data-export-data]");
  if (exportData) {
    exportDataBackup();
    showToast("Backup downloaded");
  }

  const copyTransfer = event.target.closest("[data-copy-transfer]");
  if (copyTransfer) {
    copyTransferCode();
    showToast("Transfer code copied");
  }

  const importTransfer = event.target.closest("[data-import-transfer]");
  if (importTransfer) {
    importTransferCode();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "agent-filter") render();
  if (event.target.id === "import-backup-file") importDataBackup(event.target.files[0]);
  if (event.target.matches("[data-doc-property]")) {
    const property = propertyById(Number(event.target.dataset.docProperty));
    if (event.target.files[0] && property) {
      property.docs.push(`${event.target.dataset.docLabel}: ${event.target.files[0].name}`);
      saveState();
      renderProperties();
      showToast("Private document saved");
    }
  }
});

document.querySelector("#new-lead-phone").addEventListener("input", (event) => {
  const phone = event.target.value.trim();
  const duplicate = state.leads.find((lead) => lead.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""));
  document.querySelector("#duplicate-warning").textContent = duplicate ? `Duplicate warning: ${duplicate.name} already uses this phone.` : "";
});

document.querySelector("#lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const phone = document.querySelector("#new-lead-phone").value.trim();
  const duplicate = state.leads.find((lead) => lead.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""));
  if (duplicate) {
    document.querySelector("#duplicate-warning").textContent = `Cannot add duplicate: ${duplicate.name} already exists.`;
    return;
  }
  const id = nextId(state.leads);
  const budgetMax = Number(document.querySelector("#new-lead-budget").value) || 0;
  state.leads.unshift({
    id,
    name: document.querySelector("#new-lead-name").value.trim() || "New Lead",
    phone,
    source: document.querySelector("#new-lead-source").value,
    agent: "Ayoub",
    status: "New Lead",
    budget: budgetMax,
    realisticBudget: false,
    buySoon: false,
    lastReply: shift(0),
    nextCall: shift(0),
    followUp: shift(1),
    bookedVisit: false,
    madeOffer: false,
    propertyId: null,
    createdAt: shift(0),
    requirement: {
      propertyType: "Apartment",
      purpose: "Buy",
      area: document.querySelector("#new-lead-area").value.trim() || "Not set",
      budgetMin: "",
      budgetMax,
      rooms: document.querySelector("#new-lead-rooms").value,
      surface: document.querySelector("#new-lead-surface").value.trim() || "Not set",
      floor: "Any floor",
      timeline: "Not set",
      financing: "Not set",
      mustHave: "Not set",
      avoid: "Not set",
      notes: ""
    }
  });
  state.selectedLeadId = id;
  saveState();
  event.target.reset();
  showToast("Lead added");
  render();
});

document.querySelector("#ai-ask-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = document.querySelector("#ai-question").value.trim() || "Give me the daily business review and the highest priority action.";
  const mode = document.querySelector("#ai-agent-mode").value;
  await askAgent(question, mode);
  document.querySelector("#ai-question").value = "";
});

document.querySelector("#ai-agent-settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.aiAgent.endpoint = document.querySelector("#ai-agent-endpoint").value.trim();
  state.aiAgent.enabled = document.querySelector("#ai-agent-enabled").checked;
  state.aiAgent.status = state.aiAgent.enabled && state.aiAgent.endpoint ? "Real AI ready" : "Local CRM brain";
  saveState();
  renderAiAgentSettings();
  showToast("AI brain saved");
});

document.querySelector("#sync-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  cloudSync = {
    enabled: true,
    workspace: document.querySelector("#sync-workspace").value.trim() || "benabella-realty",
    secret: document.querySelector("#sync-secret").value.trim()
  };
  saveSyncConfig();
  renderSync();
  await pullCloudState(true);
});

document.querySelector("#firebase-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseAuth) {
    showToast("Add Firebase config first");
    return;
  }
  const email = document.querySelector("#firebase-email").value.trim();
  const password = document.querySelector("#firebase-password").value;
  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
    document.querySelector("#firebase-password").value = "";
    showToast("Automatic sync is on");
  } catch (error) {
    showToast(firebaseLoginError(error));
  }
});

document.addEventListener("click", async (event) => {
  const syncPush = event.target.closest("[data-sync-push]");
  if (syncPush) {
    cloudSync.enabled = true;
    cloudSync.workspace = document.querySelector("#sync-workspace").value.trim() || cloudSync.workspace || "benabella-realty";
    cloudSync.secret = document.querySelector("#sync-secret").value.trim() || cloudSync.secret;
    saveSyncConfig();
    renderSync();
    await pushCloudState(true);
  }

  const syncPull = event.target.closest("[data-sync-pull]");
  if (syncPull) {
    cloudSync.enabled = true;
    cloudSync.workspace = document.querySelector("#sync-workspace").value.trim() || cloudSync.workspace || "benabella-realty";
    cloudSync.secret = document.querySelector("#sync-secret").value.trim() || cloudSync.secret;
    saveSyncConfig();
    renderSync();
    await pullCloudState(true);
  }

  const syncDisconnect = event.target.closest("[data-sync-disconnect]");
  if (syncDisconnect) {
    cloudSync = { enabled: false, workspace: "benabella-realty", secret: "" };
    saveSyncConfig();
    renderSync();
    showToast("Cloud sync disconnected");
  }

  const firebaseSave = event.target.closest("[data-firebase-save]");
  if (firebaseSave) {
    await writeFirebaseState(true);
  }

  const firebaseLogout = event.target.closest("[data-firebase-logout]");
  if (firebaseLogout && firebaseAuth) {
    await firebaseAuth.signOut();
    showToast("Firebase cloud logged out");
  }
});

document.querySelector("#property-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = nextId(state.properties);
  const price = Number(document.querySelector("#new-property-price").value) || 0;
  state.properties.unshift({
    id,
    title: document.querySelector("#new-property-title").value.trim() || "New Property",
    type: document.querySelector("#new-property-type").value,
    area: document.querySelector("#new-property-area").value.trim() || "Agadir",
    price,
    agent: document.querySelector("#new-property-agent").value,
    status: "Available",
    ownerId: state.owners[0]?.id || 1,
    commission: { type: "percentage", value: defaultCommissionPercent },
    lastPosted: shift(-7),
    nextRepost: shift(0),
    platforms: ["Facebook", "Instagram", "TikTok"],
    repostStatus: "Due today",
    docs: [],
    publicPhotos: 0,
    features: "Add features"
  });
  state.selectedPropertyId = id;
  saveState();
  event.target.reset();
  showToast("Property added");
  render();
});

document.querySelector("#owner-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.owners.unshift({
    id: nextId(state.owners),
    name: document.querySelector("#new-owner-name").value.trim() || "New Owner",
    phone: document.querySelector("#new-owner-phone").value.trim(),
    propertyIds: [],
    lastContact: shift(0),
    askingPrice: Number(document.querySelector("#new-owner-asking").value) || 0,
    lowestPrice: Number(document.querySelector("#new-owner-lowest").value) || 0,
    agreement: document.querySelector("#new-owner-agreement").value,
    notes: ""
  });
  saveState();
  event.target.reset();
  showToast("Owner added");
  render();
});

document.querySelector("#visit-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.leads.length || !state.properties.length) {
    showToast("Add a lead and property first");
    return;
  }
  state.visits.unshift({
    id: nextId(state.visits),
    leadId: Number(document.querySelector("#new-visit-lead").value),
    propertyId: Number(document.querySelector("#new-visit-property").value),
    agent: document.querySelector("#new-visit-agent").value,
    date: document.querySelector("#new-visit-date").value || shift(0),
    time: document.querySelector("#new-visit-time").value || "10:00",
    feedback: "",
    notes: ""
  });
  saveState();
  showToast("Visit added");
  render();
});

document.querySelector("#social-account-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.socialAccounts.push({
    id: nextId(state.socialAccounts),
    platform: document.querySelector("#social-account-platform").value,
    name: document.querySelector("#social-account-name").value.trim() || "@account",
    status: "Manual tracking",
    lastSync: "Not connected",
    followers: Number(document.querySelector("#social-account-followers").value) || 0,
    previousFollowers: Number(document.querySelector("#social-account-previous-followers").value) || 0
  });
  saveState();
  event.target.reset();
  showToast("Social account saved");
  render();
});

document.querySelector("#social-sync-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.socialSync.endpoint = document.querySelector("#social-sync-endpoint").value.trim();
  state.socialSync.enabled = document.querySelector("#social-sync-enabled").checked;
  state.socialSync.intervalMinutes = Math.max(15, Number(document.querySelector("#social-sync-interval").value) || 60);
  state.socialSync.status = state.socialSync.endpoint ? "Automatic tracking ready" : "Not connected";
  saveState();
  showToast("Social auto sync saved");
  render();
});

document.querySelector("#social-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const property = propertyById(Number(document.querySelector("#social-property").value));
  if (!property) {
    showToast("Add a property before scheduling social posts");
    return;
  }
  const platform = document.querySelector("#social-platform").value;
  const type = document.querySelector("#social-post-type").value;
  const id = nextId(state.socialPosts);
  state.socialPosts.push({
    id,
    platform,
    propertyId: property.id,
    agent: document.querySelector("#social-agent").value,
    type,
    date: document.querySelector("#social-date").value || iso(today),
    status: "Scheduled",
    goal: "Generate buyer leads",
    caption: socialCaption(property, platform, type),
    metrics: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, messages: 0, leads: 0 }
  });
  saveState();
  showToast("Social post added");
  render();
});

document.addEventListener("submit", (event) => {
  const socialMetricsForm = event.target.closest("[data-social-metrics]");
  if (socialMetricsForm) {
    event.preventDefault();
    const post = state.socialPosts.find((item) => item.id === Number(socialMetricsForm.dataset.socialMetrics));
    const formData = new FormData(socialMetricsForm);
    post.metrics = {
      views: Number(formData.get("views")) || 0,
      likes: Number(formData.get("likes")) || 0,
      comments: Number(formData.get("comments")) || 0,
      shares: Number(formData.get("shares")) || 0,
      saves: Number(formData.get("saves")) || 0,
      messages: Number(formData.get("messages")) || 0,
      leads: Number(formData.get("leads")) || 0
    };
    post.status = "Published";
    saveState();
    showToast("Social metrics saved");
    render();
  }

  const socialAccountMetricsForm = event.target.closest("[data-social-account-metrics]");
  if (socialAccountMetricsForm) {
    event.preventDefault();
    const account = state.socialAccounts.find((item) => item.id === Number(socialAccountMetricsForm.dataset.socialAccountMetrics));
    if (!account) return;
    const formData = new FormData(socialAccountMetricsForm);
    account.followers = Number(formData.get("followers")) || 0;
    account.previousFollowers = Number(formData.get("previousFollowers")) || 0;
    account.lastSync = iso(today);
    saveState();
    showToast("Account numbers saved");
    render();
  }

  const requirementForm = event.target.closest("[data-requirement-lead]");
  if (requirementForm) {
    event.preventDefault();
    const lead = leadById(Number(requirementForm.dataset.requirementLead));
    const formData = new FormData(requirementForm);
    lead.requirement = {
      propertyType: formData.get("propertyType"),
      purpose: formData.get("purpose"),
      area: formData.get("area") || "Not set",
      budgetMin: Number(formData.get("budgetMin")) || "",
      budgetMax: Number(formData.get("budgetMax")) || "",
      rooms: formData.get("rooms") || "Not set",
      surface: formData.get("surface") || "Not set",
      floor: formData.get("floor") || "Any floor",
      timeline: formData.get("timeline") || "Not set",
      financing: formData.get("financing") || "Not set",
      mustHave: formData.get("mustHave") || "Not set",
      avoid: formData.get("avoid") || "Not set",
      notes: formData.get("notes") || ""
    };
    lead.budget = Number(lead.requirement.budgetMax) || 0;
    lead.realisticBudget = Boolean(lead.budget);
    saveState();
    showToast("Buyer requirements saved");
    render();
  }

  const lostForm = event.target.closest("[data-lost-lead]");
  if (lostForm) {
    event.preventDefault();
    const lead = leadById(Number(lostForm.dataset.lostLead));
    const reason = lostForm.querySelector("select").value;
    if (!reason) return;
    lead.status = "Lost";
    lead.lostReason = reason;
    saveState();
    showToast("Lost reason saved");
    render();
  }

  const visitForm = event.target.closest("[data-visit-form]");
  if (visitForm) {
    event.preventDefault();
    const visit = state.visits.find((item) => item.id === Number(visitForm.dataset.visitForm));
    visit.feedback = visitForm.querySelector("select").value;
    visit.notes = visitForm.querySelector("textarea").value;
    saveState();
    showToast("Visit feedback saved");
    render();
  }
});

render();
initializeFirebaseCloud();
if (cloudSync.enabled) pullCloudState(false);
