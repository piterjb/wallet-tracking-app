'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FilterSection from '../components/FilterSection';
import TransactionCard from '../components/TransactionCard';
import SocialFooter from '../components/SocialFooter';

interface Transaction {
  id: number;
  wallet: string;
  walletSize: string;
  amount: string;
  dollarValue: string;
  token: string;
  isBuy: boolean;
  transactionId: string;
  isAlerted: boolean;
}

export default function DashboardPage() {
  const [selectedWalletSize, setSelectedWalletSize] = useState('$10k+');
  const [selectedPositionSize, setSelectedPositionSize] = useState('5 SOL');
  const [customWalletSize, setCustomWalletSize] = useState('');
  const [customPositionSize, setCustomPositionSize] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [alertedWallets, setAlertedWallets] = useState<Set<string>>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alertedWallets');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [isMobile, setIsMobile] = useState(false);
  const [recentOnly, setRecentOnly] = useState(true);
  
  const walletSizes = [
    { value: '$10k+', label: '$10k+' },
    { value: '$20k+', label: '$20k+' },
    { value: '$30k+', label: '$30k+' },
    { value: '$50k+', label: '$50k+' },
  ];
  
  const positionSizes = [
    { value: '5 SOL', label: '5 SOL' },
    { value: '10 SOL', label: '10 SOL' },
    { value: '20 SOL', label: '20 SOL' },
    { value: '50 SOL', label: '50 SOL' },
    { value: '100 SOL', label: '100 SOL' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alertedWallets', JSON.stringify([...alertedWallets]));
    }
  }, [alertedWallets]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const getWalletSizeValue = (walletSize: string): string => {
    if (walletSize === 'custom' && customWalletSize) return customWalletSize;
    
    switch (walletSize) {
      case '$10k+': return '10000';
      case '$20k+': return '20000';
      case '$30k+': return '30000';
      case '$50k+': return '50000';
      default: return '0';
    }
  };

  const getPositionSizeValue = (positionSize: string): string => {
    if (positionSize === 'custom' && customPositionSize) return customPositionSize;
    
    return positionSize.replace(/[^0-9.]/g, '');
  };

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const minWalletSize = getWalletSizeValue(selectedWalletSize);
      const minPositionSize = getPositionSizeValue(selectedPositionSize);
      
      const url = new URL('/api/transactions', window.location.origin);
      
      // Always pass page and limit, regardless of mode
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '10');
      
      if (recentOnly) {
        url.searchParams.append('recentOnly', 'true');
      } else {
        url.searchParams.append('minWalletSize', minWalletSize);
        url.searchParams.append('minPositionSize', minPositionSize);
        
        if (searchQuery) {
          url.searchParams.append('search', searchQuery);
        }
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (response.ok) {
        // Map transactions and set alerted status
        const mappedTransactions = data.transactions.map((tx: Transaction) => ({
          ...tx,
          isAlerted: alertedWallets.has(tx.wallet)
        }));
        
        setTransactions(mappedTransactions);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch transactions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedWalletSize, selectedPositionSize, customWalletSize, customPositionSize, searchQuery, alertedWallets, recentOnly]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, currentPage]); // Re-fetch when page changes

  const handleApplyFilters = () => {
    setRecentOnly(false);
    setCurrentPage(1); // Reset to first page
    fetchTransactions();
  };

  const handleToggleRecentOnly = () => {
    setRecentOnly(prev => !prev);
    setCurrentPage(1); // Reset to first page when toggling modes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // No need to call fetchTransactions here, it will be triggered by the useEffect
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecentOnly(false); // Switch to filter mode when searching
    setCurrentPage(1); // Reset to first page when searching
    fetchTransactions();
  };
  
  const handleAddAlert = (wallet: string) => {
    setAlertedWallets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wallet)) {
        newSet.delete(wallet);
      } else {
        newSet.add(wallet);
      }
      return newSet;
    });
    
    setTransactions(prev => 
      prev.map(tx => 
        tx.wallet === wallet 
          ? { ...tx, isAlerted: !tx.isAlerted } 
          : tx
      )
    );
  };
  
  const handleTrack = (wallet: string) => {
    console.log('Tracking wallet:', wallet);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-750 to-gray-800">
      <Navbar activePage="dashboard" />
      
      <main className="flex-1 p-3 md:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-4 md:mb-6">
            <div className="w-full max-w-4xl">
              <form onSubmit={handleSearchSubmit} className="relative mb-4 md:mb-6">
                <input 
                  type="text" 
                  placeholder="Search Transactions or Wallet"
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 md:py-3 pl-3 md:pl-4 pr-10 text-white text-sm md:text-base"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Filter section - collapses in mobile view */}
            <div className={`${isMobile ? 'order-1' : ''} md:col-span-1`}>
              {isMobile ? (
                <details className="mb-4 bg-gray-900 border border-gray-700 rounded-lg">
                  <summary className="p-4 pixel-font text-lg cursor-pointer focus:outline-none">
                    FILTERS
                  </summary>
                  <div className="p-4 pt-0">
                    <FilterSection
                      walletSizes={walletSizes}
                      positionSizes={positionSizes}
                      selectedWalletSize={selectedWalletSize}
                      selectedPositionSize={selectedPositionSize}
                      onWalletSizeChange={setSelectedWalletSize}
                      onPositionSizeChange={setSelectedPositionSize}
                      onCustomWalletSizeChange={setCustomWalletSize}
                      onCustomPositionSizeChange={setCustomPositionSize}
                      onApplyFilters={handleApplyFilters}
                    />
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button 
                        onClick={handleToggleRecentOnly}
                        className={`cursor-pointer w-full py-2 px-4 rounded-md transition-colors duration-200 text-sm ${recentOnly ? 'bg-blue-600 hover:bg-black': 'bg-gray-800 hover:bg-black'}`}
                      >
                        {recentOnly ? 'VIEWING RECENT TRANSACTIONS' : 'VIEW RECENT TRANSACTIONS'}
                      </button>
                    </div>
                  </div>
                </details>
              ) : (
                <div className="min-h-0 lg:min-h-130">
                  <FilterSection
                    walletSizes={walletSizes}
                    positionSizes={positionSizes}
                    selectedWalletSize={selectedWalletSize}
                    selectedPositionSize={selectedPositionSize}
                    onWalletSizeChange={setSelectedWalletSize}
                    onPositionSizeChange={setSelectedPositionSize}
                    onCustomWalletSizeChange={setCustomWalletSize}
                    onCustomPositionSizeChange={setCustomPositionSize}
                    onApplyFilters={handleApplyFilters}
                  />
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button 
                      onClick={handleToggleRecentOnly}
                      className={`cursor-pointer w-full py-2 px-4 rounded-md transition-colors duration-200 text-sm ${recentOnly ? 'bg-blue-600 hover:bg-black': 'bg-gray-700 hover:bg-black'}`}
                    >
                      {recentOnly ? 'VIEWING RECENT TRANSACTIONS' : 'VIEW RECENT TRANSACTIONS'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Transaction Feed */}
            <div className={`${isMobile ? 'order-0' : ''} md:col-span-1 lg:col-span-3`}>
              <div className="min-h-130 bg-gray-900 border border-gray-700 rounded-lg p-3 md:p-6 flex flex-col">
                <h2 className="pixel-font text-lg md:text-xl mb-4 md:mb-6">
                  {recentOnly ? 'RECENT TRANSACTIONS' : 'FILTERED TRANSACTIONS'}
                </h2>
                
                {/* Content Area - Transaction Cards */}
                <div className="flex-grow">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <svg className="animate-spin h-6 w-6 md:h-8 md:w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      No transactions found. Try adjusting your filters.
                    </div>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {transactions.map((transaction) => (
                        <TransactionCard
                          key={transaction.id}
                          wallet={transaction.wallet}
                          walletSize={transaction.walletSize}
                          amount={transaction.amount}
                          dollarValue={transaction.dollarValue}
                          token={transaction.token}
                          isBuy={transaction.isBuy}
                          isAlerted={transaction.isAlerted}
                          onAddAlert={handleAddAlert}
                          onTrack={handleTrack}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Pagination - Always shown */}
                <div className="mt-auto pt-4 flex justify-center">
                  <div className="flex bg-gray-700 rounded-md text-xs md:text-sm">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="px-2 md:px-4 py-1 md:py-2 disabled:opacity-50 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <div className="px-2 md:px-4 py-1 md:py-2">
                      Page {currentPage} of {totalPages || 1}
                    </div>
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading || totalPages === 0}
                      className="px-2 md:px-4 py-1 md:py-2 disabled:opacity-50 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SocialFooter />
    </div>
  );
}