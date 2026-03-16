import type { BOQReport } from "./types";

export const MOCK_BOQ_REPORT: BOQReport = {
  meta: {
    companyName: "QuantifyPro",
    companySubtitle: "AI-Powered Construction Estimation",
    dateGenerated: "August 15, 2024",
    ref: "BOQ-2024-0847",
    location: "Dubai, UAE",
    reportTitle: "BILL OF QUANTITIES (BOQ)",
    reportSubtitle: "Final Summary Report - August 2024",
  },

  costCategories: [
    { name: "Civil Works",     value: 1928250, color: "bg-amber-500",   percentage: 45 },
    { name: "MEP Services",    value: 1285500, color: "bg-blue-500",    percentage: 30 },
    { name: "Finishing Works",  value: 1071250, color: "bg-emerald-500", percentage: 25 },
  ],

  resourceAllocations: [
    { label: "Labor",      percentage: 37, color: "bg-amber-500"   },
    { label: "Materials",  percentage: 62, color: "bg-blue-500"    },
    { label: "Equipment",  percentage: 12, color: "bg-emerald-500" },
  ],

  sections: [
    {
      id: "earthworks",
      title: "1.0 - Earthworks & Site Preparation",
      items: [
        { item: "1.1", description: "Site Clearing and Grubbing",              unit: "m²",   qty: 2500,  rate: 15.00,  total: 37500   },
        { item: "1.2", description: "Excavation for Foundations (0-3m depth)",  unit: "m³",   qty: 1800,  rate: 45.00,  total: 81000   },
        { item: "1.3", description: "Backfilling with Selected Material",       unit: "m³",   qty: 1200,  rate: 35.00,  total: 42000   },
        { item: "1.4", description: "Compaction of Subgrade",                   unit: "m²",   qty: 3000,  rate: 12.00,  total: 36000   },
        { item: "1.5", description: "Dewatering Works",                         unit: "days", qty: 30,    rate: 850.00, total: 25500   },
      ],
      subtotal: 222000,
    },
    {
      id: "concrete",
      title: "2.0 - Concrete Work",
      items: [
        { item: "2.1", description: "Plain Cement Concrete (PCC) — Grade M15", unit: "m³",   qty: 450,   rate: 120.00, total: 54000   },
        { item: "2.2", description: "Reinforced Concrete — Grade M30",          unit: "m³",   qty: 1200,  rate: 180.00, total: 216000  },
        { item: "2.3", description: "Steel Reinforcement (Fe 500D)",            unit: "tons", qty: 85,    rate: 950.00, total: 80750   },
        { item: "2.4", description: "Formwork — Plywood (Grade A)",             unit: "m²",   qty: 3200,  rate: 45.00,  total: 144000  },
        { item: "2.5", description: "Curing Compound Application",              unit: "m²",   qty: 4500,  rate: 8.00,   total: 36000   },
      ],
      subtotal: 530750,
    },
    {
      id: "structural",
      title: "3.0 - Structural Steel Works",
      items: [
        { item: "3.1", description: "Structural Steel Fabrication & Erection",  unit: "tons", qty: 120,   rate: 2200.00, total: 264000  },
        { item: "3.2", description: "High Strength Bolts (Grade 10.9)",         unit: "nos",  qty: 8500,  rate: 12.00,   total: 102000  },
        { item: "3.3", description: "Steel Surface Treatment & Painting",       unit: "m²",   qty: 4200,  rate: 35.00,   total: 147000  },
      ],
      subtotal: 513000,
    },
    {
      id: "masonry",
      title: "4.0 - Masonry & Blockwork",
      items: [
        { item: "4.1", description: "AAC Block Wall — 200mm Thick",            unit: "m²",   qty: 6000,  rate: 55.00,  total: 330000  },
        { item: "4.2", description: "Cement Plaster (External) — 20mm",         unit: "m²",   qty: 4800,  rate: 28.00,  total: 134400  },
        { item: "4.3", description: "Cement Plaster (Internal) — 15mm",         unit: "m²",   qty: 9600,  rate: 22.00,  total: 211200  },
      ],
      subtotal: 675600,
    },
    {
      id: "mep",
      title: "5.0 - MEP Services",
      items: [
        { item: "5.1", description: "Electrical — Wiring & Conduits",          unit: "lot",  qty: 1,     rate: 485000.00, total: 485000  },
        { item: "5.2", description: "Plumbing — Supply & Drainage",            unit: "lot",  qty: 1,     rate: 342000.00, total: 342000  },
        { item: "5.3", description: "HVAC — Ductwork & Equipment",             unit: "lot",  qty: 1,     rate: 458500.00, total: 458500  },
        { item: "5.4", description: "Fire Fighting System",                     unit: "lot",  qty: 1,     rate: 257650.00, total: 257650  },
      ],
      subtotal: 1543150,
    },
    {
      id: "finishing",
      title: "6.0 - Finishing Works",
      items: [
        { item: "6.1", description: "Ceramic Floor Tiles — 600×600mm",         unit: "m²",   qty: 3500,  rate: 65.00,  total: 227500  },
        { item: "6.2", description: "Painting — Interior (2 Coats Emulsion)",  unit: "m²",   qty: 9600,  rate: 18.00,  total: 172800  },
        { item: "6.3", description: "False Ceiling — Gypsum Board",            unit: "m²",   qty: 2800,  rate: 55.00,  total: 154000  },
        { item: "6.4", description: "Aluminium Windows & Glazing",             unit: "m²",   qty: 1200,  rate: 185.00, total: 222000  },
      ],
      subtotal: 776300,
    },
  ],

  grandTotal: 4285000,

  terms: [
    "1. All rates are inclusive of overheads and profits unless stated otherwise.",
    "2. Quantities are estimated based on IFC drawings dated June 2024.",
    "3. Subject to material price fluctuation clauses in Appendix A.",
  ],
};
