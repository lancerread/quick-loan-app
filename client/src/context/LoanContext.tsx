import { createContext, useContext, useState, type ReactNode } from 'react';

interface FormData {
  name: string;
  phone: string;
  idNumber: string;
  loanType: string;
}

interface LoanOption {
  amount: number;
  fee: number;
  totalRepayment: number;
}

type ModalState = 'none' | 'confirm' | 'failed';

interface LoanContextType {
  formData: FormData;
  setFormData: (data: FormData) => void;
  selectedLoan: LoanOption | null;
  setSelectedLoan: (loan: LoanOption | null) => void;
  modalState: ModalState;
  setModalState: (state: ModalState) => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    idNumber: '',
    loanType: '',
  });
  const [selectedLoan, setSelectedLoan] = useState<LoanOption | null>(null);
  const [modalState, setModalState] = useState<ModalState>('none');

  return (
    <LoanContext.Provider
      value={{
        formData,
        setFormData,
        selectedLoan,
        setSelectedLoan,
        modalState,
        setModalState,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
