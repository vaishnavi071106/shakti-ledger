const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3004'],
  credentials: true,
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    console.log('Health check endpoint hit');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});

// Initialize Prisma after server setup
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma Client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Prisma Client:', error.message);
}

// Basic vault endpoints
app.get('/api/vaults', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const vaults = await prisma.vault.findMany({
      include: {
        members: true,
        _count: {
          select: {
            members: true,
            loanProposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: vaults,
      count: vaults.length,
    });
  } catch (error) {
    console.error('Error fetching vaults:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vaults',
      details: error.message,
    });
  }
});

app.post('/api/vaults', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { 
      contractAddress, 
      name, 
      creatorAddress, 
      network = 'sepolia',
      txHash,
      members = [] 
    } = req.body;

    console.log('Creating vault:', { contractAddress, name, creatorAddress, members: members.length });

    // Validate required fields
    if (!contractAddress || !name || !creatorAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contractAddress, name, creatorAddress',
      });
    }

    // Check if vault already exists
    const existingVault = await prisma.vault.findUnique({
      where: {
        contractAddress: contractAddress.toLowerCase(),
      },
    });

    if (existingVault) {
      return res.status(409).json({
        success: false,
        error: 'Vault with this contract address already exists',
        data: existingVault,
      });
    }

    // Create vault with members
    const vault = await prisma.vault.create({
      data: {
        contractAddress: contractAddress.toLowerCase(),
        name,
        creatorAddress: creatorAddress.toLowerCase(),
        network,
        txHash,
        members: {
          create: members.map((member) => ({
            walletAddress: member.address.toLowerCase(),
            displayName: member.name,
            role: member.address.toLowerCase() === creatorAddress.toLowerCase() ? 'creator' : 'member',
          })),
        },
      },
      include: {
        members: true,
      },
    });

    console.log('Vault created successfully:', vault.id);

    res.status(201).json({
      success: true,
      data: vault,
      message: 'Vault metadata created successfully',
    });
  } catch (error) {
    console.error('Error creating vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create vault',
      details: error.message,
    });
  }
});

// Get vaults for a user (MUST be before /api/vaults/:address)
app.get('/api/vaults/user/:walletAddress', async (req, res) => {
  console.log('User vaults endpoint hit:', req.params.walletAddress);
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { walletAddress } = req.params;
    
    const userVaults = await prisma.vaultMember.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
      },
      include: {
        vault: {
          include: {
            members: true,
            _count: {
              select: {
                members: true,
                loanProposals: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const vaults = userVaults.map(userVault => ({
      ...userVault.vault,
      userRole: userVault.role,
      joinedAt: userVault.joinedAt,
    }));

    res.json({
      success: true,
      data: { vaults },
      count: vaults.length,
    });
  } catch (error) {
    console.error('Error fetching user vaults:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user vaults',
      details: error.message,
    });
  }
});

// Get specific vault
app.get('/api/vaults/:address', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { address } = req.params;
    
    const vault = await prisma.vault.findUnique({
      where: {
        contractAddress: address.toLowerCase(),
      },
      include: {
        members: true,
        loanProposals: {
          include: {
            votes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found',
      });
    }

    res.json({
      success: true,
      data: vault,
    });
  } catch (error) {
    console.error('Error fetching vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vault',
      details: error.message,
    });
  }
});

// Check vote status
app.get('/api/loans/:proposalId/votes/:voterAddress', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { proposalId, voterAddress } = req.params;

    const vote = await prisma.loanVote.findUnique({
      where: {
        proposalId_voterAddress: {
          proposalId,
          voterAddress: voterAddress.toLowerCase(),
        },
      },
    });

    res.json({
      success: true,
      data: vote,
      hasVoted: !!vote,
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check vote status',
      details: error.message,
    });
  }
});

// Record a vote
app.post('/api/loans/:proposalId/votes', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    const { proposalId } = req.params;
    const { voterAddress, voteType, txHash } = req.body;

    if (!voterAddress || !voteType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: voterAddress, voteType',
      });
    }

    // Check if vote already exists
    const existingVote = await prisma.loanVote.findUnique({
      where: {
        proposalId_voterAddress: {
          proposalId,
          voterAddress: voterAddress.toLowerCase(),
        },
      },
    });

    if (existingVote) {
      return res.status(409).json({
        success: false,
        error: 'Vote already recorded for this proposal by this voter',
        data: existingVote,
      });
    }

    const vote = await prisma.loanVote.create({
      data: {
        voterAddress: voterAddress.toLowerCase(),
        voteType,
        txHash,
        proposalId,
      },
    });

    console.log('Vote recorded successfully:', vote.id);

    res.status(201).json({
      success: true,
      data: vote,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote',
      details: error.message,
    });
  }
});

// Loan Repayment Endpoints

// Record a loan repayment
app.post('/api/loans/:proposalId/repayments', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { amount, txHash } = req.body;

    if (!proposalId || !amount || !txHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: proposalId, amount, and txHash are required',
      });
    }

    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    // Verify the loan proposal exists
    const loanProposal = await prisma.loanProposal.findUnique({
      where: { id: proposalId },
    });

    if (!loanProposal) {
      return res.status(404).json({
        success: false,
        error: 'Loan proposal not found',
      });
    }

    // Record the repayment
    const repayment = await prisma.loanRepayment.create({
      data: {
        proposalId,
        amount: BigInt(amount),
        txHash,
      },
    });

    // Convert BigInt to string for JSON serialization
    const repaymentResponse = {
      ...repayment,
      amount: repayment.amount.toString(),
    };

    res.status(201).json({
      success: true,
      data: repaymentResponse,
    });
  } catch (error) {
    console.error('Error recording repayment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record repayment',
      details: error.message,
    });
  }
});

// Get loan repayments for a specific loan proposal
app.get('/api/loans/:proposalId/repayments', async (req, res) => {
  try {
    const { proposalId } = req.params;

    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    // Get all repayments for this loan proposal
    const repayments = await prisma.loanRepayment.findMany({
      where: { proposalId },
      orderBy: { repaidAt: 'desc' },
    });

    // Convert BigInt to string for JSON serialization
    const repaymentsResponse = repayments.map(repayment => ({
      ...repayment,
      amount: repayment.amount.toString(),
    }));

    // Calculate total repaid amount
    const totalRepaid = repayments.reduce((sum, repayment) => sum + repayment.amount, BigInt(0));

    res.json({
      success: true,
      data: {
        repayments: repaymentsResponse,
        totalRepaid: totalRepaid.toString(),
        count: repayments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching repayments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch repayments',
      details: error.message,
    });
  }
});

// Get loan summary with repayment status
app.get('/api/loans/:proposalId/summary', async (req, res) => {
  try {
    const { proposalId } = req.params;

    if (!prisma) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
      });
    }

    // Get loan proposal with repayments
    const loanProposal = await prisma.loanProposal.findUnique({
      where: { id: proposalId },
      include: {
        repayments: {
          orderBy: { repaidAt: 'desc' },
        },
        votes: true,
        vault: {
          select: {
            name: true,
            contractAddress: true,
          },
        },
      },
    });

    if (!loanProposal) {
      return res.status(404).json({
        success: false,
        error: 'Loan proposal not found',
      });
    }

    // Calculate total repaid amount
    const totalRepaid = loanProposal.repayments.reduce(
      (sum, repayment) => sum + repayment.amount, 
      BigInt(0)
    );

    const remainingAmount = loanProposal.amount - totalRepaid;
    const isFullyRepaid = remainingAmount <= 0;

    // Convert BigInt to string for JSON serialization
    const loanSummary = {
      id: loanProposal.id,
      loanId: loanProposal.loanId.toString(),
      borrowerAddress: loanProposal.borrowerAddress,
      amount: loanProposal.amount.toString(),
      purpose: loanProposal.purpose,
      status: loanProposal.status,
      createdAt: loanProposal.createdAt,
      vault: loanProposal.vault,
      repaymentStatus: {
        totalRepaid: totalRepaid.toString(),
        remainingAmount: remainingAmount.toString(),
        isFullyRepaid,
        repaymentsCount: loanProposal.repayments.length,
      },
      repayments: loanProposal.repayments.map(repayment => ({
        ...repayment,
        amount: repayment.amount.toString(),
      })),
      votes: loanProposal.votes,
    };

    res.json({
      success: true,
      data: loanSummary,
    });
  } catch (error) {
    console.error('Error fetching loan summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan summary',
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shakti Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET    /api/vaults - List all vaults`);
  console.log(`   POST   /api/vaults - Create vault metadata`);
  console.log(`   GET    /api/vaults/:address - Get vault details`);
  console.log(`   GET    /api/vaults/user/:address - Get user's vaults`);
  console.log(`   GET    /api/loans/:id/votes/:address - Check vote status`);
  console.log(`   POST   /api/loans/:id/votes - Record vote`);
  console.log(`   POST   /api/loans/:id/repayments - Record loan repayment`);
  console.log(`   GET    /api/loans/:id/repayments - Get loan repayments`);
  console.log(`   GET    /api/loans/:id/summary - Get loan summary with repayment status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});
