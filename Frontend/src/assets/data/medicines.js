import medicine1 from "../images/medicine1.jpg";
import medicine2 from "../images/medicine2.jpg";
import medicine3 from "../images/medicine3.jpg";
import medicine4 from "../images/medicine4.jpg";

export const medicines = [
  {
    id: "01",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "painkillers",
    price: 9.99,
    image: medicine1,
    description: "Fast-acting pain relief medication",
    detailedDescription: `Paracetamol (Acetaminophen) is a widely used over-the-counter pain reliever and fever reducer. It's effective for various conditions including headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.

Key Benefits:
• Relieves mild to moderate pain
• Reduces fever
• Gentle on stomach
• Safe for most people when used as directed

Precautions:
• Do not exceed recommended dose
• Avoid alcohol while taking this medication
• Consult doctor if symptoms persist
• Not recommended for chronic pain without medical supervision`,
    inStock: true,
    dosage: "500mg",
    manufacturer: "PharmaCare",
    usage: "Take 1-2 tablets every 4-6 hours as needed",
    sideEffects: "Rare side effects may include nausea, stomach pain, loss of appetite, headache",
    storage: "Store at room temperature away from moisture and heat"
  },
  {
    id: "02",
    name: "Vitamin C Complex",
    genericName: "Ascorbic Acid Complex",
    category: "vitamins",
    price: 14.99,
    image: medicine2,
    description: "Immune system support supplements",
    detailedDescription: `Vitamin C Complex is an essential nutrient that supports various bodily functions. This premium formula combines pure Ascorbic Acid with natural bioflavonoids for enhanced absorption and effectiveness.

Key Benefits:
• Supports immune system function
• Promotes collagen production
• Acts as an antioxidant
• Aids in iron absorption

Recommended for:
• Immune system support
• Skin health
• General wellness
• Athletic recovery`,
    inStock: true,
    dosage: "1000mg",
    manufacturer: "HealthPlus",
    usage: "Take 1 tablet daily with food",
    sideEffects: "Generally well-tolerated. High doses may cause stomach upset or diarrhea",
    storage: "Store in a cool, dry place"
  },
  {
    id: "03",
    name: "First Aid Kit",
    genericName: "Emergency Medical Kit",
    category: "first-aid",
    price: 24.99,
    image: medicine3,
    description: "Complete emergency care kit",
    detailedDescription: `Comprehensive first aid kit containing essential medical supplies for emergency situations. Perfect for home, office, or travel use.

Key Components:
• Adhesive bandages in various sizes
• Sterile gauze pads
• Medical tape
• Antiseptic wipes
• Scissors and tweezers
• Elastic bandage
• First aid manual

Recommended Uses:
• Minor cuts and scrapes
• Burns and blisters
• Sprains and strains
• Basic wound care
• Emergency preparedness`,
    inStock: true,
    manufacturer: "SafetyCare",
    usage: "Follow first aid manual instructions for specific situations",
    sideEffects: "No side effects. Use products before expiration date",
    storage: "Store in a dry, easily accessible location at room temperature"
  },
  {
    id: "04",
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    category: "antibiotics",
    price: 19.99,
    image: medicine4,
    description: "Broad-spectrum antibiotic",
    detailedDescription: `Amoxicillin is a penicillin-type antibiotic that fights bacteria in your body. It's used to treat many different types of bacterial infections.

Key Benefits:
• Treats various bacterial infections
• Fast-acting formula
• Well-established safety profile
• Effective against many common bacteria

Common Uses:
• Respiratory tract infections
• Ear infections
• Urinary tract infections
• Skin infections

Important Notice:
Prescription required. Complete the full course as prescribed by your healthcare provider.`,
    inStock: true,
    dosage: "250mg",
    manufacturer: "MediPharm",
    usage: "Take exactly as prescribed by your doctor. Typical dose: 1 capsule every 8 hours with or without food",
    sideEffects: "May cause diarrhea, nausea, skin rash. Seek immediate medical attention if allergic reaction occurs",
    storage: "Store at room temperature between 68-77°F (20-25°C)"
  },
  {
    id: "05",
    name: "Ibuprofen",
    genericName: "Ibuprofen USP",
    category: "painkillers",
    price: 12.99,
    image: medicine1,
    description: "Anti-inflammatory pain reliever",
    detailedDescription: `Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that reduces hormones causing inflammation, pain, and fever.

Key Benefits:
• Reduces inflammation
• Relieves pain and fever
• Works for multiple conditions
• Long-lasting relief

Common Uses:
• Headaches and migraines
• Arthritis pain
• Muscle sprains
• Menstrual cramps
• Back pain`,
    inStock: true,
    dosage: "200mg",
    manufacturer: "HealthCare Plus",
    usage: "Take 1-2 tablets every 4-6 hours as needed. Do not exceed 6 tablets in 24 hours",
    sideEffects: "May cause stomach upset, heartburn, dizziness. Take with food to reduce stomach irritation",
    storage: "Store at room temperature away from moisture"
  },
  {
    id: "06",
    name: "Multivitamin Complex",
    genericName: "Multivitamin and Mineral Supplement",
    category: "vitamins",
    price: 16.99,
    image: medicine2,
    description: "Complete daily vitamin supplement",
    detailedDescription: `A comprehensive multivitamin formula providing essential vitamins and minerals for daily health maintenance.

Key Benefits:
• Supports overall health
• Boosts energy levels
• Enhances immune function
• Promotes bone health

Contains:
• Vitamins A, B, C, D, E, K
• Essential minerals
• Antioxidants
• Zinc and Iron`,
    inStock: true,
    dosage: "One daily tablet",
    manufacturer: "VitaHealth",
    usage: "Take one tablet daily with food",
    sideEffects: "Generally well-tolerated. May cause mild stomach upset if taken on empty stomach",
    storage: "Store in a cool, dry place away from direct sunlight"
  }
  // Add more medicines as needed
]; 