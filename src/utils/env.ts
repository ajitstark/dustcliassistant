import dotenv from "dotenv";

export function loadEnv() {
  dotenv.config();
}

export function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function envBool(name: string, fallback = "false"): boolean {
  const v = (process.env[name] ?? fallback).toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

