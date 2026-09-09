/**
 * The client's elemental Bill of Quantities template — 15 element groups,
 * transcribed from the supplied workbook (Main Building Element).
 *
 * The whole bill renders whether or not the AI measured a row: a QS prices
 * against the full document, and the unmeasured rows are exactly the ones they
 * need to see and fill by hand. `fill` names the measured figure that populates
 * a row's quantity; every other row renders with a blank quantity.
 *
 * Item letters are the workbook's own — they restart per section in some
 * element groups and run continuously in others, so they are written out here
 * rather than generated.
 */

/** Which measured figure feeds a template row. */
export type FillKey =
  // substructure — excavation
  | "exc.groundbeam"
  | "exc.pilecap"
  | "ws.groundbeam"
  | "ws.pilecap"
  | "fill.making"
  | "treat.level"
  // substructure — piling
  | "pile.trim"
  | "pile.concrete"
  | "pile.rebar"
  // substructure — blinding
  | "blind.pilecap"
  | "blind.groundbeam"
  | "blind.raft"
  // substructure — concrete
  | "conc.pilecap"
  | "conc.groundbeam"
  | "conc.bedliftslab"
  | "conc.liftwall.sub"
  // substructure — formwork
  | "form.groundbeam"
  | "form.pilecap"
  | "form.wall.sub"
  | "form.column.sub"
  // substructure — reinforcement
  | "rebar.pilecap"
  | "rebar.groundbeam"
  | "rebar.bed"
  | "rebar.wall.sub"
  // frame
  | "conc.columns"
  | "conc.liftwall"
  | "conc.shearwall"
  | "conc.beams"
  | "rebar.columns"
  | "rebar.beams"
  | "rebar.liftwall"
  | "rebar.shearwall"
  | "form.beams"
  | "form.columns"
  | "form.liftwall"
  | "form.shearwall"
  // upper floors
  | "conc.slabs"
  | "rebar.slabs"
  | "form.slabs"
  | "form.slabedge"
  // roof
  | "conc.roofslab"
  | "conc.roofbeam"
  | "rebar.roof"
  | "form.roof"
  // staircase
  | "conc.stairs"
  | "rebar.stairs"
  | "form.stairs"
  // walls
  | "block.extwall"
  | "block.intwall"
  | "conc.lintels"
  | "rebar.lintels"
  | "form.lintels"
  // finishes
  | "finish.render.int"
  | "finish.render.ext"
  | "finish.paint.int"
  | "finish.paint.ext"
  | "finish.ceiling";

export interface TemplateRow {
  /** the workbook's own item letter; absent on headings and notes */
  no?: string;
  kind: "item" | "header" | "note";
  /** bold lead-in rendered before the description, on the same line */
  leadIn?: string;
  text: string;
  unit?: string;
  fill?: FillKey;
}

export interface TemplateSection {
  id: string;
  /** SMM code where the workbook gives one */
  code?: string;
  title: string;
  rows: TemplateRow[];
}

export interface TemplateGroup {
  id: string;
  title: string;
  sections: TemplateSection[];
}

const h = (text: string): TemplateRow => ({ kind: "header", text });
const n = (text: string): TemplateRow => ({ kind: "note", text });

const REINF_NOTE =
  "High tensile steel bar reinforcement to B.S. 4461 in straight, curved and bent bars:";
const SAWN = "Sawn formwork to:-";
const TILE_PC_NOTE =
  '****The prices inserted for the "supply only" tiles are deemed to be the basic rates of such materials delivered to site. However, the client reserves the right to supply such materials and wherever such is the case the contractor shall not be entitled to any loss of profit or other claims.';

export const BOQ_TEMPLATE: TemplateGroup[] = [
  // ── ELEMENT NO. 1 ───────────────────────────────────────────────────────
  {
    id: "substructure",
    title: "SUBSTRUCTURAL WORKS (ALL PROVISIONAL)",
    sections: [
      {
        id: "sub:preamble",
        title: "GENERAL INFORMATION",
        rows: [
          h("Disposal Of Ground Water"),
          n(
            "Tenderers Are To Visit The Site Before Tendering To Ascertain The Current Ground Water Level Of The Site And Allow For Disposal Of Water In Excavation. No Claim Shall Be Entertained For Under Estimating The Extent Of The Disposal Required.",
          ),
          h("Excavation And Earthwork"),
          n(
            "The Work In This Section Comprises Excavation And Earthwork; Rates For Excavation Shall Be Deemed To Include Earthwork Support / Shoring And Ramming Bottom Of Excavation.",
          ),
          n(
            "The Tenderers Shall Allow For All These In His Rates For Excavation And The Rates Shall Be Deemed To Include Same",
          ),
        ],
      },
      {
        id: "sub:D20",
        code: "D20",
        title: "EXCAVATING AND FILING",
        rows: [
          {
            no: "A",
            kind: "item",
            leadIn: "Site preparation:",
            text: "Clearing site of vegetation, grassing, shrub, undergrowth, hedges, trees and tree stubs not exceeding 600mm girth",
            unit: "sq.m",
          },
          {
            no: "B",
            kind: "item",
            leadIn: "Excavating:",
            text: "Excavate to remove topsoil average 150mm deep including disposal of same from site",
            unit: "sq.m",
          },
          {
            no: "C",
            kind: "item",
            text: "Excavate to receive ground beams commencing from stripped level not exceeding 1.0m deep",
            unit: "cu.m",
            fill: "exc.groundbeam",
          },
          {
            no: "D",
            kind: "item",
            text: "Ditto pile caps commencing from stripped level exceeding 1.0m but not exceeding 2.00m deep",
            unit: "cu.m",
            fill: "exc.pilecap",
          },
          {
            no: "E",
            kind: "item",
            leadIn: "Breaking out existing materials:",
            text: "Extra for breaking and grubbing out reinforced concrete footing in foundation (provisional)",
            unit: "-",
          },
          h("Working space"),
          n(
            "Working space allowance to excavations for basement and the likes, trenches, pile caps and ground beams; including earthwork support, disposal, backfilling with selected excavated materials in:",
          ),
          {
            no: "F",
            kind: "item",
            text: "Trenches for ground beams",
            unit: "cu.m",
            fill: "ws.groundbeam",
          },
          { no: "G", kind: "item", text: "Pile Caps", unit: "cu.m", fill: "ws.pilecap" },
          {
            no: "H",
            kind: "item",
            leadIn: "Disposal of excavated materials",
            text: "Carefully deposit selected excavated materials on site in temporary spoil heaps located at contractor's discretion.",
            unit: "-",
          },
          {
            no: "I",
            kind: "item",
            leadIn: "Filing:",
            text: "Filing to make up levels compacted in layers of 150mm; average thickness exceeding 250mm obtained from carefully selected on site spoil heaps",
            unit: "cu.m",
            fill: "fill.making",
          },
          {
            no: "J",
            kind: "item",
            leadIn: "Leveling and compacting",
            text: "Level and compact bottom of excavation to receive foundation",
            unit: "sq.m",
            fill: "treat.level",
          },
          {
            no: "K",
            kind: "item",
            text: "Allow for keeping excavation free from general water",
            unit: "-",
          },
        ],
      },
      {
        id: "sub:D30",
        title: "CAST IN PLACE CONCRETE PILING / IN-SITU CONCRETE",
        rows: [
          {
            no: "A",
            kind: "item",
            leadIn: "D30: CAST IN PLACE CONCRETE PILING",
            text: "Breaking and trimming tops of reinforced concrete 600mm diameter piles 1000mm long (average) and dispose arising materials from site including preparation and integration of reinforcement into pile caps or ground beams",
            unit: "-",
            fill: "pile.trim",
          },
          h("E10: IN - SITU CONCRETE / LARGE PRECAST CONCRETE"),
          n(
            "Plain in-situ concrete developing minimum works strength of 15N/mm2 at 28 days filled in blinding",
          ),
          {
            no: "B",
            kind: "item",
            text: "Beneath pile caps",
            unit: "cu.m",
            fill: "blind.pilecap",
          },
          {
            no: "C",
            kind: "item",
            text: "Ditto ground beams",
            unit: "cu.m",
            fill: "blind.groundbeam",
          },
          { no: "D", kind: "item", text: "Ditto raft slab", unit: "cu.m", fill: "blind.raft" },
          {
            no: "E",
            kind: "item",
            leadIn: "25mm Cement and sand (1:10) blinding in protective screed",
            text: "On damp proof membrane",
            unit: "cu.m",
          },
          n(
            "Reinforced in-situ concrete developing minimum works strength of 35N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          { no: "F", kind: "item", text: "Pile caps", unit: "cu.m", fill: "conc.pilecap" },
          n(
            "Reinforced in-situ concrete developing minimum works strength of 35N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          {
            no: "G",
            kind: "item",
            text: "Ground beams",
            unit: "cu.m",
            fill: "conc.groundbeam",
          },
          {
            no: "H",
            kind: "item",
            text: "Beds and lift slab; 150 - 450mm thick",
            unit: "cu.m",
            fill: "conc.bedliftslab",
          },
          {
            no: "I",
            kind: "item",
            text: "Walls; thickness 150 - 450mm in lift",
            unit: "cu.m",
            fill: "conc.liftwall.sub",
          },
          n(
            "Reinforced in-situ concrete developing minimum works strength of 25N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          { no: "I", kind: "item", text: "Steps or ramps or planter wall", unit: "cu.m" },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "J",
            kind: "item",
            text: "Sides of ground beams; height exceeding 1.00m",
            unit: "sq.m",
            fill: "form.groundbeam",
          },
          {
            no: "K",
            kind: "item",
            text: "Sides of foundation; plain vertical; height exceeding 1.00m; pile caps",
            unit: "sq.m",
            fill: "form.pilecap",
          },
          {
            no: "L",
            kind: "item",
            text: "Sides of walls; plain vertical; height exceeding 1.00m",
            unit: "sq.m",
            fill: "form.wall.sub",
          },
          {
            no: "M",
            kind: "item",
            text: "Sides of Column in fdn; plain vertical; height 250mm - 500m",
            unit: "sq.m",
            fill: "form.column.sub",
          },
          {
            no: "N",
            kind: "item",
            text: "Edges of bed or steps; plain vertical; height not exceeding 250mm",
            unit: "sq.m",
          },
        ],
      },
      {
        id: "sub:E30",
        title: "REINFORCEMENT AND WATERPROOFING",
        rows: [
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          n(REINF_NOTE),
          {
            no: "A",
            kind: "item",
            text: "12mm Diameter bar in pile caps,",
            unit: "tons",
            fill: "rebar.pilecap",
          },
          {
            no: "B",
            kind: "item",
            text: "Ditto ground beams",
            unit: "tons",
            fill: "rebar.groundbeam",
          },
          { no: "C", kind: "item", text: "Ditto Bed", unit: "tons", fill: "rebar.bed" },
          { no: "D", kind: "item", text: "Ditto wall", unit: "tons", fill: "rebar.wall.sub" },
          {
            no: "E",
            kind: "item",
            text: "Mesh fabric to B.S.4483 reference A393 (10mm) weighing 6.16kg/sq.m spaced at 200mm centers both ways with 150mm side and end laps (measured net: no. allowance made for laps) in ground slab",
            unit: "sq.m",
          },
          h("WATERPROOFING"),
          h("J30: LIQUID APPLIED TANKING/DAMP PROOF MEMBRANES"),
          n(
            "Polythene sheeting, vapour barrier; gauge 1000; 150 welted lapped joints from approved manufacturer and laid at contractor's discretion",
          ),
          { no: "F", kind: "item", text: "Plain areas; horizontal", unit: "sq.m" },
          n(
            "4mm Mariseal 250 polyurethane coating as manufactured by in flat covering laid in accordance with the manufacturer's fixing instructions warranty policy on cement and sand or concrete base",
          ),
          { no: "G", kind: "item", text: "Plain areas; horizontal", unit: "sq.m" },
          { no: "H", kind: "item", text: "Ditto vertical", unit: "sq.m" },
          h("BUILDING FABRIC SUNDRIES"),
          h("P22: SEALANT JOINTS"),
          n("Construction joint"),
          {
            no: "H",
            kind: "item",
            text: "5mm x 20mm Aquafin Waterstop hydrophilic swelling rubber strip set horizontally in SoudaSeal FC adhesive on concrete surface in joints strictly in accordance with manufacturer's fixing instructions & warranty policy",
            unit: "lm",
          },
        ],
      },
      {
        id: "sub:P22",
        title: "BRICK / BLOCK WALLING AND PROVISIONAL WORK",
        rows: [
          h("P22: BRICK / BLOCK WALLING"),
          {
            no: "A",
            kind: "item",
            text: "150mm Sandcrete hollow blockwalling filled with concrete grade 20 in protective skin wall; vertical",
            unit: "sq.m",
          },
          h("A54: PROVISIONAL WORK"),
          {
            no: "B",
            kind: "item",
            text: "Allow a Provisional Sum for Additional Works in Substructure",
            unit: "prov sum",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 2 ───────────────────────────────────────────────────────
  {
    id: "frame",
    title: "FRAME (Provisional)",
    sections: [
      {
        id: "frame:main",
        title: "IN - SITU CONCRETE / LARGE PRECAST CONCRETE",
        rows: [
          h("IN - SITU CONCRETE/ LARGE PRECAST CONCRETE"),
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          n(
            "Reinforced in-situ concrete developing minimum works strength of 35N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          { no: "A", kind: "item", text: "Columns; generally", unit: "cu.m", fill: "conc.columns" },
          n(
            "Reinforced in-situ concrete developing minimum works strength of 35N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          {
            no: "B",
            kind: "item",
            text: "Walls; thickness 150 - 450mm (lift walls)",
            unit: "cu.m",
            fill: "conc.liftwall",
          },
          {
            no: "C",
            kind: "item",
            text: "Walls; thickness 150 - 450mm (Shear walls)",
            unit: "cu.m",
            fill: "conc.shearwall",
          },
          {
            no: "D",
            kind: "item",
            text: "Beams; attached or isolated",
            unit: "cu.m",
            fill: "conc.beams",
          },
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          n(REINF_NOTE),
          { no: "E", kind: "item", text: "10 - 25mm Diameter bar in columns", unit: "tons", fill: "rebar.columns" },
          { no: "F", kind: "item", text: "Ditto in beam", unit: "tons", fill: "rebar.beams" },
          {
            no: "G",
            kind: "item",
            text: "10 - 25mm Diameter bar in lift",
            unit: "tons",
            fill: "rebar.liftwall",
          },
          { no: "H", kind: "item", text: "Ditto Shear wall", unit: "tons", fill: "rebar.shearwall" },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "I",
            kind: "item",
            text: "Beams; attached or isolated to slab; regular shaped; rectangular; height to soffit 3.0m - 4.5m",
            unit: "sq.m",
            fill: "form.beams",
          },
          {
            no: "J",
            kind: "item",
            text: "Vertical sides of columns; regular shaped; square and rectangular",
            unit: "sq.m",
            fill: "form.columns",
          },
          {
            no: "K",
            kind: "item",
            text: "Vertical sides of wall (lift)",
            unit: "sq.m",
            fill: "form.liftwall",
          },
          {
            no: "L",
            kind: "item",
            text: "Vertical sides of wall (Shear)",
            unit: "sq.m",
            fill: "form.shearwall",
          },
          {
            no: "M",
            kind: "item",
            text: "Openings in walls; plain; not exceeding 250mm thick",
            unit: "lm",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 3 ───────────────────────────────────────────────────────
  {
    id: "upper-floors",
    title: "UPPER FLOORS",
    sections: [
      {
        id: "upper:main",
        title: "IN - SITU CONCRETE / LARGE PRECAST CONCRETE",
        rows: [
          h("IN - SITU CONCRETE/ LARGE PRECAST CONCRETE"),
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          n(
            "Reinforced in-situ concrete developing minimum works strength of 30N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          {
            no: "A",
            kind: "item",
            text: "Slabs; thickness 150mm - 450mm",
            unit: "cu.m",
            fill: "conc.slabs",
          },
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          n(REINF_NOTE),
          { no: "B", kind: "item", text: "10mm to 16mm in slab", unit: "tons", fill: "rebar.slabs" },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "C",
            kind: "item",
            text: "Horizontal soffits of slab not exceeding 200mm thick; height to soffit 3.0 - 4.5m",
            unit: "sq.m",
            fill: "form.slabs",
          },
          {
            no: "D",
            kind: "item",
            text: "Edge of suspended slab; plain vertical; not exceeding 250mm thick",
            unit: "lm",
            fill: "form.slabedge",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 4 ───────────────────────────────────────────────────────
  {
    id: "roof",
    title: "ROOF",
    sections: [
      {
        id: "roof:concrete",
        title: "IN - SITU CONCRETE / LARGE PRECAST CONCRETE",
        rows: [
          h("IN - SITU CONCRETE/ LARGE PRECAST CONCRETE"),
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          n(
            "Reinforced in-situ concrete developing minimum works strength of 30N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          {
            no: "A",
            kind: "item",
            text: "Roof slab; 150mm - 450mm thick",
            unit: "cu.m",
            fill: "conc.roofslab",
          },
          {
            no: "B",
            kind: "item",
            text: "Beam; attached or isolated",
            unit: "cu.m",
            fill: "conc.roofbeam",
          },
          { no: "C", kind: "item", text: "Upstands / plinth", unit: "cu.m" },
          { no: "D", kind: "item", text: "Roof gutter", unit: "cu.m" },
          n("Profile deck"),
          {
            kind: "item",
            text: "Supply and install Comflor 70 (guage 1.0mm minimum) self-sustaining (with minimal shuttering) galvanized corrugated steel profile or equal approved alternative; in convenient sizes or as per manufacturer's standard sizing with and including strap secured edge plate fastened to reinforced concrete / structural steel beams (m/s) and lapped at the sides with the aid of Hilti hammer screws and metal construction screws respectively in accordance with the manufacturer's fixing instructions and warranty policy; height to soffit 3.0 - 4.5m",
            unit: "sq.m",
          },
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          n(REINF_NOTE),
          {
            no: "C",
            kind: "item",
            text: "10 - 25mm in roof slab or beam",
            unit: "tons",
            fill: "rebar.roof",
          },
          {
            kind: "item",
            text: "Mesh fabric to B.S.4483 reference A252 (8mm) weighing 3.95kg/sq.m spaced at 200mm centers both ways with 150mm side and end laps (measured net: no. allowance made for laps) in floor slab",
            unit: "sq.m",
          },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "C",
            kind: "item",
            text: "Horizontal soffits of slab not exceeding 200mm thick; height to soffit 3.0 - 4.5m",
            unit: "sq.m",
            fill: "form.roof",
          },
          {
            no: "C",
            kind: "item",
            text: "Roof beams; attached or isolated to slab; regular shaped; rectangular; height to soffit 3.0 - 4.5m",
            unit: "sq.m",
          },
          {
            no: "C",
            kind: "item",
            text: "Upstand beam; attached to slab; regular shaped; rectangular",
            unit: "sq.m",
          },
          {
            no: "A",
            kind: "item",
            text: "Edges of suspended roof slab; plain vertical; height not exceeding 250mm",
            unit: "lm",
          },
        ],
      },
      {
        id: "roof:waterproofing",
        title: "WATERPROOFING AND SURFACE FINISHES",
        rows: [
          h("WATERPROOFING"),
          h("J30: LIQUID APPLIED TANKING/DAMP PROOF MEMBRANES"),
          n(
            "Tanking and damp proofing; width exceeding 300m; pitch not exceeding 15 degrees from horizontal",
          ),
          {
            no: "B",
            kind: "item",
            text: "4mm Mariseal 250 polyurethane coating as manufactured by Meesrs. Advanced Concrete Technologies Ltd situated @ Grace Plaza, 65, Allen Avenue, Ikeja (+2348182435430, +2348182435381) in flat covering laid in accordance with the manufacturer's fixing instructions & warranty policy on cement and sand or concrete base",
            unit: "sq.m",
          },
          { no: "C", kind: "item", text: "Ditto linnings to gutter 655mm girth", unit: "lm" },
          { no: "D", kind: "item", text: "Extra for dishing out around medium pipe", unit: "nr" },
          h("BUILDING FABRIC SUNDRIES"),
          h("P10: SUNDRY INSULATION/PROOFING WORK/ FIRE STOPS"),
          {
            no: "E",
            kind: "item",
            text: "20mm thick high density grade AKfix SPR 230 2K spray foam insulation as supplied by Meesrs. Advanced Concrete Technologies Ltd situated @ Grace Plaza, 65, Allen Avenue, Ikeja (+2348182435430, +2348182435381) applied on surface of slab strictly as per manufacturer's fixing instructions & warranty policy",
            unit: "sq.m",
          },
          h("SURFACE FINISHES"),
          h("M20: PLASTERED/RENDERED/ROUGHCAST COATINGS"),
          {
            no: "F",
            kind: "item",
            text: "38mm Cement and sand 1:3 floated bed in protective screeding; level and to falls only not exceeding 15 degrees from horizontal",
            unit: "sq.m",
          },
          {
            no: "G",
            kind: "item",
            text: "75mm (Average) Cement and sand 1:3 floated bed with waterproof additive finished to falls; level and to falls only not exceeding 15 degrees from horizontal (before insulation)",
            unit: "sq.m",
          },
          {
            no: "H",
            kind: "item",
            text: "50mm x 50mm Cement and sand 1:3 triangular angle fillet",
            unit: "lm",
          },
          h("F31: PRECAST CONCRETE SILLS/LINTELS/COPING /FEATURES"),
          {
            no: "I",
            kind: "item",
            text: "100mm x 325mm Precast concrete 1:11/2:3-12mm aggregate weathered and throated coping finished fair on exposed surfaces including all necessary formwork and reinforcement",
            unit: "lm",
          },
        ],
      },
      {
        id: "roof:steel",
        title: "STRUCTURAL / CARCASSING METAL / TIMBER",
        rows: [
          h("STRUCTURAL/CARCASSING METAL/TIMBER"),
          h("G10: STRUCTURAL STEEL FRAMING"),
          n(
            "Weldable steel, B.S.EN10025 Grade S275, hot rolled sections B.S.4 Part 1 and B.S.EN10034; welded fabrication in accordance with B.S.5950 Part 2 respectively in:",
          ),
          n("Roof members (please refer to drawing package for details)"),
          n("Framing fabrication; trusses and built up girders comprising:"),
          { no: "J", kind: "item", text: "203mm x 133mm x 25mm Universal Beam", unit: "tons" },
          { no: "A", kind: "item", text: "254mm x 146mm x 31mm Universal Beam", unit: "tons" },
          n(
            "Framing, fabrication; cleats, base plates, holding down bolts and accessroies; weight not exceeding 40kg/m:",
          ),
          {
            no: "B",
            kind: "item",
            text: "Allow for bolts of various sizes including making holes in members, angle cleats, base plate, anchors etc",
            unit: "tons",
          },
          n("Framing, erection; permanent erection"),
          {
            no: "C",
            kind: "item",
            text: "Allow for erection of the entire structural steel members",
            unit: "tons",
          },
          h("CLADDING/COVERING"),
          h("ROOF COVERING(ALL PROVISIONAL)"),
          {
            no: "A",
            kind: "item",
            text: "0.7mm longspan Aluminum roof sheet with single lap and 150mm end laps fixed to hardwood purlin with all accessories executed complete in accordance with the manufacturer's instructions.",
            unit: "m2",
          },
          { no: "B", kind: "item", text: "Extra for ridge 600mm girth", unit: "m" },
          h("STRUCTURAL/CARCASSING METAL/TIMBER"),
          n("Sawn treated hardwood ( All Provisional )"),
          { no: "C", kind: "item", text: "150 × 50mm Rafter", unit: "m" },
          { no: "D", kind: "item", text: "150 × 50mm Tie beam.", unit: "m" },
          { no: "E", kind: "item", text: "100 × 50mm struts", unit: "m" },
          { no: "F", kind: "item", text: "75 × 50 mm purlins", unit: "m" },
          { no: "G", kind: "item", text: "50 × 50 mm noggins", unit: "m" },
          { no: "H", kind: "item", text: "300 × 25mm fascia boards", unit: "m" },
          { no: "I", kind: "item", text: "150 × 50mm wall plate.", unit: "m" },
          h("MASONRY"),
          h("F10: BRICK/BLOCK WALLING"),
          {
            kind: "item",
            text: "Hollow sandcrete blockwall, lightweight aggregate, blocks, B.S.6073, 450 × 225, compressive strength not less than 2.76N/mm2, standard finish; keyed both sides, in cement mortar (1:4);flush smooth pointing as work proceeds.",
            unit: "sq.m",
          },
          { no: "A", kind: "item", text: "225mm Wall", unit: "sq.m" },
          h("WINDOWS / DOORS / STAIRS"),
          h("L21: METAL DOORS / SHUTTERS / HATCHES"),
          {
            no: "B",
            kind: "item",
            text: "20mm Diameter high yield steel cat ladder rung 750mm girth with ends ragged and cast into concrete",
            unit: "nr",
          },
          {
            no: "C",
            kind: "item",
            text: "3mm Chequered plate access hatch 705 × 900mm x 225mm high complete with frame, hinges and lifting hook",
            unit: "nr",
          },
          { no: "D", kind: "item", text: "Ditto; 5650mm x 1800mm x 225mm high", unit: "nr" },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 5 ───────────────────────────────────────────────────────
  {
    id: "staircase",
    title: "STAIRCASE & CIRCULATION CORE",
    sections: [
      {
        id: "stair:main",
        title: "IN - SITU CONCRETE / LARGE PRECAST CONCRETE",
        rows: [
          h("IN - SITU CONCRETE/ LARGE PRECAST CONCRETE"),
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          n(
            "Reinforced in-situ concrete developing minimum works strength of 25N/mm2 at 28 days filled into formwork and vibrated in:-",
          ),
          {
            no: "A",
            kind: "item",
            text: "Staircases; generally",
            unit: "cu.m",
            fill: "conc.stairs",
          },
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          n(REINF_NOTE),
          {
            no: "B",
            kind: "item",
            text: "10-25mm Diameter in links, stirrups and binders",
            unit: "tons",
            fill: "rebar.stairs",
          },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "C",
            kind: "item",
            text: "Stairflights of regular and irregular shaped;1500mm wide; 200mm thick waist, 163mm thick equal riser, 300mm wide string; junction with wall",
            unit: "lm",
          },
          {
            no: "D",
            kind: "item",
            text: "Stairflights;1300mm wide; 200mm thick waist, 163mm thick risers of varying lengths, 300 wide string; junction with wall",
            unit: "lm",
          },
          {
            no: "E",
            kind: "item",
            text: "Horizontal soffits of landing not exceeding 200mm thick ; height to soffit 3.0 - 4.5m",
            unit: "sq.m",
            fill: "form.stairs",
          },
        ],
      },
      {
        id: "stair:M40",
        code: "M40",
        title: "STONE/CONCRETE/QUARRY/CERAMIC TILING/MOSAIC",
        rows: [
          n("General information"),
          n(TILE_PC_NOTE),
          n("Floors, treads & risers (SUPPLY ONLY)"),
          {
            no: "F",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Savannah Caliza floor tiles as manufactured by Messrs. Porcelanosa Group or approved equal, laid level on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (main & service staircase)",
            unit: "sq.m",
          },
          { no: "G", kind: "item", text: "Ditto 100mm skirtings", unit: "lm" },
          {
            no: "H",
            kind: "item",
            text: "H.T. Savannah Caliza; Treads; 300mm wide; thrice grooved; with rounded edge (staircase type 1 & 3); 1500mm long",
            unit: "lm",
          },
          {
            no: "I",
            kind: "item",
            text: "Ditto; Risers; plain; 175mm high - staircase type 1 & 3",
            unit: "lm",
          },
          { no: "A", kind: "item", text: "Ditto; staircase type 2; 1350mm long", unit: "lm" },
          {
            no: "B",
            kind: "item",
            text: "H.T. Savannah Caliza; Risers; 175mm high; staircase type 2",
            unit: "lm",
          },
          {
            no: "C",
            kind: "item",
            text: "H.T. Savannah Caliza; Treads; 600mm wide; thrice grooved; with rounded edge (staircase type 4); 1200mm long",
            unit: "lm",
          },
          { no: "D", kind: "item", text: "Ditto; staircase type 4; 1200mm long", unit: "lm" },
          n("Floors, treads & risers (WET AREAS)"),
          {
            no: "E",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Savannah Caliza floor tiles, laid level on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (Wet area)",
            unit: "sq.m",
          },
          h("WINDOWS/DOORS/STAIRS"),
          h("L30: STAIRS/WALKWAYS/ BALUSTRADES"),
          {
            no: "F",
            kind: "item",
            text: "Include the Prime Cost Sum of N4,000,000.00 for Mild Steel balustrade to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "G", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          {
            no: "H",
            kind: "item",
            text: "Include the Prime Cost Sum of N6,500,000.00 for Laminated glass balustrade to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "I", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          h("M10: SAND CEMENT/CONCRETE/SCREEDS/FLOORING"),
          n("Cement and sand (1:3);"),
          {
            no: "J",
            kind: "item",
            text: "30mm Cement and sand screed; level and to falls only not exceeding 15 degrees from horizontal",
            unit: "sq.m",
          },
          {
            no: "K",
            kind: "item",
            text: "Ditto 12mm backing over 100mm but not exceeding 200mm wide",
            unit: "lm",
          },
          {
            no: "L",
            kind: "item",
            text: "Ditto 30mm screeded bed over 200mm but not exceeding 300mm wide",
            unit: "lm",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 6 ───────────────────────────────────────────────────────
  {
    id: "external-walls",
    title: "EXTERNAL WALLS",
    sections: [
      {
        id: "extwall:F10",
        title: "MASONRY",
        rows: [
          h("MASONRY"),
          h("F10: BRICK/BLOCK WALLING"),
          n(
            "Hollow sandcrete blockwall, lightweight aggregate, blocks, B.S.6073, 450 × 225, compressive strength not less than 3.0N/mm2, standard finish; keyed both sides, in cement mortar (1:4);flush smooth pointing as work proceeds.",
          ),
          { no: "A", kind: "item", text: "225mm Wall", unit: "sq.m", fill: "block.extwall" },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 7 ───────────────────────────────────────────────────────
  {
    id: "internal-walls",
    title: "INTERNAL WALLS AND PARTITIONS",
    sections: [
      {
        id: "intwall:main",
        title: "MASONRY",
        rows: [
          h("MASONRY"),
          h("F10: BRICK/BLOCK WALLING"),
          n(
            "Hollow sandcrete blockwall, lightweight aggregate, blocks, B.S.6073, 450 × 225, compressive strength not less than 3.0N/mm2, standard finish; keyed both sides, in cement mortar (1:4);flush smooth pointing as work proceeds.",
          ),
          { no: "A", kind: "item", text: "100mm Wall", unit: "sq.m" },
          { no: "B", kind: "item", text: "150mm Wall", unit: "sq.m" },
          { no: "C", kind: "item", text: "230mm Wall", unit: "sq.m", fill: "block.intwall" },
          h("IN - SITU CONCRETE / LARGE PRECAST CONCRETE"),
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          {
            no: "C",
            kind: "item",
            text: "Reinforced in-situ concrete developing minimum works strength of 25N/mm2 at 28 days filled into formwork and vibrated in lintel",
            unit: "cu.m",
            fill: "conc.lintels",
          },
          h("E30: REINFORCEMENT FOR IN-SITU CONCRETE"),
          {
            no: "C",
            kind: "item",
            text: "10mm-16mm Diameter high tensile steel bar reinforcement in straight, curved and bent bars to B.S. 4449 in lintel",
            unit: "tons",
            fill: "rebar.lintels",
          },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          n(SAWN),
          {
            no: "C",
            kind: "item",
            text: "Sawn formwork to sides and soffit of lintel; attached to wall; regular shaped ; rectangular shaped; height to soffit 1.50 - 3.0m",
            unit: "sq.m",
            fill: "form.lintels",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 8 ───────────────────────────────────────────────────────
  {
    id: "windows",
    title: "WINDOWS AND EXTERNAL DOORS",
    sections: [
      {
        id: "windows:L11",
        title: "WINDOWS/DOORS/STAIRS",
        rows: [
          h("WINDOWS/DOORS/STAIRS"),
          h("L11: METAL WINDOWS / ROOFLIGHTS / SCREENS / LOUVRES"),
          {
            kind: "item",
            text: "Powder coated aluminium 6mm tinted glass framed windows 40mm thick double leaf single swing Polished solid cored panel door size 750mm x 2400mm lipped on all edges and faced with 6mm selected 'Anagrie' veneer plywood complete with frames, architraves & relevant ironmongery",
            unit: "nr",
          },
          { no: "A", kind: "item", text: "Ditto size 900mm x 2400mm high ditto", unit: "nr" },
          { no: "B", kind: "item", text: "Ditto; 1200mm x 2400mm high ditto", unit: "nr" },
          { no: "C", kind: "item", text: "Ditto; 2100mm x 2400mm high ditto", unit: "nr" },
          { no: "D", kind: "item", text: "Ditto; 3750mm x 2400mm high (pocket door)", unit: "nr" },
          { no: "E", kind: "item", text: "Ditto; 500mm x 2400mm high (duct)", unit: "nr" },
          h("Burglary proofing"),
          n(
            "Approved decorative painted burglar proof screen to windows opening consisting of 25 × 25mm square hollow pipes (1.2mm thick), on both sides embedded into window hood including 2 base coat of red oxide and 1 finishing coat of gloss paint (All as per Architect's details) centre",
          ),
          { no: "A", kind: "item", text: "750mm x 2400mm", unit: "nr" },
          { no: "B", kind: "item", text: "Ditto size 900mm x 2400mm high ditto", unit: "nr" },
          { no: "C", kind: "item", text: "Ditto; 1200mm x 2400mm high ditto", unit: "nr" },
          { no: "D", kind: "item", text: "Ditto; 2100mm x 2400mm high ditto", unit: "nr" },
          { no: "E", kind: "item", text: "Ditto; 3750mm x 2400mm high (pocket door)", unit: "nr" },
          { no: "F", kind: "item", text: "Ditto; 500mm x 2400mm high (duct)", unit: "nr" },
          {
            no: "A",
            kind: "item",
            text: "Include the Prime Cost Sum of N00,000,000.00 for Powder Coated Aluminium Windows & Doors to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "B", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          {
            no: "C",
            kind: "item",
            text: "Include the Prime Cost Sum of N 00,000,000.00 for 40mm square pipe Aluminium fluted panels with 40mm spacing placed on flat aluminium sheet and anchored to the wall to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "D", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          {
            no: "E",
            kind: "item",
            text: "Include the Prime Cost Sum of N00,000,000.00 for Aluminium fins to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "F", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          {
            no: "G",
            kind: "item",
            text: "Include the Prime Cost Sum of N 00,000,000.00 for Curtain wall glazing including spandrel panels and glass partitions to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "H", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 9 ───────────────────────────────────────────────────────
  {
    id: "internal-doors",
    title: "INTERNAL DOORS",
    sections: [
      {
        id: "doors:L20",
        title: "WINDOWS/DOORS/STAIRS",
        rows: [
          h("WINDOWS/DOORS/STAIRS"),
          h("L20: TIMBER DOORS/SHUTTERS/HATCHES"),
          n("Flush Doors & Panel Doors"),
          {
            no: "A",
            kind: "item",
            text: "Include the Prime Cost Sum of N00,000,000.00 for the Supply and Installation of Timber Flush Doors & Ironmongery to be executed by a nominated supplier",
            unit: "P.C Sum",
          },
          { no: "B", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          n(
            "Take delivery and install only the following doors complete with frames, architraves & relevant ironmongery items:",
          ),
          {
            no: "C",
            kind: "item",
            text: "40mm thick double leaf single swing Polished solid cored panel door size 750mm x 2400mm lipped on all edges and faced with 6mm selected 'Anagrie' veneer plywood complete with frames, architraves & relevant ironmongery",
            unit: "nr",
          },
          { no: "D", kind: "item", text: "Ditto size 900mm x 2400mm high ditto", unit: "nr" },
          { no: "E", kind: "item", text: "Ditto; 1200mm x 2400mm high ditto", unit: "nr" },
          { no: "F", kind: "item", text: "Ditto; 2100mm x 2400mm high ditto", unit: "nr" },
          { no: "G", kind: "item", text: "Ditto; 3750mm x 2400mm high (pocket door)", unit: "nr" },
          { no: "H", kind: "item", text: "Ditto; 500mm x 2400mm high (duct)", unit: "nr" },
          {
            no: "I",
            kind: "item",
            text: "Single leaf single swing 2hrs fire doors size 1000mm x 2400mm high",
            unit: "nr",
          },
          n(
            "Supply and install the following well planed, seasoned and anti-termite treated hardwood timber in:",
          ),
          {
            no: "J",
            kind: "item",
            text: "Wrot hardwood door sub frame unit to suit door opening size 750mm x 2400mm high bedded into wall with steel straps",
            unit: "nr",
          },
          {
            no: "K",
            kind: "item",
            text: "Wrot hardwood door sub frame unit to suit door opening size 900mm x 2400mm high ditto",
            unit: "nr",
          },
          { no: "L", kind: "item", text: "Ditto size 1200mm x 2400mm ditto", unit: "nr" },
          { no: "M", kind: "item", text: "Ditto; 2100mm x 2400mm high ditto", unit: "nr" },
          { no: "N", kind: "item", text: "Ditto; 3750mm x 2400mm high", unit: "nr" },
          { no: "O", kind: "item", text: "Ditto; 500mm x 2400mm high", unit: "nr" },
          {
            no: "P",
            kind: "item",
            text: "Include the Prime Cost Sum of N00,000,000.00 for Aluminium fins to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 10 ──────────────────────────────────────────────────────
  {
    id: "plumbing",
    title: "PLUMBING AND MECHANICAL INSTALLATION",
    sections: [
      {
        id: "plumbing:main",
        title: "PLUMBING AND MECHANICAL",
        rows: [
          {
            no: "A",
            kind: "item",
            text: "Fire fighting installations; hand appliances; fire hose reels, dry riser, landing valves, breeching inlet, fire pumps, pipes and fittings",
            unit: "Sum",
          },
          {
            no: "B",
            kind: "item",
            text: "Plumbing installation to consist of sanitary wares installation, accessories, pressed water tank, soil and waste water , fire protection installation etc",
            unit: "Sum",
          },
          {
            no: "C",
            kind: "item",
            text: "HVAC installation to comprise supply of cassette units, extract fans, air terminal , duct dampers,refrigerant copper pipeworks, condensate upvc pipework",
            unit: "Sum",
          },
          h("PROVISIONAL WORK"),
          { no: "D", kind: "item", text: "Include the following Provision Sums:" },
          {
            no: "E",
            kind: "item",
            text: "Builder's works in connection with Mechanical and Plumbing Installations; including but not limited to cutting, forming or drilling walls, floors or ceilings to allow services to pass, ensuring structural integrity is not compromised, chasing block/brickwork for conduits or pipes, sealing holes, making good plaster & other finishes e.t.c ( If any)",
            unit: "Sum",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 11 ──────────────────────────────────────────────────────
  {
    id: "electrical",
    title: "ELECTRICAL INSTALLATION",
    sections: [
      {
        id: "electrical:main",
        title: "ELECTRICAL",
        rows: [
          {
            no: "A",
            kind: "item",
            text: "Electrical services installation; Comprising of trunking and cabletray, wiring cables, wiring accessories , lighting fittings, including socket outlets, NEPA statutory charges, ups distribution boards etc",
            unit: "Sum",
          },
          {
            no: "B",
            kind: "item",
            text: "Low voltage installation to include fire deduction and public address system, data networking",
            unit: "Sum",
          },
          { no: "C", kind: "item", text: "Earthing and lighting protection", unit: "Sum" },
          h("PROVISIONAL WORK"),
          { no: "D", kind: "item", text: "Include the following Provision Sums:" },
          {
            no: "E",
            kind: "item",
            text: "Builder's works in connection with Electrical & ELV Installations; including but not limited to cutting, forming or drilling walls, floors or ceilings to allow services to pass, ensuring structural integrity is not compromised, chasing block/brickwork for conduits or pipes, sealing holes, making good plaster & other finishes e.t.c ( If any)",
            unit: "Sum",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 12 ──────────────────────────────────────────────────────
  {
    id: "floor-finishes",
    title: "FLOOR FINISHES",
    sections: [
      {
        id: "floor:M40",
        title: "TILING",
        rows: [
          n("General Information"),
          n(TILE_PC_NOTE),
          h("M40: STONE/CONCRETE/QUARRY/CERAMIC TILING/MOSAIC"),
          n("SUPPLY ONLY the following floor finishes/tiles"),
          {
            no: "A",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Savannah caliza floor tiles as manufactured by Messrs. Porcelanosa Group or approved equal; laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (regular areas e.g Reception, Store, lift lobby, entrance porch 2, panel room, female toilet, PA,Dirctor's office etc)",
            unit: "sq.m",
          },
          { no: "B", kind: "item", text: "10mm x 100mm skirting ditto", unit: "lm" },
          {
            no: "C",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Nantes caliza Non-Slip floor tiles as manufactured by Messrs. Porcelanosa Group or approved equal; laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s)",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "10mm x 100mm skirting ditto", unit: "lm" },
          {
            no: "E",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Verbier Silver floor tiles as manufactured by Messrs. Porcelanosa Group or approved equal; laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (Male toilets, Male toilet shower & WC etc)",
            unit: "sq.m",
          },
          {
            no: "F",
            kind: "item",
            text: "H.T. Savannah Caliza; Treads; 300mm wide; thrice grooved; with rounded edge 3050mm long",
            unit: "lm",
          },
          { no: "G", kind: "item", text: "Ditto; Risers; plain; 175mm high 3050mm long", unit: "lm" },
          {
            no: "H",
            kind: "item",
            text: "H.T. Savannah Caliza; Treads; 300mm wide; thrice grooved; with rounded edge 6130mm long",
            unit: "lm",
          },
          { no: "I", kind: "item", text: "Ditto; Risers; plain; 175mm high 6130mm long", unit: "lm" },
          n("FIX ONLY the following floor finishes/tiles"),
          {
            no: "J",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Savannah caliza floor tiles laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (regular areas e.g Reception, Store, lift lobby, entrance porch 2, panel room, female toilet, PA,Dirctor's office etc)",
            unit: "sq.m",
          },
          { no: "K", kind: "item", text: "10mm x 100mm skirting ditto", unit: "lm" },
          {
            no: "A",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Nantes caliza Non-Slip floor tiles laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (Entrance porch, WTP, Terrace, Entrance porch etc)",
            unit: "sq.m",
          },
          { no: "B", kind: "item", text: "10mm x 100mm skirting ditto", unit: "lm" },
          {
            no: "C",
            kind: "item",
            text: "10mm x 1200mm x 1200mm Verbier Silver floor tiles laid level or to falls only not exceeding 15 degrees from horizontal on screeded bed (m/s) and fixed with tile adhesive, butt jointed and pointed in matching grout (Male toilets, Male toilet shower & WC etc)",
            unit: "sq.m",
          },
          h("WATERPROOFING"),
          h("J30: LIQUID APPLIED TANKING/DAMP PROOF MEMBRANES"),
          n(
            "Costar 2K cementitious waterproofing as manufactured by Meesrs. Advanced Concrete Technologies Ltd situated @ Grace Plaza, 65, Allen Avenue, Ikeja (+2348182435430, +2348182435381) flat covering laid in accordance with the manufacturer's fixing instructions warranty policy on cement and sand or concrete base:",
          ),
          {
            no: "D",
            kind: "item",
            text: "Plain areas; horizontal (wet areas + terrace and service roof)",
            unit: "sq.m",
          },
          h("M10: SAND CEMENT/CONCRETE/SCREEDS/FLOORING"),
          n("Cement and sand (1:3)"),
          {
            no: "E",
            kind: "item",
            text: "38mm Cement and sand protective screed including water proof additives; level and to falls only not exceeding 15 degrees from horizontal",
            unit: "sq.m",
          },
          {
            no: "F",
            kind: "item",
            text: "40mm Cement and sand screed; level and to falls only not exceeding 15 degrees from horizontal",
            unit: "sq.m",
          },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 13 ──────────────────────────────────────────────────────
  {
    id: "wall-finishes",
    title: "WALL FINISHES",
    sections: [
      {
        id: "wallfin:M20",
        title: "PLASTERED/RENDERED/ROUGHCAST COATINGS",
        rows: [
          h("M20: PLASTERED/RENDERED/ROUGHCAST COATINGS"),
          n("12mm Cement And Sand (1:4) One Coat Internal Rendering On:-"),
          {
            no: "A",
            kind: "item",
            text: "Walls; concrete or blockwork base; girth exceeding 300mm",
            unit: "sq.m",
            fill: "finish.render.int",
          },
          { no: "B", kind: "item", text: "girth not exceeding 300mm", unit: "lm" },
          { no: "C", kind: "item", text: "Isolated columns", unit: "lm" },
          n("12mm Cement And Sand (1:4) One Coat External Rendering On:-"),
          {
            no: "A",
            kind: "item",
            text: "Walls; girth exceeding 300mm",
            unit: "sq.m",
            fill: "finish.render.ext",
          },
          { no: "A", kind: "item", text: "Girth not exceeding 300mm", unit: "lm" },
          n("POP Screeding"),
          {
            no: "D",
            kind: "item",
            text: "Plaster of paris screed rendering on plastered internal surfaces steel trowelled and sanding on completion",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "Ditto; external walls", unit: "sq.m" },
          { no: "D", kind: "item", text: "Girth not exceeding 300mm - internally", unit: "lm" },
          { no: "D", kind: "item", text: "Girth not exceeding 300mm -externally", unit: "lm" },
          h("M40: STONE/CONCRETE/QUARRY/CERAMIC TILING/MOSAIC"),
          n("General Information"),
          n(TILE_PC_NOTE),
          n("SUPPLY ONLY the following wall finishes/tiles"),
          {
            no: "A",
            kind: "item",
            text: "6mm x 450mm x 1200mm Verbier Silver wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Male toilets and W.C)",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "Ditto girth not exceeding 300mm", unit: "lm" },
          {
            no: "A",
            kind: "item",
            text: "6mm x 600mm x 1500mm Treccia Blanco wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Female toilets and W.C)",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "Ditto girth not exceeding 300mm", unit: "lm" },
          {
            no: "A",
            kind: "item",
            text: "6mm x 450mm x 1200mm Samui Verbier Silver wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Accent wall)",
            unit: "sq.m",
          },
          {
            no: "A",
            kind: "item",
            text: "6mm x 600mm x 1500mm Deco Treccia Blanco wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Accent wall)",
            unit: "sq.m",
          },
          n("FIX ONLY the following wall finishes/tiles"),
          {
            no: "A",
            kind: "item",
            text: "6mm x 450mm x 1200mm Verbier Silver wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Male toilets and W.C)",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "Ditto girth not exceeding 300mm", unit: "lm" },
          {
            no: "A",
            kind: "item",
            text: "6mm x 600mm x 1500mm Treccia Blanco wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Female toilets and W.C)",
            unit: "sq.m",
          },
          { no: "D", kind: "item", text: "Ditto girth not exceeding 300mm", unit: "lm" },
          {
            no: "A",
            kind: "item",
            text: "6mm x 450mm x 1200mm Samui Verbier Silver wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Accent wall)",
            unit: "sq.m",
          },
          {
            no: "A",
            kind: "item",
            text: "6mm x 600mm x 1500mm Deco Treccia Blanco wall tiles laid with 2mm square joints on screeded backing (measured separately) bedded in plain cement mortar and grouted in neat matching grout (Accent wall)",
            unit: "sq.m",
          },
          n("Accessories"),
          {
            no: "D",
            kind: "item",
            text: "Extra for stainless steel wall edge tiles trim strip 3 × 20mm with rounded edge",
            unit: "lm",
          },
          h("M60: PAINTING/CLEAR FINISHING"),
          {
            no: "D",
            kind: "item",
            text: 'Prepare and apply one mist coat and two full coats of "Dulux" (CAPL) or other equal and approved emulsion paint on rendered internal walls; width exceeding 300mm',
            unit: "sq.m",
            fill: "finish.paint.int",
          },
          { no: "D", kind: "item", text: "Girth not exceeding 300mm", unit: "lm" },
          {
            no: "D",
            kind: "item",
            text: 'Prepare and apply one mist coat and two full coats of "Dulux" (CAPL) weather-shield textured or other equal and approved textured paint on rendered external walls; width exceeding 300mm',
            unit: "sq.m",
            fill: "finish.paint.ext",
          },
          { no: "D", kind: "item", text: "Girth not exceeding 300mm", unit: "lm" },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 14 ──────────────────────────────────────────────────────
  {
    id: "ceiling-finishes",
    title: "CEILING FINISHES",
    sections: [
      {
        id: "ceiling:main",
        title: "PLASTERED/RENDERED/ROUGHCAST COATINGS",
        rows: [
          h("M20: PLASTERED/RENDERED/ROUGHCAST COATINGS"),
          n("12mm Cement And Sand (1:4) One Coat Internal Rendering On Concrete Surface:"),
          {
            no: "A",
            kind: "item",
            text: "Ceiling; girth exceeding 300mm",
            unit: "sq.m",
            fill: "finish.ceiling",
          },
          { no: "B", kind: "item", text: "Sloping soffit; girth exceeding 300mm", unit: "sq.m" },
          h("LINING/SHEATHING/DRY PARTITIONING"),
          h("K10: PLASTERBOARD DRY LINING"),
          n("12mm Cement And Sand (1:4) One Coat External Rendering On:-"),
          {
            no: "A",
            kind: "item",
            text: "12mm Suspended plasterboard board ceiling on galvanised steel framing; fixing to galvanised wire hangers, with tamper proof heads ; spot filling whole surface with slurry and sanded including POP surface screeding",
            unit: "sq.m",
          },
          {
            no: "D",
            kind: "item",
            text: "Extra over for shadow line 250mm wide x 250mm deep and with internal recess 75mm wide complete with corner bead and other fixing accessories",
            unit: "lm",
          },
          {
            no: "A",
            kind: "item",
            text: "12mm Suspended moisture resistant plasterboard board ceiling on galvanised steel framing; fixing to galvanised wire hangers,with tamper proof heads ; spot filling whole surface with slurry and sanded including POP surface screeding (wet area)",
            unit: "sq.m",
          },
          {
            no: "A",
            kind: "item",
            text: "Supply and install 6mm Kalsi board complete with Kalsi-furring metal framing and other standard fixing accessories for a perfect finish; in soffit (car park)",
            unit: "sq.m",
          },
          h("M60: PAINTING/CLEAR FINISHING"),
          {
            no: "A",
            kind: "item",
            text: 'Prepare and apply one mist coat and two full coats of "Dulux" (CAPL) or other equal and approved emulsion paint on plastered soffit; girth exceeding 300mm',
            unit: "sq.m",
          },
          { no: "A", kind: "item", text: "Ditto plasterboard soffit", unit: "sq.m" },
          { no: "A", kind: "item", text: "Ditto; girth not exceeding 300mm", unit: "sq.m" },
        ],
      },
    ],
  },

  // ── ELEMENT NO. 15 ──────────────────────────────────────────────────────
  {
    id: "fittings",
    title: "FITTINGS AND FIXTURES",
    sections: [
      {
        id: "fittings:main",
        title: "IN-SITU CONCRETE AND FURNITURE",
        rows: [
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          {
            no: "A",
            kind: "item",
            text: "100mm Reinforced in-situ concrete developing minimum works strength of 25N/mm2 at 28 days filled into formwork and vibrated in vanity slab or duct wall",
            unit: "cu.m",
          },
          h("E10: MIXING/CASTING/CURING/IN-SITU CONCRETE"),
          {
            no: "B",
            kind: "item",
            text: "8mm-10mm High tensile steel bar reinforcement to B.S. 4461 in straight, curved and bent bars in vanity top",
            unit: "tons",
          },
          h("E20: FORMWORK FOR IN-SITU CONCRETE"),
          {
            no: "C",
            kind: "item",
            text: "Horizontal soffits of vanity slab not exceeding 200mm thick ; height to soffit not exceeding 1.50m",
            unit: "sq.m",
          },
          {
            no: "D",
            kind: "item",
            text: "Edges of suspended vanity slab; plain vertical; height not exceeding 75mm",
            unit: "lm",
          },
          h("FURNITURE / EQUIPMENT"),
          h("N10: GENERAL FIXTURES/FURNISHINGS/ EQUIPMENT"),
          {
            no: "E",
            kind: "item",
            text: "20mm Marble Slab P.C. N00,000.00 Per Square Metre In Vanity Top 600mm Wide Rounded On Two Edges And With Aperture For Insert Basins And Pointed In A Neat Matching Grout",
            unit: "lm",
          },
          { no: "F", kind: "item", text: "Ditto face piece 90mm wide", unit: "lm" },
          {
            no: "D",
            kind: "item",
            text: "100mm high vanity splashback with pencil round edges",
            unit: "lm",
          },
          {
            no: "A",
            kind: "item",
            text: "Allow a Prime Cost Sum of N00,000,000.00 for Kitchen Cabinet and Equipment to be executed by a nominated subcontractor",
            unit: "P.C Sum",
          },
          { no: "A", kind: "item", text: "Add for main contractors profit and attendance", unit: "%" },
          h("M60: PAINTING/CLEAR FINISHING"),
          {
            no: "A",
            kind: "item",
            text: 'Prepare and apply one mist coat and two full coats of "Dulux" (CAPL) or other equal and approved emulsion paint on plastered soffit; girth exceeding 300mm',
            unit: "sq.m",
          },
          { no: "A", kind: "item", text: "Ditto plasterboard soffit", unit: "sq.m" },
          { no: "A", kind: "item", text: "Ditto; girth not exceeding 300mm", unit: "sq.m" },
        ],
      },
    ],
  },
];

/** Closing adjustments applied to the sub-total, in order. */
export const BOQ_ADJUSTMENTS = [{ label: "Preliminaries", percentage: 10 }];
