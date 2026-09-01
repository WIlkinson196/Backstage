"use client";
import { Printer } from "lucide-react";
export function PrintOutputButton({label="Print / Save PDF"}:{label?:string}){
  return <button onClick={()=>window.print()} className="print-hide inline-flex items-center gap-2 rounded-full bg-[#171A1F] px-4 py-2.5 text-sm font-semibold text-white">
    <Printer size={15}/>{label}
  </button>;
}
