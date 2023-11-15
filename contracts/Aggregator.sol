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

    function approve(address spender, uint amount) external returns (bool);

}

interface IUniswapV2ERC20 {

    function transfer(address to, uint value ) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);
}

contract Aggregator {
    IWETH public dai;
    IWETH public weth;

    address public owner;

    address public constant wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant daiWETHpool = 0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8;
    address public constant wethDAIpool = 0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11;
    address public constant uniswapV2Router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    IUniswapV2Router02 public immutable uRouter;

    uint256 public pool1daiBalance;
    uint256 public pool1wethBalance;
    uint256 public pool2daiBalance;
    uint256 public pool2wethBalance;

    uint256 public K;
    uint256 public K1;
    uint256 public K2;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 constant PRECISION = 10**18;

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

    constructor() {
        pool1daiBalance = IWETH(daiAddress).balanceOf(daiWETHpool);
        pool1wethBalance = IWETH(wethAddress).balanceOf(daiWETHpool);
        pool2daiBalance = IWETH(daiAddress).balanceOf(wethDAIpool);
        pool2wethBalance = IWETH(wethAddress).balanceOf(wethDAIpool);
        K1 = pool1daiBalance * pool1wethBalance;
        K2 = pool2daiBalance * pool2wethBalance;
        owner = msg.sender;
        uRouter = IUniswapV2Router02(uniswapV2Router);
    }

    // Calculate WETH Output for Intended DAI Trade on DAI / WETH Pool
    function calculateDaiSwap(uint256 _token1Amount)
        public
        view
        returns (uint256 token2Amount)
        {
            uint256 token1After = pool1daiBalance + _token1Amount;
            uint256 token2After = K1 / token1After;
            token2Amount = pool1wethBalance - token2After;

            // Don't let the pool go to 0
            if (token2Amount == pool1wethBalance) {
                token2Amount--;
            }

            require(token2Amount < pool1wethBalance, "swap amount too large");
    }

    // Calculate DAI Output for Intended WETH Trade on WETH / DAI Pool
    function calculateWethSwap(uint256 _token2Amount)
        public
        view
        returns (uint256 token1Amount)
        {
            uint256 token2After = pool2wethBalance + _token2Amount;
            uint256 token1After = K2 / token2After;
            token1Amount = pool2daiBalance - token1After;

            // Don't let the pool go to 0
            if (token1Amount == pool2daiBalance) {
                token1Amount--;
            }

            require(token1Amount < pool2daiBalance, "swap amount too large");
    }

    // Enact DAI / WETH Swap on Testnet
    function uniswap1(uint256 _token1Amount)
        external
        returns(uint256 token2Amount)
        {

            // Use the money here!
            address[] memory path = new address[](2);

            path[0] = daiAddress;
            path[1] = wethAddress;

            // Do Swap
            IUniswapV2ERC20(daiAddress).transferFrom(msg.sender, address(this), _token1Amount);

            _swapOnUniswap(path, _token1Amount, 0);

            token2Amount = IERC20(wethAddress).balanceOf(address(this));

            pool1daiBalance += _token1Amount;
            pool1wethBalance -= token2Amount;

            IUniswapV2ERC20(wethAddress).transfer(msg.sender, token2Amount);

            // Emit an event
            emit Swap(
                msg.sender,
                address(daiAddress),
                _token1Amount,
                address(wethAddress),
                token2Amount,
                pool1daiBalance,
                pool1wethBalance,
                block.timestamp
            );
    }

    // Enact WETH / DAI Swap on Testnet
    function uniswap2(uint256 _token2Amount)
        external
        returns(uint256 token1Amount)
        {

            // Use the money here!
            address[] memory path = new address[](2);

            path[0] = wethAddress;
            path[1] = daiAddress;

            // Do Swap
            IUniswapV2ERC20(wethAddress).transferFrom(msg.sender, address(this), _token2Amount);

            _swapOnUniswap(path, _token2Amount, 0);

            token1Amount = IERC20(daiAddress).balanceOf(address(this));

            pool2wethBalance += _token2Amount;
            pool2daiBalance -= token1Amount;

            IUniswapV2ERC20(daiAddress).transfer(msg.sender, token1Amount);
            
            // Emit an event
            emit Swap(
                msg.sender,
                address(wethAddress),
                _token2Amount,
                address(daiAddress),
                token1Amount,
                pool2daiBalance,
                pool2wethBalance,
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


}
