import { useReadContract } from 'wagmi';
import { shaktiVaultAbi } from '@/abi/shaktiVault';
import { useMemo } from 'react';

type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'repaid';

interface LoanInfo {
  id: bigint;
  borrower: `0x${string}`;
  amount: bigint;
  repaid: bigint;
  approvals: bigint;
  disbursed: boolean;
  exists: boolean;
  status: LoanStatus;
}

export const useVaultLoans = (vaultAddress: `0x${string}`, memberCount?: bigint) => {
  // Create individual hooks for each loan ID (React requires hooks to be called at the top level)
  const loan0 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(0)],
  });
  
  const loan1 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(1)],
  });
  
  const loan2 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(2)],
  });
  
  const loan3 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(3)],
  });
  
  const loan4 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(4)],
  });
  
  const loan5 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(5)],
  });
  
  const loan6 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(6)],
  });
  
  const loan7 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(7)],
  });
  
  const loan8 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(8)],
  });
  
  const loan9 = useReadContract({
    address: vaultAddress,
    abi: shaktiVaultAbi,
    functionName: 'getLoanDetails',
    args: [BigInt(9)],
  });

  // Collect all loan queries
  const loanQueries = useMemo(() => [loan0, loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8, loan9], [
    loan0, loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8, loan9
  ]);

  // Calculate approval threshold (60% of members)
  const approvalThreshold = memberCount ? Math.ceil(Number(memberCount) * 0.6) : 2;

  // Process loan data
  const loans: LoanInfo[] = useMemo(() => {
    return loanQueries
      .map((query, index) => {
        if (!query.data?.exists) return null;
        
        const loan = query.data;
        let status: LoanStatus = 'pending';
        
        if (loan.repaid >= loan.amount) {
          status = 'repaid';
        } else if (loan.disbursed) {
          status = 'disbursed';
        } else if (Number(loan.approvals) >= approvalThreshold) {
          status = 'approved';
        }
        
        return {
          id: BigInt(index),
          borrower: loan.borrower,
          amount: loan.amount,
          repaid: loan.repaid,
          approvals: loan.approvals,
          disbursed: loan.disbursed,
          exists: loan.exists,
          status,
        };
      })
      .filter((loan): loan is LoanInfo => loan !== null);
  }, [loanQueries, approvalThreshold]);

  // Calculate loan statistics
  const loanStats = useMemo(() => {
    const stats = {
      pending: 0,
      approved: 0,
      disbursed: 0,
      repaid: 0,
      total: loans.length,
    };

    loans.forEach(loan => {
      stats[loan.status]++;
    });

    return stats;
  }, [loans]);

  const isPending = loanQueries.some(q => q.isLoading);
  const error = loanQueries.find(q => q.error)?.error;

  return {
    loans,
    loanStats,
    isPending,
    error,
  };
};
