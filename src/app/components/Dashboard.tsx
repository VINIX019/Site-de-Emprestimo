import { useState } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AddDebtorModal, Debtor } from './AddDebtorModal';
import { Plus, LogOut, Trash2, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtors, setDebtors] = useState<Debtor[]>([

  ]);

  const handleAddDebtor = (newDebtor: Omit<Debtor, 'id'>) => {
    const debtor: Debtor = {
      ...newDebtor,
      id: Date.now().toString()
    };
    setDebtors([...debtors, debtor]);
  };

  const handleDeleteDebtor = (id: string) => {
    setDebtors(debtors.filter(d => d.id !== id));
  };

  const handlePayMonth = (id: string) => {
    setDebtors(debtors.map(debtor => {
      if (debtor.id === id && debtor.paidInstallments < debtor.installments) {
        const newPaidInstallments = debtor.paidInstallments + 1;
        const newStatus = newPaidInstallments === debtor.installments ? 'pago' : 'pendente';
        return {
          ...debtor,
          paidInstallments: newPaidInstallments,
          status: newStatus
        };
      }
      return debtor;
    }));
  };

  const handlePayTotal = (id: string) => {
    setDebtors(debtors.map(debtor => {
      if (debtor.id === id) {
        return {
          ...debtor,
          paidInstallments: debtor.installments,
          status: 'pago' as const
        };
      }
      return debtor;
    }));
  };

  const getStatusBadge = (status: Debtor['status']) => {
    const variants = {
      pendente: 'default',
      pago: 'default',
      atrasado: 'destructive'
    } as const;

    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado'
    };

    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      pago: 'bg-green-100 text-green-800 hover:bg-green-100',
      atrasado: 'bg-red-100 text-red-800 hover:bg-red-100'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const totalAmount = debtors.reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = debtors
    .filter(d => d.status !== 'pago')
    .reduce((sum, d) => {
      const parcelasRestantes = d.installments - d.paidInstallments;
      const saldoDevedorDesteCliente = d.monthlyPayment * parcelasRestantes;
      return sum + saldoDevedorDesteCliente;
    }, 0);
  const overdueCount = debtors.filter(d => d.status === 'atrasado').length;
  const monthlyReceivable = debtors.filter(d => d.status !== 'pago').reduce((sum, d) => sum + d.monthlyPayment, 0);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl text-gray-900">Sistema de Empréstimos</h1>
              <p className="text-sm text-gray-500">Gerenciamento de devedores</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Emprestado</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {debtors.length} {debtors.length === 1 ? 'devedor' : 'devedores'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">A Receber/Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{formatCurrency(monthlyReceivable)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Receita mensal estimada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Valor Pendente</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{overdueCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {overdueCount === 1 ? 'Pagamento atrasado' : 'Pagamentos atrasados'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Devedores</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Gerencie todos os empréstimos cadastrados</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Devedor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {debtors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum devedor cadastrado</p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Adicionar primeiro devedor
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Parcelas Pagas</TableHead>
                      <TableHead>Juros</TableHead>
                      <TableHead>Valor/Mês</TableHead>
                      <TableHead>Saldo Devedor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtors.map((debtor) => (
                      <TableRow key={debtor.id}>
                        <TableCell>{debtor.name}</TableCell>
                        <TableCell>{debtor.cpf}</TableCell>
                        <TableCell>{formatCurrency(debtor.amount)}</TableCell>
                        <TableCell>
                          <span className={debtor.paidInstallments === debtor.installments ? 'text-green-600' : ''}>
                            {debtor.paidInstallments}/{debtor.installments}
                          </span>
                        </TableCell>
                        <TableCell>{debtor.interestRate}%</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(debtor.monthlyPayment)}</TableCell>
                        <TableCell className="font-bold text-orange-600">
                          {formatCurrency(debtor.monthlyPayment * (debtor.installments - debtor.paidInstallments))}
                        </TableCell>
                        <TableCell>{formatDate(debtor.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(debtor.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {debtor.status !== 'pago' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePayMonth(debtor.id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  disabled={debtor.paidInstallments >= debtor.installments}
                                >
                                  Pagar Mês
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePayTotal(debtor.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  Pagar Total
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDebtor(debtor.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddDebtorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddDebtor={handleAddDebtor}
      />
    </div>
  );
}
