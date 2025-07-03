// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ZKVerifier.sol";

contract ShaktiVault is ERC20 {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 repaid;
        uint256 approvals;
        bool exists;
        bool disbursed;
        bool requiresZKProof;
        uint256 minCreditScore;
        bool zkProofVerified;
    }

    // --- State Variables ---
    IERC20 public immutable stablecoin;
    ZKVerifier public immutable zkVerifier;
    address[] public members;
    mapping(address => bool) public isMember;
    uint256 public memberCount;
    uint256 public constant APPROVAL_THRESHOLD_PERCENT = 60;
    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // --- Events ---
    event VaultCreated(address indexed creator, address[] initialMembers);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, bool requiresZKProof, uint256 minCreditScore);
    event LoanApproved(uint256 indexed loanId, address indexed member);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event RepaymentMade(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event ZKProofVerified(uint256 indexed loanId, address indexed borrower);

    // --- Errors ---
    error NotAMember();
    error AlreadyMember(address member);
    error LoanNotFound(uint256 loanId);
    error AlreadyVoted(uint256 loanId);
    error LoanAlreadyDisbursed(uint256 loanId);
    error NotBorrower(uint256 loanId);
    error NotDisbursed(uint256 loanId);
    error InvalidRepaymentAmount(uint256 requested, uint256 remaining);
    error ZKProofRequired(uint256 loanId);
    error ZKProofNotVerified(uint256 loanId);

    // --- Modifiers ---
    modifier onlyMember() {
        if (!isMember[msg.sender]) revert NotAMember();
        _;
    }

    modifier onlyBorrower(uint256 loanId) {
        Loan storage loan = loans[loanId];
        if (loan.borrower != msg.sender) revert NotBorrower(loanId);
        _;
    }

    // --- Constructor ---
    constructor(address[] memory _initialMembers, address _stablecoin) ERC20("Shakti Vault Token", "SVT") {
        require(_initialMembers.length >= 3, "Must have at least 3 members");
        stablecoin = IERC20(_stablecoin);
        zkVerifier = new ZKVerifier();

        memberCount = _initialMembers.length;
        uint256 initialShares = 1000 * 10 ** decimals();

        for (uint256 i = 0; i < memberCount;) {
            address m = _initialMembers[i];
            if (isMember[m]) revert AlreadyMember(m);
            isMember[m] = true;
            members.push(m);
            _mint(m, initialShares);
            unchecked {
                ++i;
            }
        }

        emit VaultCreated(msg.sender, _initialMembers);
    }

    // --- Loan Lifecycle Functions ---
    function requestLoan(uint256 amount) external onlyMember {
        _requestLoan(amount, false, 0);
    }
    
    function requestLoanWithZKProof(uint256 amount, uint256 minCreditScore) external onlyMember {
        require(minCreditScore >= 300 && minCreditScore <= 850, "Invalid credit score range");
        _requestLoan(amount, true, minCreditScore);
    }
    
    function _requestLoan(uint256 amount, bool requiresZKProof, uint256 minCreditScore) internal {
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            repaid: 0,
            approvals: 0,
            exists: true,
            disbursed: false,
            requiresZKProof: requiresZKProof,
            minCreditScore: minCreditScore,
            zkProofVerified: false
        });
        emit LoanRequested(loanId, msg.sender, amount, requiresZKProof, minCreditScore);
    }

    function submitZKProof(
        uint256 loanId,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC
    ) external onlyBorrower(loanId) {
        Loan storage loan = loans[loanId];
        if (!loan.exists) revert LoanNotFound(loanId);
        if (!loan.requiresZKProof) revert ZKProofRequired(loanId);
        if (loan.disbursed) revert LoanAlreadyDisbursed(loanId);
        
        // Submit proof to ZK verifier
        zkVerifier.submitProof(_pA, _pB, _pC, loan.minCreditScore);
        
        // Mark as verified
        loan.zkProofVerified = true;
        emit ZKProofVerified(loanId, msg.sender);
    }

    function approveLoan(uint256 loanId) external onlyMember {
        Loan storage loan = loans[loanId];
        if (!loan.exists) revert LoanNotFound(loanId);
        if (loan.disbursed) revert LoanAlreadyDisbursed(loanId);
        if (hasVoted[msg.sender][loanId]) revert AlreadyVoted(loanId);
        
        // Check ZK proof requirement
        if (loan.requiresZKProof && !loan.zkProofVerified) {
            revert ZKProofNotVerified(loanId);
        }

        hasVoted[msg.sender][loanId] = true;
        loan.approvals++;
        emit LoanApproved(loanId, msg.sender);

        // Disburse when threshold reached
        if (loan.approvals * 100 / memberCount >= APPROVAL_THRESHOLD_PERCENT) {
            loan.disbursed = true;
            stablecoin.transfer(loan.borrower, loan.amount);
            emit LoanDisbursed(loanId, loan.borrower, loan.amount);
        }
    }

    function repay(uint256 loanId, uint256 amount) external onlyBorrower(loanId) {
        Loan storage loan = loans[loanId];
        if (!loan.exists) revert LoanNotFound(loanId);
        if (!loan.disbursed) revert NotDisbursed(loanId);

        uint256 remaining = loan.amount - loan.repaid;
        if (amount == 0 || amount > remaining) revert InvalidRepaymentAmount(amount, remaining);

        stablecoin.transferFrom(msg.sender, address(this), amount);
        loan.repaid += amount;
        emit RepaymentMade(loanId, msg.sender, amount);
    }

    // --- View Helpers ---
    function getLoanApprovals(uint256 loanId) external view returns (uint256) {
        if (!loans[loanId].exists) revert LoanNotFound(loanId);
        return loans[loanId].approvals;
    }

    function getLoanDetails(uint256 loanId) external view returns (Loan memory) {
        if (!loans[loanId].exists) revert LoanNotFound(loanId);
        return loans[loanId];
    }
    
    function getZKVerifierAddress() external view returns (address) {
        return address(zkVerifier);
    }
}
