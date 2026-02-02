import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Debtor } from './AddDebtorModal';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { isAfter, parseISO, startOfDay } from 'date-fns';

interface OverdueModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debtors: Debtor[];
}

export function OverdueModal({ open, onOpenChange, debtors }: OverdueModalProps) {
    const getComputedStatus = (debtor: Debtor) => {
        if (debtor.status === 'pago') return 'pago';
        const today = startOfDay(new Date());
        const dueDate = startOfDay(parseISO(debtor.dueDate));
        return isAfter(today, dueDate) ? 'atrasado' : 'pendente';
    };

    const overdueDebtors = debtors.filter(d => getComputedStatus(d) === 'atrasado');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        Devedores em Atraso
                    </DialogTitle>
                </DialogHeader>

                {overdueDebtors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nenhum devedor atrasado no momento.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Valor Parcela</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueDebtors.map((debtor) => (
                                <TableRow key={debtor.id}>
                                    <TableCell className="font-medium">{debtor.name}</TableCell>
                                    <TableCell className="text-red-600">
                                        {(() => {
                                            const [year, month, day] = debtor.dueDate.split('-').map(Number);
                                            const localDate = new Date(year, month - 1, day);
                                            return localDate.toLocaleDateString('pt-BR');
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtor.monthlyPayment)}
                                    </TableCell>
                                    <TableCell className='font-medium'>{debtor.telefone}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600"
                                            onClick={() => {
                                                const cleanPhone = debtor.telefone.replace(/\D/g, '');
                                                window.open(`https://wa.me/55${cleanPhone}?text=Olá ${debtor.name}, notamos que sua parcela venceu em ${new Date(debtor.dueDate).toLocaleDateString('pt-BR')} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtor.monthlyPayment)}!`, '_blank');
                                            }}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            Cobrar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    );
}