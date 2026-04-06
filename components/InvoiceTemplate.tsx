'use client';

import React from 'react';
import { Client } from '@/lib/types';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceTemplateProps {
  type: 'Devis' | 'Facture';
  clientInfo: {
    company: string;
    contact: string;
    address: string;
    niu: string;
    email: string;
  };
  items: InvoiceItem[];
  applyTVA: boolean;
  notes: string;
  invoiceNumber: string;
  date: string;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ type, clientInfo, items, applyTVA, notes, invoiceNumber, date }, ref) => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const tva = applyTVA ? subtotal * 0.1925 : 0;
    const total = subtotal + tva;

    return (
      <div
        ref={ref}
        className="bg-white p-12 text-slate-900 font-sans"
        style={{ width: '210mm', minHeight: '297mm', position: 'absolute', left: '-9999px', top: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-lime mb-2">DOULY CFO</h1>
            <p className="text-sm text-slate-500">Expertise Financière & Stratégique</p>
            <p className="text-xs text-slate-400 mt-1">Douala, Cameroun</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-slate-800">{type}</h2>
            <p className="text-slate-500 mt-1">N° {invoiceNumber}</p>
            <p className="text-slate-500">Date: {date}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Émetteur</h3>
            <p className="font-bold text-slate-800">DOULY CFO SARL</p>
            <p className="text-sm text-slate-600 mt-1">Quartier Akwa, Rue Pau</p>
            <p className="text-sm text-slate-600">Douala, Cameroun</p>
            <p className="text-sm text-slate-600 mt-2">NIU: M012345678901Z</p>
            <p className="text-sm text-slate-600">Email: contact@doulycfo.com</p>
          </div>
          <div className="bg-lime/5 p-6 rounded-lg border border-lime/10">
            <h3 className="text-xs font-bold uppercase text-lime mb-3 tracking-widest">Destinataire</h3>
            <p className="font-bold text-slate-800">{clientInfo.company || 'Client'}</p>
            <p className="text-sm text-slate-600 mt-1">{clientInfo.contact}</p>
            <p className="text-sm text-slate-600">{clientInfo.address}</p>
            {clientInfo.niu && <p className="text-sm text-slate-600 mt-2">NIU/RCCM: {clientInfo.niu}</p>}
            <p className="text-sm text-slate-600">{clientInfo.email}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="text-left py-4 px-2 text-xs font-bold uppercase text-slate-400 tracking-widest">Description</th>
              <th className="text-center py-4 px-2 text-xs font-bold uppercase text-slate-400 tracking-widest w-24">Qté</th>
              <th className="text-right py-4 px-2 text-xs font-bold uppercase text-slate-400 tracking-widest w-32">P.U HT</th>
              <th className="text-right py-4 px-2 text-xs font-bold uppercase text-slate-400 tracking-widest w-32">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-slate-50">
                <td className="py-4 px-2 text-sm text-slate-700">{item.description}</td>
                <td className="py-4 px-2 text-sm text-slate-700 text-center">{item.quantity}</td>
                <td className="py-4 px-2 text-sm text-slate-700 text-right">{item.unitPrice.toLocaleString()} FCFA</td>
                <td className="py-4 px-2 text-sm font-medium text-slate-900 text-right">{(item.quantity * item.unitPrice).toLocaleString()} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sous-total HT</span>
              <span className="font-medium text-slate-900">{subtotal.toLocaleString()} FCFA</span>
            </div>
            {applyTVA && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">TVA (19.25%)</span>
                <span className="font-medium text-slate-900">{tva.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-800">TOTAL TTC</span>
              <span className="text-lg font-bold text-lime">{total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-12">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Conditions & Notes</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-12 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            Douly CFO SARL - Capital 1,000,000 FCFA - RCCM: DLA/2024/B/1234 - NIU: M012345678901Z
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Merci de votre confiance.
          </p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
