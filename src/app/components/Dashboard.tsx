import { useState } from 'react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AddDebtorModal, Debtor } from './AddDebtorModal';
import { Plus, LogOut, Trash2, DollarSign, Users, AlertCircle, Pencil } from 'lucide-react'; import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ReportModal } from './ReportModal';
import { toast } from 'react-toastify';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);

  // --- FUNÇÕES DE AÇÃO ---
  const handleSaveDebtor = (debtorData: Omit<Debtor, 'id'>) => {
    if (editingDebtor) {
      setDebtors(debtors.map(d => d.id === editingDebtor.id ? { ...debtorData, id: d.id } : d));
      toast.success("Cadastro atualizado com sucesso!"); 
    } else {
      const newDebtor: Debtor = { ...debtorData, id: Date.now().toString() };
      setDebtors([...debtors, newDebtor]);
      toast.success("Novo devedor adicionado!"); 
    }
    setEditingDebtor(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (debtor: Debtor) => {
    setEditingDebtor(debtor); 
    setIsModalOpen(true);     
  };

const handleDeleteDebtor = (id: string) => {
  setDebtors(debtors.filter(debtor => debtor.id !== id));
  toast.error("Devedor removido do sistema.");
};

  const handlePayMonth = (id: string) => {
    setDebtors(debtors.map(debtor => {
      if (debtor.id === id && debtor.paidInstallments < debtor.installments) {
        const newPaidInstallments = debtor.paidInstallments + 1;
        const newStatus = newPaidInstallments === debtor.installments ? 'pago' : 'pendente';
        toast.info("Parcela do mês confirmada!");
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

  const handleGenerateReport = () => {
    const reportData = debtors.map(d => ({
      nome: d.name,
      total: d.amount,
      pago: d.paidInstallments,
      restante: (d.installments - d.paidInstallments) * d.monthlyPayment
    }));
    console.table(reportData);
    alert("Relatório gerado no console! (F12 para ver)");
  };

  // --- AUXILIARES DE FORMATAÇÃO ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Debtor['status']) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      pago: 'bg-green-100 text-green-800 hover:bg-green-100',
      atrasado: 'bg-red-100 text-red-800 hover:bg-red-100'
    };
    const labels = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado' };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  // --- CÁLCULOS DE RESUMO ---
  const totalAmount = debtors.reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = debtors
    .filter(d => d.status !== 'pago')
    .reduce((sum, d) => {
      const parcelasRestantes = d.installments - d.paidInstallments;
      return sum + (d.monthlyPayment * parcelasRestantes);
    }, 0);
  const overdueCount = debtors.filter(d => d.status === 'atrasado').length;
  const monthlyReceivable = debtors.filter(d => d.status !== 'pago').reduce((sum, d) => sum + d.monthlyPayment, 0);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Empréstimos</h1>
            <p className="text-sm text-gray-500">Gerenciamento de devedores</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Emprestado</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">{debtors.length} devedores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">A Receber/Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyReceivable)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Devedor Total</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Devedores</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Gerencie os empréstimos</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsReportOpen(true)} variant="outline">
                  Extrato
                </Button>
                <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {debtors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum devedor cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Parcelas</TableHead>
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
                        <TableCell className="font-medium">{debtor.name}</TableCell>
                        <TableCell>{debtor.cpf}</TableCell>
                        <TableCell>{formatCurrency(debtor.amount)}</TableCell>
                        <TableCell>{debtor.paidInstallments}/{debtor.installments}</TableCell>
                        <TableCell>{debtor.interestRate}%</TableCell>
                        <TableCell className="text-green-600 font-medium">{formatCurrency(debtor.monthlyPayment)}</TableCell>
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
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(debtor)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handlePayMonth(debtor.id)}>Mês</Button>
                                <Button variant="outline" size="sm" onClick={() => handlePayTotal(debtor.id)}>Total</Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDebtor(debtor.id)} className="text-red-500">
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
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingDebtor(null);
        }}
        onAddDebtor={handleSaveDebtor}
        initialData={editingDebtor}
      />
      <ReportModal
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        debtors={debtors}
      />
    </div>
  );
}