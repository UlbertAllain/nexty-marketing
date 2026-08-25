import test from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseLeadWorkbook } from "../lib/spreadsheet-import";

test("format asli Target Pasar Nexty Labs terbaca",()=>{
  const workbook=XLSX.utils.book_new();
  const sheet=XLSX.utils.aoa_to_sheet([
    ["Nama Usaha","Bidang Usaha","Kontak","Potensi","Instagram","Link Google Maps","Status Follow-Up"],
    ["Bali Sunny Laundry","Laundry",83149657770,"High","sunnylaundry.id","https://maps.example/1","Menunggu Balasan"],
    ["ADA Swalayan Solo","Toserba","082134758282/082143209798","High","pasar_swalayan_ada","-","Belum Dihubungi"],
  ]);
  XLSX.utils.book_append_sheet(workbook,sheet,"Sheet1");
  const parsed=parseLeadWorkbook(workbook);
  assert.equal(parsed.rows.length,2);
  assert.deepEqual(parsed.rows[0],{
    companyName:"Bali Sunny Laundry",category:"Laundry",contactName:"",phone:"083149657770",email:"",instagram:"sunnylaundry.id",website:"",googleMaps:"https://maps.example/1",potential:"HIGH",status:"WAITING_REPLY",notes:"",
  });
  assert.equal(parsed.rows[1].phone,"082134758282");
  assert.equal(parsed.rows[1].notes,"Nomor kontak lain: 082143209798");
  assert.equal(parsed.rows[1].status,"NEW");
});

test("judul di atas tabel dan beberapa sheet tetap dikenali",()=>{
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([["DAFTAR KONTAK"],[],["Nama Perusahaan","Kategori","WhatsApp"],["Kopi Senja","Cafe","081234567890"]]),"Solo");
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([["Nama Bisnis","Jenis Usaha","No WA"],["Studio A","Kreatif","628111111111"]]),"Sukoharjo");
  const parsed=parseLeadWorkbook(workbook);
  assert.equal(parsed.rows.length,2);
  assert.equal(parsed.sheetsRead,2);
  assert.equal(parsed.rows[0].companyName,"Kopi Senja");
  assert.equal(parsed.rows[1].category,"Kreatif");
});
