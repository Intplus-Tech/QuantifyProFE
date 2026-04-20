import {
  defaultBlindingElement,
  defaultSubstructureData,
} from "./constants";
import type {
  BlindingElement,
  ConcreteElement,
  Step3Data,
  Step4Data,
} from "./types";

export function filterSuperstructure(
  superstructure: Record<string, ConcreteElement>,
  hasLift: boolean,
  hasStairs: boolean,
): Record<string, ConcreteElement> {
  const nextSuperstructure = { ...superstructure };

  if (!hasLift) {
    delete nextSuperstructure["Lift Wall"];
  }

  if (!hasStairs) {
    delete nextSuperstructure["Stairs"];
  }

  return nextSuperstructure;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mergeSubstructureLikeSchema<T>(schema: T, current: unknown): T {
  if (!isPlainObject(schema) || !isPlainObject(current)) {
    return schema;
  }

  const nextValue = Array.isArray(schema) ? schema : { ...schema };

  for (const key of Object.keys(schema)) {
    const schemaValue = (schema as Record<string, unknown>)[key];
    const currentValue = current[key];

    if (isPlainObject(schemaValue) && isPlainObject(currentValue)) {
      (nextValue as Record<string, unknown>)[key] = mergeSubstructureLikeSchema(schemaValue, currentValue);
    } else if (key in current) {
      (nextValue as Record<string, unknown>)[key] = currentValue;
    }
  }

  return nextValue as T;
}

export function normalizeScopeState(scope: Step3Data): Step3Data {
  const hasPool = scope.scopeConfig.hasPool;
  const hasLift = scope.scopeConfig.lift === "Yes";
  const hasStairs = Number(scope.scopeConfig.noOfFloors) > 0;
  const projectType = scope.scopeConfig.projectType;
  const foundationType = scope.scopeConfig.foundationType;

  if (projectType === "Piling Alone") {
    return {
      ...scope,
      blinding: {},
      substructure: defaultSubstructureData(),
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  if (projectType === "Foundation & Carcass Only" && foundationType === "Pile") {
    const substructureSchema = defaultSubstructureData();
    const mergedSubstructure = mergeSubstructureLikeSchema(
      substructureSchema,
      scope.substructure,
    );

    return {
      ...scope,
      blinding: {
        ...(hasPool
          ? {
            "Swimming Pool":
              scope.blinding["Swimming Pool"] ?? defaultBlindingElement(),
          }
          : {}),
        "Pile Cap": scope.blinding["Pile Cap"] ?? defaultBlindingElement(),
        "Oversite Slab":
          scope.blinding["Oversite Slab"] ?? defaultBlindingElement(),
      },
      substructure: mergedSubstructure,
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  if (projectType === "Carcass with finishes") {
    const blindingElements: Record<string, BlindingElement> = {};

    if (hasPool) {
      blindingElements["Swimming Pool"] =
        scope.blinding["Swimming Pool"] ?? defaultBlindingElement();
    }

    if (foundationType === "Pile") {
      blindingElements["Pile Cap"] =
        scope.blinding["Pile Cap"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] =
        scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    } else if (foundationType === "Raft") {
      blindingElements["Raft Foundation"] =
        scope.blinding["Raft Foundation"] ?? defaultBlindingElement();
      blindingElements["Ground Beam"] =
        scope.blinding["Ground Beam"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] =
        scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
      blindingElements["Pad Footing"] =
        scope.blinding["Pad Footing"] ?? defaultBlindingElement();
    } else if (foundationType === "Strip") {
      blindingElements["Strip Foundation"] =
        scope.blinding["Strip Foundation"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] =
        scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    } else if (foundationType === "Raft Pile with Basement") {
      blindingElements["Pile Cap"] =
        scope.blinding["Pile Cap"] ?? defaultBlindingElement();
      blindingElements["Ground Beam"] =
        scope.blinding["Ground Beam"] ?? defaultBlindingElement();
      blindingElements["Oversite Slab"] =
        scope.blinding["Oversite Slab"] ?? defaultBlindingElement();
    }

    return {
      ...scope,
      blinding: blindingElements,
      substructure: defaultSubstructureData(),
      superstructure: filterSuperstructure(scope.superstructure, hasLift, hasStairs),
    };
  }

  const nextBlinding = { ...scope.blinding };

  if (!hasPool) {
    delete nextBlinding["Swimming Pool"];
  }

  if (foundationType === "Pile") {
    delete nextBlinding["Ground Beam"];
  }

  if (
    projectType !== "Foundation & Carcass Only" &&
    projectType !== "Carcass with finishes"
  ) {
    delete nextBlinding["Pad Footing"];
    delete nextBlinding["Strip Foundation"];
  }

  if (
    (projectType === "Foundation & Carcass Only" ||
      projectType === "Carcass with finishes") &&
    foundationType !== "Raft"
  ) {
    delete nextBlinding["Pad Footing"];
  }

  if (
    (projectType === "Foundation & Carcass Only" ||
      projectType === "Carcass with finishes") &&
    foundationType !== "Strip" &&
    foundationType !== "Raft"
  ) {
    delete nextBlinding["Strip Foundation"];
  }

  const nextSuperstructure = filterSuperstructure(
    scope.superstructure,
    hasLift,
    hasStairs,
  );

  const nextSubstructureElements = { ...scope.substructure.elements };

  if (!hasLift) {
    delete nextSubstructureElements["Lift Wall"];
  }

  if (!hasPool) {
    delete nextSubstructureElements["Swimming Pool"];
  }

  if (foundationType === "Pile") {
    delete nextSubstructureElements["Ground Beam"];
  }

  if (
    (projectType === "Foundation & Carcass Only" ||
      projectType === "Carcass with finishes") &&
    foundationType !== "Raft" &&
    foundationType !== "Strip"
  ) {
    delete nextSubstructureElements["Column Footing (Upper Strip)"];
  }

  const nextBlockworkInStripFoundation =
    (projectType === "Foundation & Carcass Only" ||
      projectType === "Carcass with finishes") &&
      (foundationType === "Raft" || foundationType === "Strip")
      ? scope.substructure.blockworkInStripFoundation
      : { blockworkForFormwork: "", blockworkFilling: "" };

  return {
    ...scope,
    blinding: nextBlinding,
    substructure: {
      ...scope.substructure,
      elements: nextSubstructureElements,
      blockworkInStripFoundation: nextBlockworkInStripFoundation,
    },
    superstructure: nextSuperstructure,
  };
}

export function normalizeFinishingState(
  finishing: Step4Data,
  scopeConfig: Step3Data["scopeConfig"],
): Step4Data {
  const hasPool = scopeConfig.hasPool;
  const hasLift = scopeConfig.lift === "Yes";
  const hasStairs = Number(scopeConfig.noOfFloors) > 0;

  return {
    ...finishing,
    specifications: {
      ...finishing.specifications,
      riserHeightForStairs: hasStairs
        ? finishing.specifications.riserHeightForStairs
        : "",
    },
    floorTiles: {
      ...finishing.floorTiles,
      stairsArea: hasStairs ? finishing.floorTiles.stairsArea : [],
      swimmingPool: hasPool ? finishing.floorTiles.swimmingPool : [],
      liftWalls: hasLift ? finishing.floorTiles.liftWalls : [],
    },
  };
}
