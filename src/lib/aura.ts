export type Category = "top" | "bottom" | "dress" | "shoes" | "accessory" | "outerwear";

export type Garment = {
  id: string;
  name: string;
  category: Category;
  color: string; // tailwind-ish swatch (hex)
  pattern?: string;
  imageUrl?: string;
  dateAdded?: string;
};

export type Outfit = {
  id: string;
  name: string;
  topId?: string;
  bottomId?: string;
  shoesId?: string;
};

export const INITIAL_WARDROBE: Garment[] = [
  { id: "t1", name: "Linen Tee", category: "top", color: "#F1E4D4" },
  { id: "t2", name: "Cropped Knit", category: "top", color: "#D4A5A5" },
  { id: "t3", name: "Silk Blouse", category: "top", color: "#E8DCC8" },
  { id: "t4", name: "Vintage Tee", category: "top", color: "#A8B5A0" },
  { id: "b1", name: "Wide Jeans", category: "bottom", color: "#A8B0C4" },
  { id: "b2", name: "Pleated Skirt", category: "bottom", color: "#C9A98E" },
  { id: "b3", name: "Cargo Pants", category: "bottom", color: "#7A8068" },
  { id: "b4", name: "Linen Shorts", category: "bottom", color: "#E8DCC8" },
  { id: "d1", name: "Slip Dress", category: "dress", color: "#D4A5A5" },
  { id: "d2", name: "Trench Coat", category: "outerwear", color: "#C9B299" },
  { id: "d3", name: "Floral Midi", category: "dress", color: "#E8C2B8" },
  { id: "s1", name: "Mary Janes", category: "shoes", color: "#2D2A26" },
  { id: "s2", name: "White Sneakers", category: "shoes", color: "#F5F1EA" },
  { id: "s3", name: "Strappy Sandals", category: "shoes", color: "#C9A98E" },
  { id: "a1", name: "Tote Bag", category: "accessory", color: "#A8B5A0" },
  { id: "a2", name: "Gold Hoops", category: "accessory", color: "#D4B97A" },
  { id: "a3", name: "Pearl Cap", category: "accessory", color: "#F1E4D4" },
];

export const MOCK_NEW_ITEMS: Garment[] = [
  { id: "n1", name: "Boucle Cardigan", category: "top", color: "#E8DCC8" },
  { id: "n2", name: "Satin Slip Skirt", category: "bottom", color: "#D4A5A5" },
  { id: "n3", name: "Ballet Flats", category: "shoes", color: "#F1E4D4" },
  { id: "n4", name: "Linen Blazer", category: "outerwear", color: "#C9B299" },
];

export type AIFlow = {
  prompt: string;
  reply: string;
  pickIds: string[];
};

export const AI_FLOWS: AIFlow[] = [
  {
    prompt: "Brunch with friends",
    reply:
      "Something easy and golden-hour ready — a soft cropped knit over wide jeans, finished with white sneakers and your tote. Effortless but considered.",
    pickIds: ["t2", "b1", "s2"],
  },
  {
    prompt: "First date",
    reply:
      "A slip dress moment. Layer the trench on top if it's cool, and let the strappy sandals do the rest. Gold hoops, lipstick, done.",
    pickIds: ["d1", "s3", "a2"],
  },
  {
    prompt: "Lazy Sunday",
    reply:
      "Vintage tee tucked into linen shorts, ballet-soft Mary Janes, and the pearl cap for that quiet-luxury Sunday read.",
    pickIds: ["t4", "b4", "s1"],
  },
];

export const INITIAL_OUTFITS: Outfit[] = [
  { id: "o1", name: "Sunday Soft", topId: "t1", bottomId: "b2", shoesId: "s2" },
  { id: "o2", name: "City Walk", topId: "t2", bottomId: "b1", shoesId: "s1" },
  { id: "o3", name: "Late Dinner", topId: "t3", bottomId: "b3", shoesId: "s3" },
];
