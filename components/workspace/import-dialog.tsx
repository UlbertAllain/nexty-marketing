"use client";
import { useState } from "react";
import { FileUp } from "lucide-react";
import * as XLSX from "xlsx";
import { importLeads } from "@/lib/repository";
import { parseLeadWorkbook, type LeadImportPreview } from "@/lib/spreadsheet-import";
import type { Lead } from "@/lib/types";
import { Dialog } from "./dialog";
export function ImportDialog({ownerId,onClose,onSaved,notify}:{ownerId:string;onClose:()=>void;onSaved:()=>void;notify:(text:string)=>void}){
  const[rows,setRows]=useState<Partial<Lead>[]>([]),[fileName,setFileName]=useState(""),[preview,setPreview]=useState<LeadImportPreview|null>(null),[error,setError]=useState("");
  async function read(file:File){
    setFileName(file.name);setRows([]);setPreview(null);setError("");
    try{const workbook=XLSX.read(await file.arrayBuffer());const parsed=parseLeadWorkbook(workbook);setRows(parsed.rows);setPreview(parsed);if(!parsed.rows.length)setError("Tidak ada data yang bisa dimasukkan. Pastikan ada kolom Nama Usaha atau Nama Perusahaan.")}
    catch{setError("File belum bisa dibaca. Gunakan file Excel .xlsx atau .xls yang tidak rusak.")}
  }
  return <Dialog title="Ambil calon klien dari Excel" onClose={onClose}><div className="import-box"><label><FileUp/><b>Pilih file Excel</b><span>{fileName||"Format lama Target Pasar Nexty Labs juga bisa langsung dipakai"}</span><input type="file" accept=".xlsx,.xls" onChange={e=>e.target.files?.[0]&&read(e.target.files[0])}/></label>{error&&<div className="attention">{error}</div>}{rows.length>0&&<><p><b>{rows.length}</b> calon klien terbaca dari {preview?.sheetsRead||1} sheet. Data ganda akan dilewati.</p>{preview?.rowsWithoutCompany? <p>{preview.rowsWithoutCompany} baris cadangan/kosong dilewati.</p>:null}{preview?.sheetsWithoutHeader.length? <p>Sheet yang tidak dikenali: {preview.sheetsWithoutHeader.join(", ")}.</p>:null}<div className="preview-list">{rows.slice(0,5).map((row,index)=><div key={index}><b>{row.companyName}</b><span>{row.phone||"Nomor belum tersedia"}</span></div>)}</div></>}<div className="modal-actions"><button className="secondary" onClick={onClose}>Batal</button><button className="primary" disabled={!rows.length} onClick={async()=>{const result=await importLeads(ownerId,rows);notify(`${result.imported} calon klien masuk, ${result.duplicates} data ganda dilewati, ${result.invalid} data perlu diperiksa.`);onSaved()}}>Masukkan {rows.length} data</button></div></div></Dialog>
}
