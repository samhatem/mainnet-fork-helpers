import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { MaxUint256 } from "@ethersproject/constants";
import { Signer } from "@ethersproject/abstract-signer";

type Provider = {
    request: (req: { method: string, params: any[] }) => Promise<unknown>;
}

// address probably has some ETH
const COMPOUND_ETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

const UNISWAP_V2_ROUTER_02 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const fundAccountETH = async (
    account: string,
    amount: BigNumber,
    hardhatProvider: Provider,
    getSigner: (address: string) => Promise<Signer>,
): Promise<void> => {
    await hardhatProvider.request({
        method: "hardhat_impersonateAccount",
        params: [COMPOUND_ETH],
    });

    const signer = await getSigner(COMPOUND_ETH);

    await signer.sendTransaction({
        to: account,
        value: amount,
    });

    await hardhatProvider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [COMPOUND_ETH],
    });
};

// buy USDC on uniswap v2
export const fundAccountUSDC = async (
    account: Signer,
    sellAmount: BigNumber,
    usdc: string,
): Promise<void> => {
    const uniRouter = new Contract(
        UNISWAP_V2_ROUTER_02,
        ["function swapExactETHForTokens(uint, address[] calldata, address, uint) external payable"],
        account,
    );

    const path = [WETH_ADDRESS, usdc];

    await uniRouter.swapExactETHForTokens(1, path, await account.getAddress(), MaxUint256, { value: sellAmount });
};
