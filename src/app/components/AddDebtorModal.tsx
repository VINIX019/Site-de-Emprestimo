import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';


export interface Debtor {
  id: string;
  name: string;
  telefone: string;
  amount: number;
  installments: number;
  paidInstallments: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: string;
  status: 'pendente' | 'pago' | 'atrasado';
}

interface AddDebtorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDebtor: (debtor: Omit<Debtor, 'id'>) => void;
  initialData?: Debtor | null;
}

export function AddDebtorModal({ open, onOpenChange, onAddDebtor, initialData }: AddDebtorModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData && open) {
      setName(initialData.name);
      setPhone(initialData.telefone);
      setAmount(initialData.amount.toString());
      setInstallments(initialData.installments.toString());
      setInterestRate(initialData.interestRate.toString());
      setDueDate(initialData.dueDate);
    } else if (!initialData && open) {
      setName('');
      setPhone('');
      setAmount('');
      setInstallments('');
      setInterestRate('');
      setDueDate('');
    }
  }, [initialData, open]);

  const calculateMonthlyPayment = (principal: number, rate: number, periods: number): number => {
    if (rate === 0) return principal / periods;
    const monthlyRate = rate / 100;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const isPhoneValid = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11 && !/^(\d)\1+$/.test(cleanPhone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name && phone && amount && installments && interestRate && dueDate) {
      const principal = parseFloat(amount);
      const periods = parseInt(installments);
      const rate = parseFloat(interestRate);
      const monthlyPayment = calculateMonthlyPayment(principal, rate, periods);

      onAddDebtor({
        name,
        telefone: phone,
        amount: principal,
        installments: periods,
        paidInstallments: initialData ? initialData.paidInstallments : 0,
        interestRate: rate,
        monthlyPayment,
        dueDate,
        status: initialData ? initialData.status : 'pendente'
      });

      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Devedor' : 'Adicionar Novo Devedor'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Altere as informações abaixo' : 'Preencha as informações do devedor para adicionar ao sistema'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder='Ex: João da Silva' required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                required
              />
              {phone.length > 2 && !isPhoneValid(phone) && (
                <span className="text-red-500 text-xs">Informe um telefone válido (DDD + Número)</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Empréstimo (R$)</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} 
              placeholder='Ex: R$1000.00' required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Nº de Parcelas</Label>
                <Input id="installments" type="number" min="1" value={installments} onChange={(e) => setInstallments(e.target.value)} 
                placeholder='Ex: 12' required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Juros (% ao mês)</Label>
                <Input id="interestRate" type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} 
                placeholder='Ex: 2.5%' required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data do Primeiro Vencimento</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {initialData ? 'Salvar Alterações' : 'Adicionar Devedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}