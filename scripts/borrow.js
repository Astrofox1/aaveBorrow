const { formatUnits } = require("ethers")
const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main(){
    // the protocol treats everything as ERC20 token
    await getWeth()
    const {deployer} = await getNamedAccounts()
    // Pool Address Provider : 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
    const pool = await getLendingPool(deployer)
    console.log(`Pool Address : ${pool.address}`)
    // deposit!
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve!
    await approveERC20(wethTokenAddress, pool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await pool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!");

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(pool, deployer)
    // borrow
    // how much we have borrowed, how much we have in collateral, how much we can borrow
    // // what is the conversion rate on DAI
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1/daiPrice.toNumber())
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())  
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(daiAddress, pool, amountDaiToBorrowWei, deployer)
    await getBorrowUserData(pool, deployer)
    await repay(amountDaiToBorrowWei, daiAddress, pool, deployer)
    await getBorrowUserData(pool, deployer)
}

async function repay(amount, daiAddress, pool, account){
    await approveERC20(daiAddress, pool.address, amount, account)
    const repayTx = await pool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!");
}

async function borrowDai(daiAddress, pool, amountDaiToBorrow, account){
    const borrowTx = await pool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've borrowed!");
}

async function getDaiPrice(){
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4")
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price
}
// async function getEthPrice(basePrice){
//     const EthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4")
//     const price = (await EthPriceFeed.latestRoundData())[1]
//     // console.log(`The ETH/USD price is ${price.toString()}`);
//     const ethPrice = await price * basePrice / 10**8
//     return ethPrice
// }

async function getBorrowUserData(pool, account){
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await pool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getLendingPool(account){
    const poolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account)
    const poolAddress = await poolAddressesProvider.getLendingPool()
    const pool = await ethers.getContractAt("ILendingPool", poolAddress, account)
    return pool
}

async function approveERC20(erc20Address, spenderAddress, amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

main()
    .then(()=> process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })