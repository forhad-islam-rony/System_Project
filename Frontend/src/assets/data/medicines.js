import medicine1 from "../images/medicine1.jpg";
import medicine2 from "../images/medicine2.jpg";
import medicine3 from "../images/medicine3.jpg";
import medicine4 from "../images/medicine4.jpg";

export const medicines = [
  {
    id: "01",
    name: "Paracetamol",
    category: "painkillers",
    price: 9.99,
    image: medicine1,
    description: "Fast-acting pain relief medication",
    inStock: true,
    dosage: "500mg",
    manufacturer: "PharmaCare"
  },
  {
    id: "02",
    name: "Vitamin C Complex",
    category: "vitamins",
    price: 14.99,
    image: medicine2,
    description: "Immune system support supplements",
    inStock: true,
    dosage: "1000mg",
    manufacturer: "HealthPlus"
  },
  {
    id: "03",
    name: "First Aid Kit",
    category: "first-aid",
    price: 24.99,
    image: medicine3,
    description: "Complete emergency care kit",
    inStock: true,
    manufacturer: "SafetyCare"
  },
  {
    id: "04",
    name: "Amoxicillin",
    category: "antibiotics",
    price: 19.99,
    image: medicine4,
    description: "Broad-spectrum antibiotic",
    inStock: true,
    dosage: "250mg",
    manufacturer: "MediPharm"
  },
  // Add more medicines as needed
]; 