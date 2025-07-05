'use client';

import { useState, useEffect } from 'react';
import { useCreateVault } from '@/hooks/useCreateVault';
import { useAccount } from 'wagmi';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useVaultMetadata, extractVaultAddressFromLogs } from '@/hooks/useVaultMetadataBackend';
import { useRouter } from 'next/navigation';
import { 
  Users, Shield, ChevronRight, ChevronLeft, Plus, Trash2, 
  Wallet, CheckCircle, AlertCircle, Info, Sparkles, 
  ArrowRight, Loader2, Copy, Check, UserPlus, Database
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  walletAddress: string;
}

interface ValidationState {
  [key: string]: string | undefined;
}

export const CreateVaultForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vaultName, setVaultName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: '', walletAddress: '' },
    { id: '2', name: '', walletAddress: '' },
    { id: '3', name: '', walletAddress: '' },
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationState>({});
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  
  const isMounted = useIsMounted();
  const { createVault, isPending, isConfirming, isConfirmed, error, hash, receipt, factoryAddress } = useCreateVault();
  const { address: connectedAddress, isConnected } = useAccount();
  const { addVaultMetadata, isCreating } = useVaultMetadata(connectedAddress);
  const router = useRouter();

  const totalSteps = 3;

  // Save vault metadata when creation is successful
  useEffect(() => {
    if (isConfirmed && hash && vaultName.trim() && connectedAddress) {
      const saveVaultMetadata = async () => {
        try {
          let vaultAddress: string;
          
          if (receipt && receipt.logs) {
            const extractedAddress = extractVaultAddressFromLogs(receipt.logs);
            vaultAddress = extractedAddress || `0x${hash.slice(2, 42)}`;
          } else {
            vaultAddress = `0x${hash.slice(2, 42)}`;
          }
          
          const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
          const vaultMembers = validMembers.map(member => ({
            address: member.walletAddress.trim(),
            name: member.name.trim(),
          }));

          await addVaultMetadata({
            address: vaultAddress,
            name: vaultName.trim(),
            members: vaultMembers,
            createdAt: new Date().toISOString(),
            txHash: hash,
          });

          setRedirectCountdown(3);
          const countdownInterval = setInterval(() => {
            setRedirectCountdown(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval);
                router.push(`/vault/${vaultAddress}`);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(countdownInterval);
        } catch (error) {
          console.error('Error saving vault metadata to backend:', error);
        }
      };

      saveVaultMetadata();
    }
  }, [isConfirmed, hash, receipt, vaultName, members, addVaultMetadata, router, connectedAddress]);

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-primary rounded-3xl p-8 border border-surface">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-xl w-1/3 mb-4"></div>
            <div className="h-4 bg-white/20 rounded-lg w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-white/20 rounded-xl"></div>
              <div className="h-12 bg-white/20 rounded-xl"></div>
              <div className="h-12 bg-white/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addMember = () => {
    const newId = (Math.max(...members.map(m => parseInt(m.id))) + 1).toString();
    setMembers([...members, { id: newId, name: '', walletAddress: '' }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 3) {
      setMembers(members.filter(member => member.id !== id));
      // Clean up validation errors for removed member
      const newErrors = { ...validationErrors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`member_${id}_`)) {
          delete newErrors[key];
        }
      });
      setValidationErrors(newErrors);
    }
  };

  const updateMember = (id: string, field: 'name' | 'walletAddress', value: string) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
    
    // Clear validation error when user starts typing
    const fieldKey = `member_${id}_${field}`;
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const markFieldAsTouched = (fieldKey: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldKey));
  };

  const validateStep = (step: number): boolean => {
    const errors: ValidationState = {};
    
    if (step === 1) {
      if (!vaultName.trim()) {
        errors.vaultName = 'Vault name is required';
      } else if (vaultName.trim().length < 3) {
        errors.vaultName = 'Vault name must be at least 3 characters';
      } else if (vaultName.trim().length > 50) {
        errors.vaultName = 'Vault name must be less than 50 characters';
      }
    }
    
    if (step === 2) {
      const validMembers = members.filter(member => member.name.trim() || member.walletAddress.trim());
      
      if (validMembers.length < 3) {
        errors.general = 'You need at least 3 members to create a vault';
      }

      const uniqueAddresses = new Set<string>();
      const uniqueNames = new Set<string>();

      validMembers.forEach((member, index) => {
        const memberKey = member.id;
        
        if (!member.name.trim()) {
          errors[`member_${memberKey}_name`] = 'Name is required';
        } else {
          const lowerName = member.name.trim().toLowerCase();
          if (uniqueNames.has(lowerName)) {
            errors[`member_${memberKey}_name`] = 'Name must be unique';
          } else {
            uniqueNames.add(lowerName);
          }
        }
        
        if (!member.walletAddress.trim()) {
          errors[`member_${memberKey}_walletAddress`] = 'Wallet address is required';
        } else {
          const trimmedAddr = member.walletAddress.trim().toLowerCase();
          
          if (!trimmedAddr.match(/^0x[a-fA-F0-9]{40}$/)) {
            errors[`member_${memberKey}_walletAddress`] = 'Invalid Ethereum address';
          } else {
            if (uniqueAddresses.has(trimmedAddr)) {
              errors[`member_${memberKey}_walletAddress`] = 'Address must be unique';
            } else {
              uniqueAddresses.add(trimmedAddr);
            }
          }
        }
      });

      if (connectedAddress && !validMembers.some(member => 
        member.walletAddress.trim().toLowerCase() === connectedAddress.toLowerCase()
      )) {
        errors.general = errors.general ? errors.general + '. Your wallet must be included in the member list' : 'Your wallet must be included in the member list';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    if (!isConnected) {
      setValidationErrors({ general: 'Please connect your wallet first' });
      setIsValidating(false);
      return;
    }

    if (!validateStep(1) || !validateStep(2)) {
      setIsValidating(false);
      return;
    }

    try {
      const validMembers = members.filter(member => member.name.trim() && member.walletAddress.trim());
      const memberAddresses = validMembers.map(member => member.walletAddress.trim() as `0x${string}`);
      
      createVault(memberAddresses);
    } catch (err) {
      setValidationErrors({ general: err instanceof Error ? err.message : 'Unknown error occurred' });
    }
    
    setIsValidating(false);
  };

  const addCurrentWallet = () => {
    if (connectedAddress) {
      const emptyMemberIndex = members.findIndex(member => !member.walletAddress.trim());
      
      if (emptyMemberIndex >= 0) {
        updateMember(members[emptyMemberIndex].id, 'walletAddress', connectedAddress);
        updateMember(members[emptyMemberIndex].id, 'name', 'Me');
      } else {
        const addressExists = members.some(member => 
          member.walletAddress.trim().toLowerCase() === connectedAddress.toLowerCase()
        );
        
        if (!addressExists) {
          const newId = (Math.max(...members.map(m => parseInt(m.id))) + 1).toString();
          setMembers([...members, { id: newId, name: 'Me', walletAddress: connectedAddress }]);
        }
      }
    }
  };

  const generateSampleData = () => {
    const sampleMembers: Member[] = [
      { id: '1', name: 'Alice Johnson', walletAddress: connectedAddress || '0x1234567890123456789012345678901234567890' },
      { id: '2', name: 'Bob Smith', walletAddress: '0x2345678901234567890123456789012345678901' },
      { id: '3', name: 'Carol Davis', walletAddress: '0x3456789012345678901234567890123456789012' }
    ];
    
    setVaultName('Community Savings Group');
    setMembers(sampleMembers);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 border border-red-400/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400">Configuration Required</h2>
          </div>
          <p className="text-red-300/80 mb-4">
            The SHG Factory contract address is not configured. 
          </p>
          <p className="text-sm text-red-300/60 bg-red-500/10 p-4 rounded-xl font-mono">
            Please set NEXT_PUBLIC_SHG_FACTORY_ADDRESS in your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-primary rounded-3xl border border-surface overflow-hidden">
        {/* Header */}
        <div className="relative p-8 border-b border-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create a New SHG Vault
            </h2>
            <p className="text-secondary">
              Set up a decentralized treasury for your Self-Help Group
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6 bg-surface-secondary">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center font-semibold transition-all duration-300
                  ${currentStep >= step 
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-surface-tertiary text-tertiary border border-surface'
                  }
                `}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`
                    w-24 h-1 ml-2 transition-all duration-500 rounded-full
                    ${currentStep > step 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                      : 'bg-surface-tertiary'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm mb-8">
            <span className={`transition-colors duration-300 ${currentStep >= 1 ? 'text-purple-400 font-semibold' : 'text-tertiary'}`}>
              Vault Details
            </span>
            <span className={`transition-colors duration-300 ${currentStep >= 2 ? 'text-purple-400 font-semibold' : 'text-tertiary'}`}>
              Add Members
            </span>
            <span className={`transition-colors duration-300 ${currentStep >= 3 ? 'text-purple-400 font-semibold' : 'text-tertiary'}`}>
              Review & Create
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {/* Step 1: Vault Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label htmlFor="vaultName" className="block text-sm font-semibold text-secondary mb-2">
                  Vault Name
                </label>
                <div className="relative">
                  <input
                    id="vaultName"
                    type="text"
                    value={vaultName}
                    onChange={(e) => {
                      setVaultName(e.target.value);
                      if (validationErrors.vaultName) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.vaultName;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => markFieldAsTouched('vaultName')}
                    placeholder="e.g., Community Savings Group"
                    className={`
                      w-full px-4 py-3 bg-surface-tertiary border rounded-xl transition-all
                      ${validationErrors.vaultName && touchedFields.has('vaultName')
                        ? 'border-red-400/50 focus:border-red-400'
                        : 'border-surface focus:border-purple-400'
                      }
                      text-primary placeholder-gray-400
                      focus:outline-none focus:bg-surface-secondary
                    `}
                  />
                  <Database className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                </div>
                {validationErrors.vaultName && touchedFields.has('vaultName') && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.vaultName}
                  </p>
                )}
                <p className="mt-2 text-sm text-tertiary">
                  Choose a meaningful name that members can easily identify
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30 rounded-2xl p-6">
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  What is an SHG Vault?
                </h3>
                <ul className="space-y-2 text-sm text-purple-200/80">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>A shared treasury managed by group members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>Members can contribute funds and request loans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>All decisions require member consensus (60% approval)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>Transparent and secure on the blockchain</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Add Members */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Vault Members</h3>
                  <p className="text-sm text-tertiary">Add at least 3 members to your vault</p>
                </div>
                <div className="flex gap-2">
                  {isConnected && (
                    <button
                      type="button"
                      onClick={addCurrentWallet}
                      className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-2 border border-purple-400/30"
                    >
                      <Wallet className="w-4 h-4" />
                      Add My Wallet
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={generateSampleData}
                    className="px-4 py-2 text-sm bg-surface-tertiary text-secondary rounded-xl hover:bg-surface-secondary transition-all border border-surface"
                  >
                    Use Sample Data
                  </button>
                </div>
              </div>

              {validationErrors.general && (
                <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <p className="text-sm text-red-300">{validationErrors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div 
                    key={member.id} 
                    className={`
                      bg-surface-secondary rounded-2xl p-6 border transition-all duration-300
                      ${hoveredMember === member.id
                        ? 'border-purple-400/50 bg-surface-tertiary shadow-lg shadow-purple-500/10'
                        : 'border-surface'
                      }
                    `}
                    onMouseEnter={() => setHoveredMember(member.id)}
                    onMouseLeave={() => setHoveredMember(null)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold">{index + 1}</span>
                        </div>
                        <h4 className="font-medium text-primary">Member {index + 1}</h4>
                      </div>
                      {members.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Remove member"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            onBlur={() => markFieldAsTouched(`member_${member.id}_name`)}
                            placeholder="Enter member's name"
                            className={`
                              w-full px-4 py-2.5 bg-surface-tertiary border rounded-xl transition-all
                              ${validationErrors[`member_${member.id}_name`] && touchedFields.has(`member_${member.id}_name`)
                                ? 'border-red-400/50 focus:border-red-400'
                                : 'border-surface focus:border-purple-400'
                              }
                              text-primary placeholder-gray-400
                              focus:outline-none focus:bg-surface-secondary
                            `}
                          />
                          <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                        </div>
                        {validationErrors[`member_${member.id}_name`] && touchedFields.has(`member_${member.id}_name`) && (
                          <p className="mt-1 text-xs text-red-400">{validationErrors[`member_${member.id}_name`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Wallet Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={member.walletAddress}
                            onChange={(e) => updateMember(member.id, 'walletAddress', e.target.value)}
                            onBlur={() => markFieldAsTouched(`member_${member.id}_walletAddress`)}
                            placeholder="0x..."
                            className={`
                              w-full px-4 py-2.5 bg-surface-tertiary border rounded-xl transition-all font-mono text-sm
                              ${validationErrors[`member_${member.id}_walletAddress`] && touchedFields.has(`member_${member.id}_walletAddress`)
                                ? 'border-red-400/50 focus:border-red-400'
                                : 'border-surface focus:border-purple-400'
                              }
                              text-primary placeholder-gray-400
                              focus:outline-none focus:bg-surface-secondary
                            `}
                          />
                          <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                        </div>
                        {validationErrors[`member_${member.id}_walletAddress`] && touchedFields.has(`member_${member.id}_walletAddress`) && (
                          <p className="mt-1 text-xs text-red-400">{validationErrors[`member_${member.id}_walletAddress`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMember}
                className="w-full py-3 border-2 border-dashed border-purple-400/30 text-purple-300 rounded-2xl hover:border-purple-400/50 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Member
              </button>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30 rounded-2xl p-6">
                <h3 className="font-semibold text-purple-300 mb-4">Review Your Vault</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-200/60 mb-1">Vault Name</p>
                    <p className="font-semibold text-primary text-lg">{vaultName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-purple-200/60 mb-2">Members ({members.filter(m => m.name.trim() && m.walletAddress.trim()).length})</p>
                    <div className="space-y-2">
                      {members.filter(m => m.name.trim() && m.walletAddress.trim()).map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3 bg-surface-tertiary p-3 rounded-xl border border-surface">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary">{member.name}</p>
                            <p className="text-xs text-tertiary font-mono">{formatAddress(member.walletAddress)}</p>
                          </div>
                          {member.walletAddress.toLowerCase() === connectedAddress?.toLowerCase() && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30">You</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-blue-200/80">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>A new vault contract will be deployed on the blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Each member will receive equal voting rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Members can start contributing funds immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span>Loan requests will require 60% member approval</span>
                  </li>
                </ul>
              </div>

              {/* Transaction Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                  <h4 className="font-medium text-red-300 mb-2">Transaction Error:</h4>
                  <p className="text-sm text-red-200/80">{error.message || 'An unknown error occurred'}</p>
                </div>
              )}

              {/* Success Message */}
              {isConfirmed && hash && (
                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-400/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-400 text-lg mb-2">Vault Created Successfully!</h4>
                      <p className="text-green-300/80 mb-3">
                        Your SHG vault "{vaultName}" has been deployed with {members.filter(m => m.name.trim() && m.walletAddress.trim()).length} members.
                      </p>
                      <div className="flex items-center gap-2 text-green-300 mb-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...</span>
                      </div>
                      <p className="text-xs text-green-300/60 font-mono bg-green-500/10 p-3 rounded-lg break-all">
                        Transaction: {hash}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isPending || isConfirming}
                className="px-6 py-3 bg-surface-tertiary text-primary rounded-xl hover:bg-surface-secondary transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-surface"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isConnected || isPending || isConfirming || isValidating || isCreating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  {!isConnected ? (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet First
                    </>
                  ) : isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Check Wallet...
                    </>
                  ) : isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Vault...
                    </>
                  ) : isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Vault Data...
                    </>
                  ) : isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create SHG Vault
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
