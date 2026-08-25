"use client";
import { X } from "lucide-react";
export function Dialog({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={event=>event.stopPropagation()}><header className="modal-head"><h2>{title}</h2><button aria-label="Tutup" onClick={onClose}><X/></button></header>{children}</section></div>}
export function EmptyState({children}:{children:React.ReactNode}){return <div className="empty"><span>○</span><p>{children}</p></div>}
