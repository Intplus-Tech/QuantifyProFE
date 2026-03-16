import { Box, Hammer, Mountain, Users, LayoutGrid, Zap, Wrench } from "lucide-react";
import type { LibraryCategory, LibraryCategoryData } from "./types";

export const libraryCategories: LibraryCategory[] = [
  { id: "concrete", name: "Concrete", count: 124, icon: Box },
  { id: "steel", name: "Steel", count: 86, icon: Hammer },
  { id: "earthworks", name: "Earthworks", count: 42, icon: Mountain },
  { id: "labor", name: "Labor", count: 18, icon: Users },
  { id: "masonry", name: "Masonry", count: 31, icon: LayoutGrid },
  { id: "carpentry", name: "Carpentry", count: 55, icon: Wrench },
  { id: "mep", name: "MEP", count: 92, icon: Zap },
];

export const defaultLocations: string[] = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kaduna",
];

export const allCategoryData: Record<string, LibraryCategoryData> = {
  earthworks: {
    title: "Earthworks Rate",
    subtitle:
      "Manage unit rates for excavation, soil disposal, and specialized machinery.",
    columns: [
      { label: "BASE RATE", render: (item) => item.base },
      { label: "MACHINERY", render: (item) => item.mach },
      { label: "LABOR", render: (item) => item.lab },
    ],
    items: [
      { id: 1, title: "Bulk Excavation", desc: "Excluding disposal, up to 2m depth", unit: "m³", base: "4,500.00", mach: "7,500.00", lab: "2,500.00", final: "14,500.00" },
      { id: 2, title: "Trenching (per m)", desc: "For utilities, 600mm width, soft soil", unit: "m", base: "3,200.00", mach: "5,800.00", lab: "1,800.00", final: "10,800.00" },
      { id: 3, title: "Backfilling & Compaction", desc: "Layer thickness max 150mm", unit: "m³", base: "2,100.00", mach: "3,400.00", lab: "1,200.00", final: "6,700.00" },
      { id: 4, title: "Disposal of Surplus Soil", desc: "Up to 10km transport distance", unit: "m³", base: "1,800.00", mach: "6,200.00", lab: "900.00", final: "8,900.00" },
      { id: 5, title: "Rock Excavation", desc: "Requiring pneumatic breaker attachment", unit: "m³", base: "9,500.00", mach: "14,000.00", lab: "4,500.00", final: "28,000.00" },
    ],
    locationItems: {
      Lagos: [
        { id: 1, title: "Bulk Excavation", desc: "Excluding disposal, up to 2m depth", unit: "m³", base: "5,200.00", mach: "8,800.00", lab: "3,100.00", final: "17,100.00" },
        { id: 2, title: "Trenching (per m)", desc: "For utilities, 600mm width, soft soil", unit: "m", base: "3,900.00", mach: "6,700.00", lab: "2,200.00", final: "12,800.00" },
        { id: 3, title: "Backfilling & Compaction", desc: "Layer thickness max 150mm", unit: "m³", base: "2,600.00", mach: "4,100.00", lab: "1,500.00", final: "8,200.00" },
        { id: 4, title: "Disposal of Surplus Soil", desc: "Up to 10km transport distance", unit: "m³", base: "2,200.00", mach: "7,400.00", lab: "1,100.00", final: "10,700.00" },
        { id: 5, title: "Rock Excavation", desc: "Requiring pneumatic breaker attachment", unit: "m³", base: "11,500.00", mach: "16,500.00", lab: "5,500.00", final: "33,500.00" },
      ],
      Abuja: [
        { id: 1, title: "Bulk Excavation", desc: "Excluding disposal, up to 2m depth", unit: "m³", base: "4,800.00", mach: "8,100.00", lab: "2,800.00", final: "15,700.00" },
        { id: 2, title: "Trenching (per m)", desc: "For utilities, 600mm width, soft soil", unit: "m", base: "3,500.00", mach: "6,200.00", lab: "2,000.00", final: "11,700.00" },
        { id: 3, title: "Backfilling & Compaction", desc: "Layer thickness max 150mm", unit: "m³", base: "2,300.00", mach: "3,700.00", lab: "1,300.00", final: "7,300.00" },
        { id: 4, title: "Disposal of Surplus Soil", desc: "Up to 10km transport distance", unit: "m³", base: "2,000.00", mach: "6,700.00", lab: "1,000.00", final: "9,700.00" },
        { id: 5, title: "Rock Excavation", desc: "Requiring pneumatic breaker attachment", unit: "m³", base: "10,200.00", mach: "15,000.00", lab: "4,900.00", final: "30,100.00" },
      ],
      "Port Harcourt": [
        { id: 1, title: "Bulk Excavation", desc: "Excluding disposal, up to 2m depth", unit: "m³", base: "5,000.00", mach: "8,400.00", lab: "2,900.00", final: "16,300.00" },
        { id: 2, title: "Trenching (per m)", desc: "For utilities, 600mm width, soft soil", unit: "m", base: "3,700.00", mach: "6,400.00", lab: "2,100.00", final: "12,200.00" },
        { id: 3, title: "Backfilling & Compaction", desc: "Layer thickness max 150mm", unit: "m³", base: "2,400.00", mach: "3,900.00", lab: "1,400.00", final: "7,700.00" },
        { id: 4, title: "Disposal of Surplus Soil", desc: "Up to 10km transport distance", unit: "m³", base: "2,100.00", mach: "6,900.00", lab: "1,050.00", final: "10,050.00" },
        { id: 5, title: "Rock Excavation", desc: "Requiring pneumatic breaker attachment", unit: "m³", base: "10,800.00", mach: "15,600.00", lab: "5,100.00", final: "31,500.00" },
      ],
      Kaduna: [
        { id: 1, title: "Bulk Excavation", desc: "Excluding disposal, up to 2m depth", unit: "m³", base: "3,900.00", mach: "6,500.00", lab: "2,100.00", final: "12,500.00" },
        { id: 2, title: "Trenching (per m)", desc: "For utilities, 600mm width, soft soil", unit: "m", base: "2,800.00", mach: "4,900.00", lab: "1,500.00", final: "9,200.00" },
        { id: 3, title: "Backfilling & Compaction", desc: "Layer thickness max 150mm", unit: "m³", base: "1,800.00", mach: "2,900.00", lab: "1,000.00", final: "5,700.00" },
        { id: 4, title: "Disposal of Surplus Soil", desc: "Up to 10km transport distance", unit: "m³", base: "1,500.00", mach: "5,200.00", lab: "750.00", final: "7,450.00" },
        { id: 5, title: "Rock Excavation", desc: "Requiring pneumatic breaker attachment", unit: "m³", base: "8,200.00", mach: "12,100.00", lab: "3,800.00", final: "24,100.00" },
      ],
    },
  },

  labor: {
    title: "Labour Rate",
    subtitle: "Manage unit rates for Labor rate.",
    columns: [
      { label: "BASE RATE", render: (item) => item.base },
      { label: "MARKUP", render: (item) => item.markup },
    ],
    items: [
      { id: 1, title: "Ready-mix Concrete C25/30", desc: "20mm aggregate, 75mm slump", unit: "m³", base: "52,000.00", markup: "15%", final: "59,800.00" },
      { id: 2, title: "Formwork to Foundations", desc: "Softwood, height up to 1m", unit: "m²", base: "3,800.00", markup: "12%", final: "4,256.00" },
      { id: 3, title: "Steel Reinforcement A393 Mesh", desc: "Fabric reinforcement, 4.8m x 2.4m", unit: "Sheet", base: "28,500.00", markup: "18%", final: "33,630.00" },
      { id: 4, title: "Earthwork Excavation (Bulk)", desc: "General site clearance, up to 2m depth", unit: "m³", base: "4,500.00", markup: "8%", final: "4,860.00" },
    ],
    locationItems: {
      Lagos: [
        { id: 1, title: "Ready-mix Concrete C25/30", desc: "20mm aggregate, 75mm slump", unit: "m³", base: "62,000.00", markup: "15%", final: "71,300.00" },
        { id: 2, title: "Formwork to Foundations", desc: "Softwood, height up to 1m", unit: "m²", base: "4,600.00", markup: "12%", final: "5,152.00" },
        { id: 3, title: "Steel Reinforcement A393 Mesh", desc: "Fabric reinforcement, 4.8m x 2.4m", unit: "Sheet", base: "33,500.00", markup: "18%", final: "39,530.00" },
        { id: 4, title: "Earthwork Excavation (Bulk)", desc: "General site clearance, up to 2m depth", unit: "m³", base: "5,500.00", markup: "8%", final: "5,940.00" },
      ],
      Abuja: [
        { id: 1, title: "Ready-mix Concrete C25/30", desc: "20mm aggregate, 75mm slump", unit: "m³", base: "57,000.00", markup: "15%", final: "65,550.00" },
        { id: 2, title: "Formwork to Foundations", desc: "Softwood, height up to 1m", unit: "m²", base: "4,200.00", markup: "12%", final: "4,704.00" },
        { id: 3, title: "Steel Reinforcement A393 Mesh", desc: "Fabric reinforcement, 4.8m x 2.4m", unit: "Sheet", base: "30,500.00", markup: "18%", final: "35,990.00" },
        { id: 4, title: "Earthwork Excavation (Bulk)", desc: "General site clearance, up to 2m depth", unit: "m³", base: "4,800.00", markup: "8%", final: "5,184.00" },
      ],
      "Port Harcourt": [
        { id: 1, title: "Ready-mix Concrete C25/30", desc: "20mm aggregate, 75mm slump", unit: "m³", base: "59,000.00", markup: "15%", final: "67,850.00" },
        { id: 2, title: "Formwork to Foundations", desc: "Softwood, height up to 1m", unit: "m²", base: "4,400.00", markup: "12%", final: "4,928.00" },
        { id: 3, title: "Steel Reinforcement A393 Mesh", desc: "Fabric reinforcement, 4.8m x 2.4m", unit: "Sheet", base: "31,500.00", markup: "18%", final: "37,170.00" },
        { id: 4, title: "Earthwork Excavation (Bulk)", desc: "General site clearance, up to 2m depth", unit: "m³", base: "5,000.00", markup: "8%", final: "5,400.00" },
      ],
      Kaduna: [
        { id: 1, title: "Ready-mix Concrete C25/30", desc: "20mm aggregate, 75mm slump", unit: "m³", base: "45,000.00", markup: "15%", final: "51,750.00" },
        { id: 2, title: "Formwork to Foundations", desc: "Softwood, height up to 1m", unit: "m²", base: "3,200.00", markup: "12%", final: "3,584.00" },
        { id: 3, title: "Steel Reinforcement A393 Mesh", desc: "Fabric reinforcement, 4.8m x 2.4m", unit: "Sheet", base: "24,500.00", markup: "18%", final: "28,910.00" },
        { id: 4, title: "Earthwork Excavation (Bulk)", desc: "General site clearance, up to 2m depth", unit: "m³", base: "3,800.00", markup: "8%", final: "4,104.00" },
      ],
    },
  },

  mep: {
    title: "MEP Rate",
    subtitle:
      "Manage and verify comprehensive unit rates for Mechanical, Electrical, and Plumbing assemblies.",
    columns: [
      { label: "MATERIAL COST", render: (item) => item.mat },
      { label: "LABOUR COST", render: (item) => item.lab },
    ],
    items: [
      { id: 1, title: "HVAC Ductwork", desc: "Galvanized Steel, Rectangular, inc. supports", unit: "m²", mat: "18,500.00", lab: "6,200.00", final: "24,700.00" },
      { id: 2, title: "Copper Piping (15mm-28mm)", desc: "EN 1057 standard, brazed joints", unit: "m", mat: "4,200.00", lab: "1,800.00", final: "6,000.00" },
      { id: 3, title: "Electrical Conduits & Wiring", desc: "25mm PVC conduit inc. 2.5mm wiring", unit: "m", mat: "1,850.00", lab: "950.00", final: "2,800.00" },
      { id: 4, title: "Fire Suppression Sprinklers", desc: "Concealed pendent, 68°C, 15mm connection", unit: "nr", mat: "12,500.00", lab: "3,500.00", final: "16,000.00" },
      { id: 5, title: "Sanitary Ware Fittings", desc: "Wall hung WC suite inc. concealed cistern", unit: "nr", mat: "85,000.00", lab: "22,000.00", final: "107,000.00" },
    ],
    locationItems: {
      Lagos: [
        { id: 1, title: "HVAC Ductwork", desc: "Galvanized Steel, Rectangular, inc. supports", unit: "m²", mat: "22,000.00", lab: "7,500.00", final: "29,500.00" },
        { id: 2, title: "Copper Piping (15mm-28mm)", desc: "EN 1057 standard, brazed joints", unit: "m", mat: "5,100.00", lab: "2,200.00", final: "7,300.00" },
        { id: 3, title: "Electrical Conduits & Wiring", desc: "25mm PVC conduit inc. 2.5mm wiring", unit: "m", mat: "2,200.00", lab: "1,150.00", final: "3,350.00" },
        { id: 4, title: "Fire Suppression Sprinklers", desc: "Concealed pendent, 68°C, 15mm connection", unit: "nr", mat: "14,800.00", lab: "4,200.00", final: "19,000.00" },
        { id: 5, title: "Sanitary Ware Fittings", desc: "Wall hung WC suite inc. concealed cistern", unit: "nr", mat: "98,000.00", lab: "26,000.00", final: "124,000.00" },
      ],
      Abuja: [
        { id: 1, title: "HVAC Ductwork", desc: "Galvanized Steel, Rectangular, inc. supports", unit: "m²", mat: "20,000.00", lab: "6,800.00", final: "26,800.00" },
        { id: 2, title: "Copper Piping (15mm-28mm)", desc: "EN 1057 standard, brazed joints", unit: "m", mat: "4,600.00", lab: "2,000.00", final: "6,600.00" },
        { id: 3, title: "Electrical Conduits & Wiring", desc: "25mm PVC conduit inc. 2.5mm wiring", unit: "m", mat: "2,000.00", lab: "1,050.00", final: "3,050.00" },
        { id: 4, title: "Fire Suppression Sprinklers", desc: "Concealed pendent, 68°C, 15mm connection", unit: "nr", mat: "13,500.00", lab: "3,800.00", final: "17,300.00" },
        { id: 5, title: "Sanitary Ware Fittings", desc: "Wall hung WC suite inc. concealed cistern", unit: "nr", mat: "91,000.00", lab: "24,000.00", final: "115,000.00" },
      ],
      "Port Harcourt": [
        { id: 1, title: "HVAC Ductwork", desc: "Galvanized Steel, Rectangular, inc. supports", unit: "m²", mat: "21,000.00", lab: "7,100.00", final: "28,100.00" },
        { id: 2, title: "Copper Piping (15mm-28mm)", desc: "EN 1057 standard, brazed joints", unit: "m", mat: "4,800.00", lab: "2,100.00", final: "6,900.00" },
        { id: 3, title: "Electrical Conduits & Wiring", desc: "25mm PVC conduit inc. 2.5mm wiring", unit: "m", mat: "2,100.00", lab: "1,100.00", final: "3,200.00" },
        { id: 4, title: "Fire Suppression Sprinklers", desc: "Concealed pendent, 68°C, 15mm connection", unit: "nr", mat: "14,000.00", lab: "4,000.00", final: "18,000.00" },
        { id: 5, title: "Sanitary Ware Fittings", desc: "Wall hung WC suite inc. concealed cistern", unit: "nr", mat: "94,000.00", lab: "25,000.00", final: "119,000.00" },
      ],
      Kaduna: [
        { id: 1, title: "HVAC Ductwork", desc: "Galvanized Steel, Rectangular, inc. supports", unit: "m²", mat: "16,000.00", lab: "5,400.00", final: "21,400.00" },
        { id: 2, title: "Copper Piping (15mm-28mm)", desc: "EN 1057 standard, brazed joints", unit: "m", mat: "3,600.00", lab: "1,500.00", final: "5,100.00" },
        { id: 3, title: "Electrical Conduits & Wiring", desc: "25mm PVC conduit inc. 2.5mm wiring", unit: "m", mat: "1,600.00", lab: "800.00", final: "2,400.00" },
        { id: 4, title: "Fire Suppression Sprinklers", desc: "Concealed pendent, 68°C, 15mm connection", unit: "nr", mat: "10,800.00", lab: "3,000.00", final: "13,800.00" },
        { id: 5, title: "Sanitary Ware Fittings", desc: "Wall hung WC suite inc. concealed cistern", unit: "nr", mat: "74,000.00", lab: "19,000.00", final: "93,000.00" },
      ],
    },
  },

  steel: {
    title: "Steel Rate",
    subtitle: "Rates for reinforcement, structural steel, and mesh products.",
    columns: [
      { label: "BASE RATE", render: (item) => item.base },
      { label: "MARKUP", render: (item) => item.markup },
    ],
    items: [
      { id: 1, title: "Reinforcement Bars (H8-H32)", desc: "High-yield steel, ribbed bars to BS 4449", unit: "tonne", base: "485,000.00", markup: "15%", final: "557,750.00" },
      { id: 2, title: "Structural Steel Sections (I-Beams)", desc: "Universal Beams (UB) grade S355JR", unit: "linear m", base: "32,000.00", markup: "12%", final: "35,840.00" },
      { id: 3, title: "Steel Mesh Fabric (A393)", desc: "4.8m x 2.4m standard sheet, 10mm wire", unit: "Sheet", base: "28,500.00", markup: "18%", final: "33,630.00" },
    ],
    locationItems: {
      Lagos: [
        { id: 1, title: "Reinforcement Bars (H8-H32)", desc: "High-yield steel, ribbed bars to BS 4449", unit: "tonne", base: "560,000.00", markup: "15%", final: "644,000.00" },
        { id: 2, title: "Structural Steel Sections (I-Beams)", desc: "Universal Beams (UB) grade S355JR", unit: "linear m", base: "37,500.00", markup: "12%", final: "42,000.00" },
        { id: 3, title: "Steel Mesh Fabric (A393)", desc: "4.8m x 2.4m standard sheet, 10mm wire", unit: "Sheet", base: "33,000.00", markup: "18%", final: "38,940.00" },
      ],
      Abuja: [
        { id: 1, title: "Reinforcement Bars (H8-H32)", desc: "High-yield steel, ribbed bars to BS 4449", unit: "tonne", base: "510,000.00", markup: "15%", final: "586,500.00" },
        { id: 2, title: "Structural Steel Sections (I-Beams)", desc: "Universal Beams (UB) grade S355JR", unit: "linear m", base: "34,000.00", markup: "12%", final: "38,080.00" },
        { id: 3, title: "Steel Mesh Fabric (A393)", desc: "4.8m x 2.4m standard sheet, 10mm wire", unit: "Sheet", base: "30,000.00", markup: "18%", final: "35,400.00" },
      ],
      "Port Harcourt": [
        { id: 1, title: "Reinforcement Bars (H8-H32)", desc: "High-yield steel, ribbed bars to BS 4449", unit: "tonne", base: "530,000.00", markup: "15%", final: "609,500.00" },
        { id: 2, title: "Structural Steel Sections (I-Beams)", desc: "Universal Beams (UB) grade S355JR", unit: "linear m", base: "35,500.00", markup: "12%", final: "39,760.00" },
        { id: 3, title: "Steel Mesh Fabric (A393)", desc: "4.8m x 2.4m standard sheet, 10mm wire", unit: "Sheet", base: "31,500.00", markup: "18%", final: "37,170.00" },
      ],
      Kaduna: [
        { id: 1, title: "Reinforcement Bars (H8-H32)", desc: "High-yield steel, ribbed bars to BS 4449", unit: "tonne", base: "440,000.00", markup: "15%", final: "506,000.00" },
        { id: 2, title: "Structural Steel Sections (I-Beams)", desc: "Universal Beams (UB) grade S355JR", unit: "linear m", base: "28,500.00", markup: "12%", final: "31,920.00" },
        { id: 3, title: "Steel Mesh Fabric (A393)", desc: "4.8m x 2.4m standard sheet, 10mm wire", unit: "Sheet", base: "25,000.00", markup: "18%", final: "29,500.00" },
      ],
    },
  },

  default: {
    title: "Category Rate",
    subtitle: "Manage unit rates for this category.",
    columns: [{ label: "BASE RATE", render: (item) => item.base }],
    items: [
      { id: 1, title: "Sample Item", desc: "Sample description", unit: "m", base: "4,500.00", final: "44,500.00" },
    ],
  },
};
