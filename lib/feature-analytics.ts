"use client";
import { track } from "@vercel/analytics";

export const featureNames = ["Pace Calculator", "Race Splits", "Training Planner", "VDOT Calculator", "Heart Rate Zones", "Running Academy", "Race Predictor", "Strava Connect"] as const;
export type FeatureName = typeof featureNames[number];

export function trackFeature(feature: FeatureName, action: "open" | "calculate" | "attempt" = "open") {
  try { track("pace_feature", { feature, action }); } catch { /* Analytics must not affect calculator functionality */ }
}
