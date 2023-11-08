// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

interface IWETH is IERC20 {

    function deposit() external payable;

    function withdraw(uint256 amount) external;

    function balanceOf(address account) external view returns (uint256);

}

interface IUniswapV2ERC20 {

    function transfer(address to, uint value ) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IUniswapV2Pair {

    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;

    function approve(address spender, uint value) external returns (bool);

}

contract AMM {
    Token public token1;
    Token public token2;

    IWETH public dai;
    IWETH public weth;
    uint256 public poolDAIbalance;
    uint256 public poolWETHbalance;

    address public owner;

    address public constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant daiWETHpool = 0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8;
    address public constant uniswapV2Router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    IUniswapV2Router02 public immutable uRouter;

    uint256 public token1Balance;
    uint256 public token2Balance;
    uint256 public K;
    uint256 public K1;

    uint256 public listCount;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 constant PRECISION = 10**18;

    mapping(uint256 => address) public dexlist;

    event Swap(
        address user,
        address tokenGive,
        uint256 tokenGiveAmount,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 token1Balance,
        uint256 token2Balance,
        uint256 timestamp
    );

    constructor(Token _token1, Token _token2) {
        token1 = _token1;
        token2 = _token2;
        listCount = 0;
        poolDAIbalance = IWETH(daiAddress).balanceOf(daiWETHpool);
        poolWETHbalance = IWETH(wethAddress).balanceOf(daiWETHpool);
        K1 = poolDAIbalance * poolWETHbalance;
        owner = msg.sender;
        uRouter = IUniswapV2Router02(uniswapV2Router);
    }

    function addDEXList(address _newDEX) public {
        dexlist[listCount] = _newDEX;
        listCount++;
    }

    function addLiquidity(uint256 _token1Amount, uint256 _token2Amount) external {
        // Deposit Tokens
        require(
            token1.transferFrom(msg.sender, address(this), _token1Amount),
            "failed to transfer token 1"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _token2Amount),
            "failed to transfer token 2"
        );

        // Issue Shares
        uint256 share;

        // If first time adding liquidity, make share 100
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint256 share1 = (totalShares * _token1Amount) / token1Balance;
            uint256 share2 = (totalShares * _token2Amount) / token2Balance;
            require(
                (share1 / 10**3) == (share2 / 10**3),
                "must provide equal token amounts"
            );
            share = share1;
        }

        // Manage Pool
        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance;

        // Updates shares
        totalShares += share;
        shares[msg.sender] += share;
    }

    // Calculate Token 2 Deposit Requirement When Inputting Token 1
    function calculateToken2Deposit(uint256 _token1Amount)
            public
            view
            returns (uint256 token2Amount)
        {
        token2Amount = (token2Balance * _token1Amount) / token1Balance;
    }

    // Calculate Token 1 Deposit Requirement When Inputting Token 2
    function calculateToken1Deposit(uint256 _token2Amount)
            public
            view
            returns (uint256 token1Amount)
        {
        token1Amount = (token1Balance * _token2Amount) / token2Balance;
    }

    // Calculate Token 2 Output for Intended Token 1 Trade
    function calculateToken1Swap(uint256 _token1Amount)
        public
        view
        returns (uint256 token2Amount)
        {
            uint256 token1After = token1Balance + _token1Amount;
            uint256 token2After = K / token1After;
            token2Amount = token2Balance - token2After;

            // Don't let the pool go to 0
            if (token2Amount == token2Balance) {
                token2Amount--;
            }

            require(token2Amount < token2Balance, "swap amount too large");
    }

    // Calculate Token 1 Output for Intended Token 2 Trade
    function calculateToken2Swap(uint256 _token2Amount)
        public
        view
        returns (uint256 token1Amount)
        {
            uint256 token2After = token2Balance + _token2Amount;
            uint256 token1After = K / token2After;
            token1Amount = token1Balance - token1After;

            // Don't let the pool go to 0
            if (token1Amount == token1Balance) {
                token1Amount--;
            }

            require(token1Amount < token1Balance, "swap amount too large");
    }

    // Calculate WETH Output for Intended DAI Trade
    function calculateDaiSwap(uint256 _token1Amount)
        public
        view
        returns (uint256 token2Amount)
        {
            uint256 token1After = poolDAIbalance + _token1Amount;
            uint256 token2After = K1 / token1After;
            token2Amount = poolWETHbalance - token2After;

            // Don't let the pool go to 0
            if (token2Amount == poolWETHbalance) {
                token2Amount--;
            }

            require(token2Amount < poolWETHbalance, "swap amount too large");
    }

    // Calculate DAI Output for Intended WETH Trade
    function calculateWethSwap(uint256 _token2Amount)
        public
        view
        returns (uint256 token1Amount)
        {
            uint256 token2After = poolWETHbalance + _token2Amount;
            uint256 token1After = K1 / token2After;
            token1Amount = poolDAIbalance - token1After;

            // Don't let the pool go to 0
            if (token1Amount == poolDAIbalance) {
                token1Amount--;
            }

            require(token1Amount < poolDAIbalance, "swap amount too large");
    }

    // Enact Token 1 Swap for Fictitious Token Pair
    function swapToken1(uint256 _token1Amount)
        external
        returns(uint256 token2Amount)
        {
            // Calculate Token 2 Amount
            token2Amount = calculateToken1Swap(_token1Amount);

            // Do Swap
            token1.transferFrom(msg.sender, address(this), _token1Amount);
            token1Balance += _token1Amount;
            token2Balance -= token2Amount;
            token2.transfer(msg.sender, token2Amount);

            // Emit an event
            emit Swap(
                msg.sender,
                address(token1),
                _token1Amount,
                address(token2),
                token2Amount,
                token1Balance,
                token2Balance,
                block.timestamp
            );
    }

    // Enact Token 2 Swap for Fictitious Token Pair
    function swapToken2(uint256 _token2Amount)
        external
        returns(uint256 token1Amount)
        {
            // Calculate Token 1 Amount
            token1Amount = calculateToken2Swap(_token2Amount);

            // Do Swap
            token2.transferFrom(msg.sender, address(this), _token2Amount);
            token2Balance += _token2Amount;
            token1Balance -= token1Amount;
            token1.transfer(msg.sender, token1Amount);

            // Emit an event
            emit Swap(
                msg.sender,
                address(token2),
                _token2Amount,
                address(token1),
                token1Amount,
                token1Balance,
                token2Balance,
                block.timestamp
            );
    }

    // Enact DAI / WETH Swap on Testnet Using DAI
    function uniswap1(uint256 _token1Amount)
        external
        returns(uint256 token2Amount)
        {
            // Calculate Token 2 Amount
            token2Amount = calculateDaiSwap(_token1Amount);

            // Use the money here!
            address[] memory path = new address[](2);

            path[0] = daiAddress;
            path[1] = wethAddress;

            // Do Swap
            IUniswapV2ERC20(daiAddress).transferFrom(msg.sender, address(this), _token1Amount);

            _swapOnUniswap(path, _token1Amount, 0);

            poolDAIbalance += _token1Amount;
            poolWETHbalance -= token2Amount;

            IUniswapV2ERC20(wethAddress).transfer(msg.sender, token2Amount);

            // Emit an event
            emit Swap(
                msg.sender,
                address(daiAddress),
                _token1Amount,
                address(wethAddress),
                token2Amount,
                poolDAIbalance,
                poolWETHbalance,
                block.timestamp
            );
    }

    // Enact DAI / WETH Swap on Testnet Using WETH
    function uniswap2(uint256 _token2Amount)
        external
        returns(uint256 token1Amount)
        {
            // Calculate Token 1 Amount
            token1Amount = calculateWethSwap(_token2Amount);

            // Use the money here!
            address[] memory path = new address[](2);

            path[0] = wethAddress;
            path[1] = daiAddress;

            // Do Swap
            IUniswapV2ERC20(wethAddress).transferFrom(msg.sender, address(this), _token2Amount);

            _swapOnUniswap(path, _token2Amount, 0);

            poolWETHbalance += _token2Amount;
            poolDAIbalance -= token1Amount;

            IUniswapV2ERC20(daiAddress).transfer(msg.sender, token1Amount);
            
            // Emit an event
            emit Swap(
                msg.sender,
                address(wethAddress),
                _token2Amount,
                address(daiAddress),
                token1Amount,
                poolDAIbalance,
                poolWETHbalance,
                block.timestamp
            );
    }

    // Special Internal Function for Uniswap Testnet Functionality
    function _swapOnUniswap(
        address[] memory _path,
        uint256 _amountIn,
        uint256 _amountOut
        ) internal {
            require(
                IERC20(_path[0]).approve(address(uRouter), _amountIn),
                "Uniswap approval failed."
            );

            uRouter.swapExactTokensForTokens(
                _amountIn,
                _amountOut,
                _path,
                address(this),
                (block.timestamp + 1200)
            );
    }

    // Determine how many tokens will be withdrawn
    function calculateWithdrawAmount(uint256 _share)
        public
        view
        returns(uint256 token1Amount, uint256 token2Amount)
        {
            require(_share <= totalShares, "must be less than total shares");
            token1Amount = (_share * token1Balance) / totalShares;
            token2Amount = (_share * token2Balance) / totalShares;
    }

    // Removes liquidity from the pool
    function removeLiquidity(uint256 _share)
        external
        returns(uint256 token1Amount, uint256 token2Amount)
        {
            require(
                _share <= shares[msg.sender],
                "cannot withdraw more shares than you have"
            );

            (token1Amount, token2Amount) = calculateWithdrawAmount(_share);

            shares[msg.sender] -= _share;
            totalShares -= _share;

            token1Balance -= token1Amount;
            token2Balance -= token2Amount;
            K = token1Balance * token2Balance;

            token1.transfer(msg.sender, token1Amount);
            token2.transfer(msg.sender, token2Amount);
    }
}
