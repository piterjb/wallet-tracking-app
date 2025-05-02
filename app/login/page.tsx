'use client';

import { useState, useEffect } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';


const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.19 14.41 4.53 14.42 3.89 14.28C4.16 15.14 4.7 15.9 5.43 16.44C6.15 16.98 7.03 17.27 7.95 17.27C6.29 18.6 4.27 19.33 2.21 19.32C1.87 19.32 1.54 19.3 1.2 19.25C3.27 20.66 5.67 21.4 8.12 21.4C16 21.4 20.33 14.73 20.33 8.98C20.33 8.79 20.33 8.6 20.32 8.41C21.16 7.82 21.88 7.07 22.46 6.2" fill="white"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4C14.89 4.21 14.76 4.48 14.67 4.7C13.07 4.47 11.46 4.47 9.88 4.7C9.79 4.48 9.66 4.21 9.54 4C8.04 4.26 6.6 4.71 5.27 5.33C3.05 8.58 2.43 11.76 2.74 14.89C4.58 16.24 6.37 17.07 8.14 17.63C8.54 17.09 8.89 16.53 9.19 15.93C8.57 15.71 7.99 15.42 7.44 15.09C7.54 15.02 7.64 14.94 7.73 14.86C10.27 16.01 13.06 16.01 15.59 14.86C15.69 14.94 15.79 15.02 15.88 15.09C15.32 15.43 14.74 15.71 14.12 15.93C14.42 16.53 14.77 17.09 15.17 17.63C16.95 17.07 18.74 16.24 20.58 14.89C20.94 11.26 19.96 8.11 17.75 5.33M8.67 12.9C7.91 12.9 7.28 12.18 7.28 11.31C7.28 10.44 7.89 9.72 8.67 9.72C9.45 9.72 10.08 10.44 10.06 11.31C10.06 12.18 9.44 12.9 8.67 12.9M15.33 12.9C14.57 12.9 13.94 12.18 13.94 11.31C13.94 10.44 14.55 9.72 15.33 9.72C16.11 9.72 16.74 10.44 16.72 11.31C16.72 12.18 16.11 12.9 15.33 12.9Z" fill="white"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" fill="white"/>
  </svg>
);


function SocialLinks() {
  return (
    <div className="flex items-center justify-center space-x-4 mt-6">
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
        <TwitterIcon />
      </a>
      <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
        <DiscordIcon />
      </a>
      <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
        <TelegramIcon />
      </a>
    </div>
  );
}

function WalletConnect() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Handle changes to wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
    } else {
      setWalletAddress(null);
    }
  }, [connected, publicKey]);

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col items-center justify-center mb-8">
        <div>
            <div className="flex items-center">
                <div className="mr-2">
                    <Image 
                    src="/images/binoculars.svg" 
                    alt="Whale Watcher Logo" 
                    width={24} 
                    height={24} 
                    />
                </div>
                <h1 className="pixel-font text-xl font-bold">WHALE WATCHER</h1>
            </div>
        </div>
        <p className="text-gray-200 text-lg uppercase text-center mb-8">
          FIND AND TRACK WALLET BEHAVIOUR<br />
          OF THE MARKET MOVERS ON SOLANA
        </p>
      </div>

      {!connected ? (
        <div className="flex justify-center">
          <button 
            className="border-2 border-orange-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-md flex items-center space-x-2 uppercase transition-colors cursor-pointer"
            onClick={() => {
              const walletButton = document.querySelector('.wallet-adapter-button');
              if (walletButton instanceof HTMLElement) {
                walletButton.click();
              }
            }}
          >
            <span className='text-white'>ENTER</span>
                <img src="/images/Arrow - Right 3.png" alt="" className='bg-orange-600 rounded-sm'/>
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <p className="text-gray-400 text-sm mb-1">Connected Wallet</p>
            <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
            <div className="mt-4">
              <Link 
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center uppercase transition-colors"
              >
                Enter Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden wallet connect button that will be triggered by our custom button */}
      <div className="hidden">
        <WalletMultiButton />
      </div>
    </div>
  );
}

interface WalletConfiguratorProps {
  children: React.ReactNode;
}

const WalletConfigurator: React.FC<WalletConfiguratorProps> = ({ children }) => {
  // Set up Solana network and wallet options
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider 
      endpoint={process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com"}
    >
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default function LogInPage() {
  return (
    <WalletConfigurator>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar activePage="login" />
        
        <main className="flex-1 px-6 py-16 flex flex-col items-center justify-center">
          <WalletConnect />
        </main>
        
        <footer className="py-6">
          <SocialLinks />
        </footer>
      </div>
    </WalletConfigurator>
  );
}