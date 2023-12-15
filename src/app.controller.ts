import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from './app.service';
import type { BlockchainWallet } from "@rarible/sdk-wallet";
import { createRaribleSdk } from "@rarible/sdk";
import { toCollectionId, toUnionAddress } from "@rarible/types";
import { MintType } from "@rarible/sdk/build/types/nft/mint/prepare";


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //오프체인에서 lazy mint로 테스트
  @Post('/mintOffChain')
  async mintOffChain(wallet: BlockchainWallet, contractAddress: string ): Promise<string> {
    const sdk = createRaribleSdk(wallet,"dev")

    const mintAction = await sdk.nft.mint({
      collectionId: toCollectionId(contractAddress),
      uri: "ipfs://QmZQ5i2fQq1e6jyj5p6cXq7eX5K7U3M8eWg8Y5k6W4sY1p",
      creators: [{ account: toUnionAddress("0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c"), value: 10000 }],
      royalties: [
        {
          account: toUnionAddress('0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c'),
          value: 1000,
        }
      ],
      lazyMint: true,
      supply: 1,
    })
    if (mintAction.type === MintType.OFF_CHAIN) {
      return mintAction.itemId
    }
  }


  //온체인에서 lazy mint로 테스트
  @Post('/mintOnChain')
  async mintOnChain(wallet: BlockchainWallet, contractAddress: string ): Promise<string> {
    const sdk = createRaribleSdk(wallet,"dev")
    const mintAction = await sdk.nft.mint({
      collectionId: toCollectionId(contractAddress),
      uri: "ipfs://QmZQ5i2fQq1e6jyj5p6cXq7eX5K7U3M8eWg8Y5k6W4sY1p",
      creators: [{ account: toUnionAddress("0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c"), value: 10000 }],
      royalties: [
        {
          account: toUnionAddress('0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c'),
          value: 1000,
        }
      ],
      lazyMint: false,
      supply: 1,
    })
    if (mintAction.type === MintType.ON_CHAIN) {
      await mintAction.transaction.wait()
      return mintAction.itemId
    }
  }

  //token id로 민팅 테스트
  @Post('/mintByTokenId')
  async mintByTokenId(wallet: BlockchainWallet, contractAddress: string, tokenId: string): Promise<string> {
    const sdk = createRaribleSdk(wallet,"dev")
    const collectionId = toCollectionId(contractAddress)
    const tokenId = await sdk.nft.generateTokenId({
      collection: collectionId,
      minter: toUnionAddress("0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c"),
    })
    const mintAction = await sdk.nft.mint({
      collectionId,
      tokenId,
      uri: "ipfs://QmZQ5i2fQq1e6jyj5p6cXq7eX5K7U3M8eWg8Y5k6W4sY1p",
      creators: [{ account: toUnionAddress("0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c"), value: 10000 }],
      royalties: [
        {
          account: toUnionAddress('0xeE0E7938949573bfC2B21A5E4b7dc10494607a4c'),
          value: 1000,
        }
      ],
      lazyMint: false,
      supply: 1,
    })
    // @ts-ignore
    if(mintAction.type === MintType.ON_CHAIN) {
      // @ts-expect-error
      await mintAction.transaction.wait()
      // @ts-ignore
      return mintAction.itemId
    }
  }
}
