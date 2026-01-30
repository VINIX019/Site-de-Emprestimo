import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge"; 

interface ReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debtors: any[];
}

export function ReportModal({ open, onOpenChange, debtors }: ReportModalProps) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // --- LINHA 21: LÓGICA DE FILTRO ÚNICA ---
    const filteredDebtors = debtors.flatMap(debtor => {
        const installments = [];
        const firstDate = new Date(debtor.dueDate);

        for (let i = 0; i < debtor.installments; i++) {
            const currentDate = new Date(firstDate);
            currentDate.setMonth(firstDate.getMonth() + i);

            if (currentDate.getMonth().toString() === selectedMonth) {
                installments.push({
                    ...debtor,
                    currentInstallment: i + 1,
                    projectedDueDate: currentDate.toISOString(),
                    isPaidInMonth: i < debtor.paidInstallments
                });
            }
        }
        return installments;
    });

    const monthTotal = filteredDebtors.reduce((sum, d) => sum + d.monthlyPayment, 0);
    const monthPaid = filteredDebtors
        .filter(d => d.isPaidInMonth)
        .reduce((sum, d) => sum + d.monthlyPayment, 0);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-2xl font-bold">Extrato Mensal</DialogTitle>

                    <div className="w-[180px] mr-8">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div>
                        <p className="text-xs text-indigo-600 uppercase font-bold">Total a Receber no Mês</p>
                        <p className="text-xl font-bold text-indigo-900">{formatCurrency(monthTotal)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-green-600 uppercase font-bold">Já Recebido (Pago)</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(monthPaid)}</p>
                    </div>
                </div>

                <h3 className="font-semibold mb-2 text-gray-700">Vencimentos de {months[parseInt(selectedMonth)]}</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Devedor</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead className="text-right">Parcela</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDebtors.length > 0 ? (
                            filteredDebtors.map((d, index) => (
                                <TableRow key={`${d.id}-${index}`}>
                                    <TableCell className="font-medium">
                                        {d.name} <span className="text-xs text-gray-400">({d.currentInstallment}/{d.installments})</span>
                                    </TableCell>
                                    <TableCell>{new Date(d.projectedDueDate).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={d.isPaidInMonth ? "text-green-600" : "text-orange-600 font-bold"}>
                                                {formatCurrency(d.monthlyPayment)}
                                            </span>
                                            {d.isPaidInMonth && (
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                                    Pago
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                                    Nenhum vencimento para este mês.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
}