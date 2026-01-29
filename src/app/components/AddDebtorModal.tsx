import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface Debtor {
  id: string;
  name: string;
  cpf: string;
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
}

export function AddDebtorModal({ open, onOpenChange, onAddDebtor }: AddDebtorModalProps) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');

const calculateMonthlyPayment = (principal: number, rate: number, periods: number): number => {
  if (rate === 0) {
    return principal / periods;
  }
  const monthlyRate = rate / 100;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1);
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (name && cpf && amount && installments && interestRate && dueDate) {
    const principal = parseFloat(amount);
    const periods = parseInt(installments);
    const rate = parseFloat(interestRate);
    const monthlyPayment = calculateMonthlyPayment(principal, rate, periods);

    onAddDebtor({
      name,
      cpf,
      amount: principal,
      installments: periods,
      paidInstallments: 0,
      interestRate: rate,
      monthlyPayment,
      dueDate,
      status: 'pendente'
    });

    // Limpar formulário
    setName('');
    setCpf('');
    setAmount('');
    setInstallments('');
    setInterestRate('');
    setDueDate('');
    onOpenChange(false);
  }
};

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};
const isCPFValid = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

  const digits = cleanCPF.split('').map(Number);

  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += digits[i - 1] * (11 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[9]) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += digits[i - 1] * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[10]) return false;

  return true;
};

const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formatted = formatCPF(e.target.value);
  setCpf(formatted);
};

return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Adicionar Novo Devedor</DialogTitle>
        <DialogDescription>
          Preencha as informações do devedor para adicionar ao sistema
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              className={cpf.length === 14 && !isCPFValid(cpf) ? "border-red-500" : ""}
            />
            {cpf.length === 14 && !isCPFValid(cpf) && (
              <span className="text-red-500 text-xs">Este CPF não é válido!</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Empréstimo (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installments">Nº de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                placeholder="12"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Juros (% ao mês)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data do Primeiro Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            Adicionar Devedor
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
}
